import { X } from "lucide-react";

export function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-5" onClick={onClose}>
      <div className="w-full overflow-hidden rounded-3xl border border-[#E2D4BC] bg-[#FFFCF6] shadow-2xl" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#E2D4BC] px-6 py-5">
          <h3 className="text-lg font-semibold font-serif text-[#3C2A1E]">{title}</h3>
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#6B5544] transition hover:bg-[#F6EFE3]" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
