import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

export default function ActionMenu({
  isOpen,
  anchorEl,
  options,
  onSelect,
  onClose,
  isDisabled,
  zIndex = 9999,
}) {
  const menuRef = useRef(null);

  const position = useMemo(() => {
    if (!isOpen || !anchorEl) {
      return { top: 0, left: 0, transform: "translateX(-100%)" };
    }

    const anchorRect = anchorEl.getBoundingClientRect();
    return {
      top: anchorRect.bottom + 8,
      left: anchorRect.right,
      transform: "translateX(-100%)",
    };
  }, [isOpen, anchorEl]);

  useEffect(() => {
    if (!isOpen || !anchorEl) return;

    const handleDocumentClick = (event) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target)) return;
      if (anchorEl.contains(event.target)) return;
      onClose();
    };

    document.addEventListener("pointerdown", handleDocumentClick);
    return () =>
      document.removeEventListener("pointerdown", handleDocumentClick);
  }, [isOpen, anchorEl, onClose]);

  if (!isOpen || !anchorEl) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="inline-block bg-white shadow-lg rounded-xl ring-1 ring-slate-200"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        transform: position.transform,
        zIndex,
      }}
      role="menu"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            if (isDisabled(option.value)) return;
            onSelect(option.value);
          }}
          disabled={isDisabled(option.value)}
          className="block px-4 py-3 text-sm text-left transition-colors w-max text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {option.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
