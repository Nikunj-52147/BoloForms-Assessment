export default function FieldRenderer({ field, onChange, onDelete }) {
  const enableEdit = () => {
    onChange({
      isEditing: true,
      isFinal: false,
    });
  };

  const DeleteButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="absolute -top-7 -right-2 w-5 h-5 
                  bg-red-600 text-white rounded-full 
                  text-xs flex items-center justify-center
                  hover:bg-red-700 z-50  pointer-events-auto"
    >
      ✕
    </button>
  );

  switch (field.type) {
    /* ---------------- TEXT ---------------- */
    case "text":
      return (
        <>
          {!field.isFinal && DeleteButton}
          <textarea
            value={field.value || ""}
            placeholder="Enter text"
            readOnly={!field.isEditing}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => {
              e.stopPropagation();
              enableEdit();
            }}
            onChange={(e) => onChange({ value: e.target.value })}
            onBlur={() =>
              onChange({
                isEditing: false,
                isFinal: true,
              })
            }
            className={`
              w-full h-full
              bg-transparent
              outline-none
              text-sm
              px-1 py-1
              resize-none
              ${
                field.isEditing
                  ? "cursor-text pointer-events-auto"
                  : "cursor-default pointer-events-none"
              }`}
          />
        </>
      );

    /* ---------------- DATE ---------------- */
    case "date":
      return (
        <>
          {!field.isFinal && DeleteButton}
          <input
            type="date"
            value={field.value || ""}
            readOnly={!field.isEditing}
            onDoubleClick={(e) => {
              e.stopPropagation();
              enableEdit();
            }}
            onChange={(e) => onChange({ value: e.target.value })}
            onBlur={() =>
              onChange({
                isEditing: false,
                isFinal: true,
              })
            }
            className="w-full h-full bg-transparent outline-none text-sm px-1"
          />
        </>
      );

    /* ---------------- RADIO ---------------- */
    case "radio":
      return (
        <>
          {!field.isFinal && DeleteButton}
          <input
            type="radio"
            checked={field.value === true}
            onClick={(e) => {
              e.stopPropagation();
              if (!field.isEditing) {
                enableEdit();
                return;
              }
              onChange({
                value: true,
                isEditing: false,
                isFinal: true,
              });
            }}
          />
        </>
      );

    /* ---------------- IMAGE ---------------- */
    case "image":
      return field.image ? (
        <>
          {!field.isFinal && DeleteButton}
          <img
            src={field.image}
            alt="uploaded"
            onDoubleClick={enableEdit}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: field.isEditing ? "auto" : "none",
            }}
          />
        </>
      ) : (
        <>
          {!field.isFinal && DeleteButton}
          <label className="text-xs cursor-pointer">
            Upload
            <input
              type="file"
              accept="image/*"
              hidden
              onDoubleClick={enableEdit}
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () =>
                  onChange({
                    image: reader.result,
                  });
                reader.readAsDataURL(file);
              }}
              onBlur={() => onChange({ isEditing: false, isFinal: true })}
            />
          </label>
        </>
      );

    /* ---------------- SIGNATURE ---------------- */
    case "signature":
      return field.image ? (
        <>
          {!field.isFinal && DeleteButton}
          <img
            src={field.image}
            alt="signature"
            onDoubleClick={enableEdit}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: field.isEditing ? "auto" : "none",
            }}
          />
        </>
      ) : (
        <>
          {!field.isFinal && DeleteButton}
          <div className="text-xs text-gray-600">Click to Sign</div>
        </>
      );

    default:
      return null;
  }
}
