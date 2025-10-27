import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { SelectOptionItem, SelectOptions } from "./select-options";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { toast } from "sonner";

export interface ColumnFilter {
  type: "select";
  options: SelectOptionItem[];
  multiple?: boolean;
  placeholder?: string;
}

export interface Column<T> {
  key: string;
  title: string;
  render?: (value: unknown, record: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  filter?: ColumnFilter;
  className?: string;
}

export interface ActionRow<T> {
  label: string | React.ReactNode | ((record: T) => string | React.ReactNode);
  onClick: (record: T) => void;
  className?: string | ((record: T) => string);
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
}

export interface ActionTable {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface TableData<T> {
  total: number;
  rows: T[];
  page: number;
  limit: number;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  actionsRow?: ActionRow<T>[]; //row actions
  actionsTable?: ActionTable[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  fetchURL: string;
  refreshTrigger: number;
  initialPageSize?: number; // Initial number of rows per page
}

const emptyData: TableData<Record<string, unknown>> = {
  total: 0,
  page: 1,
  limit: 200,
  rows: [],
};

interface Queries {
  sort: { [key: string]: "asc" | "desc" };
  limit: number;
  page: number;
  search: string;
  [key: string]: string | number | string[] | number[] | {
    [key: string]: "asc" | "desc";
  };
}

const defaultQueries: Queries = {
  page: 1,
  limit: 200,
  search: "",
  sort: {},
};

export function DataTable<
  T extends Record<string, unknown> & { id?: string | number },
>(props: DataTableProps<T>) {
  const { initialPageSize = 200, refreshTrigger = 0 } = props;
  const [queries, setQueries] = React.useState<Queries>({
    ...defaultQueries,
    limit: initialPageSize,
  });
  const [data, setData] = React.useState<TableData<T>>(
    emptyData as TableData<T>,
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [refreshKey, setRefreshKey] = React.useState<number>(refreshTrigger);

  // Sync refreshTrigger prop changes to internal refreshKey state
  React.useEffect(() => {
    setRefreshKey(refreshTrigger);
  }, [refreshTrigger]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  React.useEffect(() => {
    const fetchRows = async () => {
      //iterate queries to build URLSearchParams
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queries)) {
        if (key === "sort" && typeof value === "object") {
          // For sort object, convert to sort=key1:asc,key2:desc format
          const sortParams = Object.entries(value).map(([k, v]) => `${k}:${v}`);
          if (sortParams.length > 0) {
            params.set("sort", sortParams.join(","));
          }
        } else if (value) {
          params.append(
            key,
            Array.isArray(value) ? value.join(",") : String(value),
          );
        }
      }

      try {
        setLoading(true);
        const response = await fetch(`${props.fetchURL}?${params.toString()}`);
        if (response.status === 401) {
          const {error} = await response.json();
          throw new Error("Unauthorized: " + error);
        }
        if (!response.ok) {
          throw new Error("Failed to load: " + response.statusText);
        }
        const responseData = await response.json();

        const rowData = {
          total: responseData.total || 0,
          rows: responseData.rows || [],
          page: responseData.page || queries.page,
          limit: responseData.limit || queries.limit,
        } as TableData<T>;

        // Server-side data fetching
        if (rowData) {
          setData(rowData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(
          `${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
        setData(
          { ...emptyData, error: (error as Error).message } as TableData<T>,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, [queries, refreshKey, props.fetchURL]);

  const renderCell = (column: Column<T>, record: T) => {
    const value = record[column.key];

    if (column.render) {
      return column.render(value, record);
    }

    // Default rendering for common data types
    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === "number") {
      return value.toLocaleString();
    }

    return value?.toString() || "-";
  };

  const renderActions = (record: T) => {
    const actions = props.actionsRow || [];
    if (actions.length === 0) return null;

    // Filter out hidden actions
    const visibleActions = actions.filter(
      (action) => !action.hidden || !action.hidden(record),
    );

    if (visibleActions.length === 0) return null;

    return (
      <div className="flex items-center justify-center space-x-1">
        {visibleActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => action.onClick(record)}
            disabled={action.disabled?.(record)}
            className={`h-8 px-2 ${
              typeof action.className === "function"
                ? action.className(record)
                : action.className || ""
            }`}
          >
            {typeof action.label === "function"
              ? action.label(record)
              : action.label}
          </Button>
        ))}
      </div>
    );
  };

  const handleSort = (columnKey: string) => {
    setQueries((prev) => {
      const currentSort = prev.sort[columnKey];
      let newSort: { [key: string]: "asc" | "desc" };

      if (!currentSort) {
        // No sort on this column, set to ascending
        newSort = { [columnKey]: "asc" };
      } else if (currentSort === "asc") {
        // Currently ascending, change to descending
        newSort = { [columnKey]: "desc" };
      } else {
        // Currently descending, remove sort
        newSort = {};
      }

      return { ...prev, sort: newSort, page: 1 };
    });
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2 justify-between flex-wrap">
        <div className="flex items-center gap-4 justify-start flex-wrap  mb-2">
          {/* Table Data Refresh */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {/* actions */}
          {props.actionsTable?.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-4 justify-end items-center flex-wrap">
          {/* Column Filters */}
          {props.columns
            .filter((column) => column.filter)
            .map((column) => (
              <div key={`filter-${column.key}`} className="min-w-lg">
                {column.filter?.type === "select" && (
                  <SelectOptions
                    options={column.filter.options}
                    // value={filters[column.key] ||
                    //   (column.filter.multiple ? [] : "")}
                    onValueChange={(value) => {
                      setQueries((ov) => {
                        const newQueries = {
                          ...ov,
                          page: 1,
                          [column.key]: value,
                        };
                        return newQueries;
                      });
                    }}
                    placeholder={column.filter.placeholder ||
                      `Filter ${column.title}`}
                    multiple={column.filter.multiple}
                    clearable
                    className="h-11"
                  />
                )}
              </div>
            ))}

          {/* Search input */}
          <div className="relative flex-1 max-w-lg flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={props.searchPlaceholder || "Search..."}
              value={queries.search}
              onChange={(e) => {
                setQueries((ov) => {
                  return { ...ov, search: e.target.value, page: 1 };
                });
              }}
              className="pl-10 h-11 w-full focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-auto w-full">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {props.columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`text-center whitespace-nowrap ${
                    column.className || ""
                  } ${
                    column.sortable ? "cursor-pointer hover:bg-muted/50" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{column.title}</span>
                    {column.sortable &&
                      queries.sort.hasOwnProperty(column.key) && (
                      <span className="text-xs">
                        {queries.sort[column.key] === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {props.actionsRow && props.actionsRow?.length > 0 && (
                <TableHead className="w-[70px] text-center whitespace-nowrap">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? (
                <TableRow>
                  <TableCell
                    colSpan={props.columns.length +
                      (props.actionsRow && props.actionsRow.length > 0 ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )
              : data.rows.length === 0
              ? (
                <TableRow>
                  <TableCell
                    colSpan={props.columns.length +
                      (props.actionsRow && props.actionsRow.length > 0 ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    {props.emptyMessage}
                  </TableCell>
                </TableRow>
              )
              : (
                data.rows.map((record, index) => (
                  <TableRow key={record.id || index}>
                    {props.columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`text-center whitespace-nowrap ${
                          column.className || ""
                        }`}
                      >
                        {renderCell(column, record)}
                      </TableCell>
                    ))}
                    {props.actionsRow && props.actionsRow.length > 0 && (
                      <TableCell className="text-center whitespace-nowrap">
                        {renderActions(record)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.total > 0 && (
        <div className="border-t pt-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results Info */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                <span className="font-medium text-foreground">
                  {(data.page - 1) * data.limit + 1}
                </span>
                {" - "}
                <span className="font-medium text-foreground">
                  {Math.min(data.page * data.limit, data.total)}
                </span>
                {" of "}
                <span className="font-medium text-foreground">
                  {data.total}
                </span>
                {" results"}
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Per page:
                </span>
                <Select
                  value={String(queries.limit)}
                  onValueChange={(value) => {
                    setQueries((ov) => ({
                      ...ov,
                      limit: Number(value),
                      page: 1,
                    }));
                  }}
                >
                  <SelectTrigger className="h-9 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQueries((ov) => ({ ...ov, page: 1 }));
                }}
                disabled={data.page === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQueries((ov) => ({
                    ...ov,
                    page: Math.max(1, ov.page - 1),
                  }));
                }}
                disabled={data.page === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Number Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {(() => {
                  const totalPages = Math.ceil(data.total / data.limit);
                  const currentPage = data.page;
                  const pageButtons: React.ReactNode[] = [];

                  // Show max 7 page buttons with ellipsis logic
                  const maxButtons = 7;

                  if (totalPages <= maxButtons) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pageButtons.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setQueries((ov) => ({ ...ov, page: i }))}
                          className="h-9 min-w-[36px] px-3"
                        >
                          {i}
                        </Button>,
                      );
                    }
                  } else {
                    // Always show first page
                    pageButtons.push(
                      <Button
                        key={1}
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setQueries((ov) => ({ ...ov, page: 1 }))}
                        className="h-9 min-w-[36px] px-3"
                      >
                        1
                      </Button>,
                    );

                    // Show ellipsis or pages around current page
                    if (currentPage > 3) {
                      pageButtons.push(
                        <span
                          key="ellipsis-1"
                          className="px-1.5 text-muted-foreground"
                        >
                          •••
                        </span>,
                      );
                    }

                    // Show pages around current page
                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = startPage; i <= endPage; i++) {
                      pageButtons.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setQueries((ov) => ({ ...ov, page: i }))}
                          className="h-9 min-w-[36px] px-3"
                        >
                          {i}
                        </Button>,
                      );
                    }

                    // Show ellipsis before last page if needed
                    if (currentPage < totalPages - 2) {
                      pageButtons.push(
                        <span
                          key="ellipsis-2"
                          className="px-1.5 text-muted-foreground"
                        >
                          •••
                        </span>,
                      );
                    }

                    // Always show last page
                    pageButtons.push(
                      <Button
                        key={totalPages}
                        variant={currentPage === totalPages
                          ? "default"
                          : "outline"}
                        size="sm"
                        onClick={() =>
                          setQueries((ov) => ({ ...ov, page: totalPages }))}
                        className="h-9 min-w-[36px] px-3"
                      >
                        {totalPages}
                      </Button>,
                    );
                  }

                  return pageButtons;
                })()}
              </div>

              {/* Mobile: Current Page Display */}
              <div className="sm:hidden px-3 text-sm font-medium">
                {data.page} / {Math.ceil(data.total / data.limit)}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQueries((ov) => ({
                    ...ov,
                    page: Math.min(
                      Math.ceil(data.total / data.limit),
                      ov.page + 1,
                    ),
                  }));
                }}
                disabled={data.page * data.limit >= data.total}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQueries((ov) => ({
                    ...ov,
                    page: Math.ceil(data.total / data.limit),
                  }));
                }}
                disabled={data.page * data.limit >= data.total}
                className="h-9 w-9 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
