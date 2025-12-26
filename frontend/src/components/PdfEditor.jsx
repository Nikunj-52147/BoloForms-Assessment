import { Document, Page } from "react-pdf";
import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import FieldToolbar from "./FieldToolbar";
import FieldRenderer from "./FieldRenderer";
import SignatureModal from "./SignatureModal";

export default function PdfEditor() {
  const pageRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeSignatureField, setActiveSignatureField] = useState(null);

  const [pageSize, setPageSize] = useState({
    width: 0,
    height: 0,
  });
  const [fields, setFields] = useState([]);

  const addField = (type) => {
    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        page: 1,

        // Relative coordinates
        xPct: 0.42,
        yPct: 0.31,
        wPct: 0.25,
        hPct: 0.08,

        value: "",
        image: null,
        checked: false,
        isFinal: false,
        isEditing: true,
      },
    ]);
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const updateField = (id, updates) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const finishEdit = (id) => {
    updateField(id, {
      isEditing: false,
      isFinal: true,
    });
  };

  const burnSignature = async (field) => {
    try {
      // 1️. Fetch the currently displayed PDF as Blob
      const response = await fetch("/sample.pdf"); 
      const pdfBlob = await response.blob();

      // 2️. Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onload = async () => {
        const pdfBase64 = reader.result;

        // 3️. Prepare payload
        const payload = {
          pdfBase64, // base64 string of PDF
          signature: field.image, // base64 string of signature
          coordinates: {
            xPct: field.xPct,
            yPct: field.yPct,
            wPct: field.wPct,
            hPct: field.hPct,
            page: field.page,
          },
        };

        // 4️. Send to backend
        const res = await fetch(`https://boloforms-assessment-2.onrender.com`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("Signed PDF URL:", data.url);
        alert("PDF signed successfully!");
      };
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!pageRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setPageWidth(width);
    });

    observer.observe(pageRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-screen">
      <FieldToolbar onAddField={addField} />

      <div className="flex-1 overflow-auto bg-gray-100 p-6">
       
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "16px",
          }}
        >
          <div
            ref={pageRef}
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <Document
              file="/sample.pdf"
              onLoadSuccess={() => console.log("PDF loaded")}
              onLoadError={(err) => console.error("PDF error", err)}
            >
              {pageWidth > 0 && (
                <Page
                  pageNumber={1}
                  width={pageWidth}
                  onRenderSuccess={() => {
                    const canvas = pageRef.current.querySelector("canvas");
                    if (!canvas) return;

                    setPageSize({
                      width: canvas.offsetWidth,
                      height: canvas.offsetHeight,
                    });
                  }}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              )}
            </Document>

            {activeSignatureField && (
              <SignatureModal
                onClose={() => setActiveSignatureField(null)}
                onSave={(signatureImage) => {
                  console.log("SIGNATURE SAVED", signatureImage);
                  updateField(activeSignatureField, {
                    image: signatureImage,
                    isFinal: true,
                    isEditing: false,
                  });
                  setActiveSignatureField(null);
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: pageSize.width,
                height: pageSize.height,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  fields.forEach((f) => {
                    if (f.isEditing) {
                      finishEdit(f.id);
                    }
                  });
                }
              }}
            >
              {fields.map((field) => (
                <Rnd
                  key={field.id}
                  bounds="parent"
                  disableDragging={!field.isEditing}
                  enableResizing={field.isEditing}
                  size={{
                    width: field.wPct * pageSize.width,
                    height: field.hPct * pageSize.height,
                  }}
                  position={{
                    x: field.xPct * pageSize.width,
                    y: field.yPct * pageSize.height,
                  }}
                  onDragStop={(e, d) => {
                    updateField(field.id, {
                      xPct: d.x / pageSize.width,
                      yPct: d.y / pageSize.height,
                    });
                  }}
                  onResizeStop={(e, dir, ref, delta, pos) => {
                    updateField(field.id, {
                      wPct: ref.offsetWidth / pageSize.width,
                      hPct: ref.offsetHeight / pageSize.height,
                      xPct: pos.x / pageSize.width,
                      yPct: pos.y / pageSize.height,
                    });
                  }}
                  style={{
                    border: field.isFinal ? "none" : "2px solid #2563eb",
                    background: field.isFinal
                      ? "transparent"
                      : "rgba(37, 99, 235, 0.1)",
                    cursor: field.isEditing ? "move" : "default",
                  }}
                >
                  <div
                    className="w-full h-full bg-white/60 flex items-center justify-center"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      updateField(field.id, {
                        isEditing: true,
                        isFinal: false,
                      });
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        field.type === "signature" &&
                        field.isEditing &&
                        !field.image
                      ) {
                        setActiveSignatureField(field.id);
                      }
                    }}
                  >
                    <FieldRenderer
                      field={field}
                      onChange={(updates) => updateField(field.id, updates)}
                      onDelete={() => removeField(field.id)}
                    />
                  </div>
                </Rnd>
              ))}
            </div>
          </div>
          <button
            className="mt-4 p-2 bg-blue-600 text-white rounded"
            onClick={async () => {
              for (const f of fields) {
                if (f.type === "signature" && f.image) {
                  await burnSignature(f);
                }
              }
            }}
          >
            Burn Signature to PDF
          </button>
        </div>
      </div>
    </div>
  );
}
