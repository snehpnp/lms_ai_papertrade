import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

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
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
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
  renderMobileCard,
}: DataTableProps<T>) {

  const hasHeaderElements = onSearchChange || totalRecords !== undefined;
  const hasPagination = onPageChange && page !== undefined && totalPages !== undefined;

  return (
    <div className={cn("ui-table-container", className)}>

      {/* Header with Search and Stats */}
      {hasHeaderElements && (
        <div className="px-6 py-5 flex flex-wrap gap-4 items-center justify-between bg-card/50">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-muted-foreground/10 focus:border-primary transition-all duration-300"
              disabled={disableSearch}
            />
          </div>
          {totalRecords !== undefined && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Data Context
              </span>
              <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-xs font-bold text-primary">
                  {totalRecords} Total
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Table Content */}
      <div className="relative overflow-hidden">
        {/* Mobile View - Cards (only if renderMobileCard is provided) */}
        {renderMobileCard && (
          <div className="md:hidden divide-y divide-border/20">
            {isLoading ? (
              <div className="text-center py-20 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] animate-pulse">
                  Synchronizing
                </span>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-sm font-bold text-muted-foreground italic opacity-50">
                  {emptyMessage}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {data.map((row, rowIndex) => (
                  <div key={rowIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${rowIndex * 40}ms` }}>
                    {renderMobileCard(row, rowIndex)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Desktop View (and fallback for mobile if no card is provided) */}
        <div className={cn("overflow-x-auto no-scrollbar", renderMobileCard && "hidden md:block")}>
          <table className="ui-table w-full">
            <thead>
              <tr className="border-b-0">
                {columns.map((col, index) => (
                  <th key={index} className={cn("whitespace-nowrap", col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-10 h-10 border-2 border-primary/20 rounded-full">
                        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] animate-pulse">
                        Fetching Records
                      </span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-24">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <div className="w-12 h-12 rounded-full border border-dashed border-muted-foreground flex items-center justify-center">
                        <Search className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold italic tracking-tight">
                        {emptyMessage}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="group"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={cn("group-hover:text-foreground transition-colors", col.className)}>
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
      </div>

      {/* Footer with Professional Pagination */}
      {hasPagination && (
        <div className="px-6 py-5 border-t border-border bg-card/30 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
            showing <span className="text-foreground">{data.length}</span> of <span className="text-foreground">{totalRecords || data.length}</span> results
          </div>

          <div className="flex items-center gap-1.5 self-end">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1 || isLoading}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              className="w-9 h-9 border-muted-foreground/10 hover:bg-primary hover:text-white transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Logic for Page Numbers similar to the reference image */}
            <div className="flex items-center gap-1 mx-2">
              {[...Array(Math.min(3, totalPages))].map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange?.(i + 1)}
                  className={cn(
                    "w-9 h-9 rounded-full text-xs font-bold transition-all duration-300",
                    page === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" : "border-muted-foreground/10 hover:border-primary/50"
                  )}
                >
                  {i + 1}
                </Button>
              ))}
              {totalPages > 3 && (
                <div className="w-9 h-9 flex items-center justify-center opacity-30">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              )}
              {totalPages > 3 && (
                <Button
                  variant={page === totalPages ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange?.(totalPages)}
                  className={cn(
                    "w-9 h-9 rounded-full text-xs font-bold transition-all duration-300",
                    page === totalPages ? "bg-primary text-white shadow-lg shadow-primary/20" : "border-muted-foreground/10"
                  )}
                >
                  {totalPages}
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages || totalPages === 0 || isLoading}
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              className="w-9 h-9 border-muted-foreground/10 hover:bg-primary hover:text-white transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

export default DataTable;