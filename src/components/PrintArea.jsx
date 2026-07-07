export function PrintArea({ data }) {
  if (!data) return null;
  const { title, columns, rows } = data;
  return (
    <div id="print-root" className="hidden print:block print:p-6 print:text-[#1a1a1a]">
      <h2 className="mb-1 text-xl font-semibold font-serif">Ember & Clay</h2>
      <p className="mb-5 text-sm text-[#555]">{title} — generated {new Date().toLocaleDateString()}</p>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="border-b-[1.5px] border-[#999] px-2 py-1 text-left text-[12px]">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className="border-b border-[#ccc] px-2 py-1 text-[12px]">{String(row[c.key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
