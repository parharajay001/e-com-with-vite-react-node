'use client';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '../../../lib/mui';

export interface DataTableV1Props<T> {
  title?: string;
  columns: ColDef<T>[];
  fetchData: (params: TableFetchParams) => Promise<TableResponse<T>>;
  onRowAction?: (action: string, data: T) => void;
  defaultSearchField?: string;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

interface TableFetchParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

interface TableResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export function DataTableV1<T>({
  columns,
  fetchData,
  defaultSearchField,
  defaultSortField,
  defaultSortOrder = 'asc',
  pageSize = 10,
}: DataTableV1Props<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowData, setRowData] = useState<T[]>([]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    suppressHeaderMenuButton: true,
    minWidth: 100,
  };

  const gridOptions = {
    headerHeight: 48,
    rowHeight: 48,
    suppressColumnVirtualisation: true,
  };

  const getSortParams = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) {
      return {
        sortBy: defaultSortField,
        sortOrder: defaultSortOrder,
      };
    }

    const sortColumns = api
      .getColumnState()
      .filter((col) => col.sort)
      .map((col) => ({
        colId: col.colId,
        sort: col.sort as 'asc' | 'desc',
      }));

    return {
      sortBy: sortColumns.length ? sortColumns[0].colId : defaultSortField,
      sortOrder: sortColumns.length ? sortColumns[0].sort : defaultSortOrder,
    };
  }, [defaultSortField, defaultSortOrder]);

  const loadData = useCallback(async () => {
    try {
      const { sortBy, sortOrder } = getSortParams();

      const response = await fetchData({
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        searchField: defaultSearchField,
      });

      setRowData(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [currentPage, pageSize, defaultSearchField, getSortParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onPaginationChanged = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;

    const newPage = api.paginationGetCurrentPage() + 1;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentPage]);

  const onSortChanged = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const onFilterChanged = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <div className='ag-theme-material' style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        <AgGridReact<T>
          ref={gridRef}
          rowData={rowData}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          pagination={true}
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          onPaginationChanged={onPaginationChanged}
          onSortChanged={onSortChanged}
          onFilterChanged={onFilterChanged}
          animateRows={true}
          rowSelection='multiple'
          suppressPropertyNamesCheck={true}
        />
      </div>
    </Box>
  );
}

export default DataTableV1;
