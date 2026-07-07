import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/forms"

export function Pagination({
  pageIndex,
  pageCount,
  pageSize,
  pageSizes = [10, 20, 30, 50],
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-b-[14px] bg-[#FFFCF6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B5544]">
        <Button variant="outline" size="sm" onClick={() => onPageChange(0)} disabled={pageIndex === 0}>
          First
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(0, pageIndex - 1))} disabled={pageIndex === 0}>
          Previous
        </Button>
        <span className="font-medium">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(pageCount - 1, pageIndex + 1))} disabled={pageIndex >= pageCount - 1}>
          Next
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>
          Last
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B5544]">
        <span>Rows per page</span>
        <Select
          value={`${pageSize}`}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="w-25"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
