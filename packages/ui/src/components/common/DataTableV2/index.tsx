import { Box, TablePagination, Theme, useTheme } from '@mui/material';
import { ColDef, GridApi, GridReadyEvent, SortChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

export interface SortModel {
  field: string | null;
  sort: 'asc' | 'desc' | null;
}

export interface DataTableV2Props<T> {
  title?: string;
  columns: ColDef<T>[];
  data: T[];
  total: number;
  pageSize?: number;
  page?: number;
  rowHeight?: number;
  gridHeight?: string | number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChanged?: (sortModel: SortModel) => void;
  onGridReady?: (params: GridReadyEvent) => void;
  enableUrlParams?: boolean;
  urlParamsPrefix?: string;
  navigate?: (url: string, options?: { replace?: boolean }) => void;
  searchParams?: URLSearchParams;
  isLoading?: boolean;
  loadingOverlayComponent?: React.FC;
}

export function DataTableV2<T>({
  columns,
  data,
  total,
  pageSize: initialPageSize = 10,
  page: initialPage = 0,
  rowHeight = 50,
  gridHeight = 'calc(100vh - 270px)',
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  onSortChanged,
  onGridReady,
  enableUrlParams = false,
  urlParamsPrefix = '',
  navigate,
  searchParams,
  isLoading = false,
  loadingOverlayComponent = LoadingSpinner,
}: DataTableV2Props<T>) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridInitialized, setGridInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    if (enableUrlParams && searchParams) {
      const pageParam = searchParams.get(`${urlParamsPrefix}page`);
      return pageParam ? Math.max(0, parseInt(pageParam) - 1) : initialPage;
    }
    return initialPage;
  });

  const [currentPageSize, setCurrentPageSize] = useState(() => {
    if (enableUrlParams && searchParams) {
      const sizeParam = searchParams.get(`${urlParamsPrefix}size`);
      return sizeParam ? parseInt(sizeParam) : initialPageSize;
    }
    return initialPageSize;
  });

  const themeConfig = useTheme();
  const darkMode = themeConfig.palette.mode === 'dark';

  const updateUrlParams = useCallback(
    (page: number, size: number, sortField?: string, sortOrder?: string) => {
      if (!enableUrlParams || !navigate) return;

      const params = new URLSearchParams(searchParams);
      params.set(`${urlParamsPrefix}page`, (page + 1).toString());
      params.set(`${urlParamsPrefix}size`, size.toString());

      if (sortField && sortOrder) {
        params.set(`${urlParamsPrefix}sortBy`, sortField);
        params.set(`${urlParamsPrefix}sortOrder`, sortOrder);
      } else {
        params.delete(`${urlParamsPrefix}sortBy`);
        params.delete(`${urlParamsPrefix}sortOrder`);
      }

      navigate(`?${params.toString()}`, { replace: true });
    },
    [enableUrlParams, navigate, searchParams, urlParamsPrefix],
  );

  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      if (!params?.api || !columns?.length) return;

      const api = params.api;
      setGridApi(api);

      // Add resize observer to handle zoom changes
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          if (api) {
            api.sizeColumnsToFit();
          }
        }, 100);
      });

      const gridElement = document.querySelector('.ag-theme-quartz, .ag-theme-quartz-dark');
      if (gridElement) {
        resizeObserver.observe(gridElement);
      }

      // Initial sizing with delay
      setTimeout(() => {
        try {
          api.sizeColumnsToFit();
          setGridInitialized(true);
          if (onGridReady) {
            onGridReady(params);
          }
        } catch (error) {
          console.warn('Grid initialization error:', error);
        }
      }, 100);

      // Cleanup observer on component unmount
      return () => {
        if (gridElement) {
          resizeObserver.disconnect();
        }
      };
    },
    [onGridReady, columns],
  );

  const handleSortChanged = useCallback(
    (params: SortChangedEvent) => {
      try {
        if (!params.api || !gridInitialized) {
          return;
        }

        const sortState = params.api.getColumnState().find((s) => s.sort != null);
        if (!sortState) {
          if (onSortChanged) {
            onSortChanged({ field: null, sort: null });
          }
          return;
        }

        const colId = sortState.colId ?? null;
        const sort = sortState.sort as 'asc' | 'desc' | null;

        // Only check column exists if we have a valid API and colId
        if (colId && params.api.getColumnDef) {
          const columnExists = params.api.getColumnDef(colId);
          if (!columnExists) {
            console.warn('Invalid column ID in sort model:', colId);
            return;
          }
        }

        if (enableUrlParams) {
          updateUrlParams(currentPage, currentPageSize, colId ?? undefined, sort ?? undefined);
        }

        if (onSortChanged) {
          onSortChanged({
            field: colId,
            sort: sort,
          });
        }
      } catch (err) {
        console.warn('Sort change error:', err);
      }
    },
    [
      gridInitialized,
      onSortChanged,
      enableUrlParams,
      updateUrlParams,
      currentPage,
      currentPageSize,
    ],
  );

  const handlePageChange = (_: unknown, newPage: number) => {
    setCurrentPage(newPage);
    updateUrlParams(newPage, currentPageSize);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setCurrentPageSize(newPageSize);
    setCurrentPage(0);
    updateUrlParams(0, newPageSize);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  useEffect(() => {
    if (!gridApi || !columns?.length || !gridInitialized) return;

    const timer = setTimeout(() => {
      try {
        gridApi.sizeColumnsToFit();
      } catch (error) {
        console.warn('Error resizing columns:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [gridApi, data, columns, gridInitialized]);

  if (!columns?.length) {
    return null;
  }

  return columns && columns.length > 0 ? (
    <Box
      className={darkMode ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}
      sx={{
        height: gridHeight,
        width: '100%',
        position: 'relative',
        '& .ag-root-wrapper': {
          border: 'none',
        },
      }}
    >
      <AgGridReact
        rowData={data}
        loadingOverlayComponent={loadingOverlayComponent}
        loading={isLoading}
        containerStyle={{
          '--ag-header-background-color': themeConfig.palette.primary.main,
          '--ag-header-foreground-color': themeConfig.palette.background.default,
          '--ag-background-color': themeConfig.palette.background.paper,
          '--ag-foreground-color': themeConfig.palette.primary.main,
        }}
        columnDefs={columns}
        tooltipShowDelay={500}
        rowHeight={rowHeight}
        maxBlocksInCache={2}
        suppressPaginationPanel={true}
        onGridReady={handleGridReady}
        suppressMultiSort={true}
        onSortChanged={handleSortChanged}
        defaultColDef={{
          sortable: false,
          resizable: false,
          suppressMovable: true,
          suppressHeaderMenuButton: true,
          minWidth: 100,
          comparator: (valueA, valueB) => {
            return 0;
          },
        }}
        enableCellTextSelection={true}
        ensureDomOrder={true}
      />
      <TablePagination
        component='div'
        count={total}
        labelRowsPerPage='Rows'
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={currentPageSize}
        rowsPerPageOptions={pageSizeOptions}
        onRowsPerPageChange={handlePageSizeChange}
        sx={(theme: Theme) => ({
          position: 'absolute',
          bottom: -50,
          background: theme.palette.primary.main,
          color: theme.palette.background.default,
          width: '100%',
          borderRadius: '0 0 10px 10px',
        })}
      />
    </Box>
  ) : null;
}

export default DataTableV2;
