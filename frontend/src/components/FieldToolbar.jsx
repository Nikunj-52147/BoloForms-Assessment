const fields = [
  { type: "text", label: "Text" },
  { type: "date", label: "Date" },
  { type: "signature", label: "Signature" },
  { type: "radio", label: "Radio" },
  { type: "image", label: "Image" },
];

export default function FieldToolbar({ onAddField }) {
  return (
    <div className="w-48 border-r p-3 space-y-2 bg-gray-50">
      <h3 className="font-semibold pb-3">Fields</h3>

      {fields.map((field) => (
        <button
          key={field.type}
          onClick={() => onAddField(field.type)}
          className="w-full text-left px-3 py-2 bg-white border rounded hover:bg-gray-100"
        >
          {field.label}
        </button>
      ))}
    </div>
  );
}
