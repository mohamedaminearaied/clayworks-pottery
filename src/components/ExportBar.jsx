import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Download, ChevronDown, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportBar({ title, columns, rows, filename, onPrint }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function exportExcel() {
    const plain = rows.map((row) => {
      const o = {};
      columns.forEach((c) => (o[c.label] = row[c.key]));
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(plain);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 30));
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setOpen(false);
  }

  function exportCSV() {
    const esc = (value) => {
      const s = value === null || value === undefined ? "" : String(value);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = columns.map((c) => esc(c.label)).join(",");
    const body = rows.map((row) => columns.map((c) => esc(row[c.key])).join(",")).join("\n");
    downloadBlob(`${header}\n${body}`, `${filename}.csv`, "text/csv;charset=utf-8;");
    setOpen(false);
  }

  function printPDF() {
    onPrint({ title, columns, rows });
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="sm" className="inline-flex items-center gap-2" onClick={() => setOpen((o) => !o)}>
        <Download size={14} /> Export <ChevronDown size={13} />
      </Button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 z-20 w-47.5 overflow-hidden rounded-[10px] border border-[#E2D4BC] bg-[#FFFCF6] shadow-[0_8px_20px_rgba(60,42,30,0.14)]">
          {[
            { label: "Export as CSV", icon: FileSpreadsheet, fn: exportCSV },
            { label: "Export as Excel", icon: FileSpreadsheet, fn: exportExcel },
            { label: "Print / Save as PDF", icon: Printer, fn: printPDF },
          ].map(({ label, icon: Icon, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#3C2A1E] transition hover:bg-[#F6EFE3]"
            >
              <Icon size={14} color="#6B5544" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
