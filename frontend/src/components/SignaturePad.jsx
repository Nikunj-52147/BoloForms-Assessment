import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

export default function SignaturePad({ onSave }) {
  const sigRef = useRef(null);

  const handleSave = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("Please draw a signature first");
      return;
    }

    const image = sigRef.current.toDataURL("image/png");
    onSave(image); 
  };

  return (
    <div>
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{
          width: 480,
          height: 200,
          className: "border",
        }}
      />

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={() => sigRef.current.clear()}>
          Clear
        </button>

        <button
          style={{
            background: "#16a34a",
            color: "white",
            padding: "4px 12px",
            borderRadius: 4,
          }}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
