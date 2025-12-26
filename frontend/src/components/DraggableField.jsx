import { useRef, useState } from "react";

export default function DraggableField({ field, onUpdate }) {
  const ref = useRef(null);
  const [resizing, setResizing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 });

  /* ---------- DRAG ---------- */
  const onMouseDownDrag = (e) => {
    e.stopPropagation();
    setDragging(true);
    startPos.current = {
      x: e.clientX - field.x,
      y: e.clientY - field.y,
    };
  };

  /* ---------- RESIZE ---------- */
  const onMouseDownResize = (e) => {
    e.stopPropagation();
    setResizing(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      w: field.width,
      h: field.height,
    };
  };

  /* ---------- MOVE ---------- */
  const onMouseMove = (e) => {
    if (dragging) {
      onUpdate({
        ...field,
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y,
      });
    }

    if (resizing) {
      const newWidth = Math.max(50, startPos.current.w + (e.clientX - startPos.current.x));
      const newHeight = Math.max(30, startPos.current.h + (e.clientY - startPos.current.y));

      onUpdate({
        ...field,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const stopActions = () => {
    setDragging(false);
    setResizing(false);
  };

  return (
    <>
      {(dragging || resizing) && (
        <div
          className="fixed inset-0 z-50"
          onMouseMove={onMouseMove}
          onMouseUp={stopActions}
        />
      )}

      <div
        ref={ref}
        onMouseDown={onMouseDownDrag}
        style={{
          position: "absolute",
          left: field.x,
          top: field.y,
          width: field.width,
          height: field.height,
        }}
        className="border-2 border-blue-500 bg-blue-100/40 cursor-move select-none"
      >
        {/* Field Label */}
        <div className="p-1 text-xs text-blue-700 font-medium">
          {field.type}
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={onMouseDownResize}
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 cursor-se-resize"
        />
      </div>
    </>
  );
}
