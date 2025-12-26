import SignaturePad from "./SignaturePad";

export default function SignatureModal({ onClose, onSave }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 8,
          width: 520,
          padding: 16,
        }}
      >
        <h3 style={{ marginBottom: 8 }}>Draw Signature</h3>

        <SignaturePad
          onSave={(img) => {
            onSave(img);
            onClose();
          }}
        />

        <div style={{ textAlign: "right", marginTop: 8 }}>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
