import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  totalPages?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  disableSearch?: boolean; 
}

function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found",
  className,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  page,
  totalPages,
  totalRecords,
  onPageChange,
  disableSearch = false,
}: DataTableProps<T>) {

  const hasHeaderElements = onSearchChange || totalRecords !== undefined;
  const hasPagination = onPageChange && page !== undefined && totalPages !== undefined;

  return (
    <div className={cn("bg-card rounded-xl border border-border shadow-sm overflow-hidden", className)}>

      {/* Header with Search and Stats */}
      {hasHeaderElements && (
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
              disabled={disableSearch}
            />
          </div>
          {totalRecords !== undefined && (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              Total Records: {totalRecords}
            </div>
          )}
        </div>
      )}

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="ui-table w-full">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Loading Data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-muted-foreground italic">
                      {emptyMessage}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={col.className}>
                      {col.render
                        ? col.render(row, rowIndex)
                        : col.accessor
                          ? (row[col.accessor] as React.ReactNode)
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      {hasPagination && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground font-medium">
            Page {page} of {Math.max(1, totalPages)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              className="gap-1 font-bold"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages || totalPages === 0 || isLoading}
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              className="gap-1 font-bold"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

export default DataTable;