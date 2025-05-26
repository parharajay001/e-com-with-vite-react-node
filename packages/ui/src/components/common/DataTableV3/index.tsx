import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';
import { Box } from '../../../lib/mui';
import LoadingSpinner from '../LoadingSpinner';

export interface DataGridSortModel {
  field: string | null;
  sort: 'asc' | 'desc' | null;
}

export interface DataTableV3Props<T extends GridValidRowModel> {
  title?: string;
  columns: GridColDef[];
  data: T[];
  total: number;
  pageSize?: number;
  page?: number;
  columnHeaderHeight?: number | undefined;
  rowHeight?: number | 'auto';
  gridHeight?: string | number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChanged?: (sortModel: DataGridSortModel) => void;
  enableUrlParams?: boolean;
  urlParamsPrefix?: string;
  navigate?: (url: string, options?: { replace?: boolean }) => void;
  searchParams?: URLSearchParams;
  isLoading?: boolean;
  loadingOverlayComponent?: React.FC;
  autoHeight?: boolean;
  disableColumnMenu?: boolean;
  density?: 'compact' | 'comfortable' | 'standard';
}

export function DataTableV3<T extends GridValidRowModel>({
  columns,
  data,
  total,
  pageSize: initialPageSize = 10,
  page: initialPage = 0,
  columnHeaderHeight = undefined,
  rowHeight = 'auto',
  gridHeight = 'calc(100vh - 270px)',
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  onSortChanged,
  enableUrlParams = false,
  urlParamsPrefix = '',
  navigate,
  searchParams,
  isLoading = false,
  loadingOverlayComponent: LoadingOverlay = LoadingSpinner,
  autoHeight = true,
  disableColumnMenu = true,
  density = 'comfortable',
}: DataTableV3Props<T>) {
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
  const handleSortModelChange = useCallback(
    (newModel: GridSortModel) => {
      if (!newModel.length) {
        onSortChanged?.({ field: null, sort: null });
        if (enableUrlParams) {
          updateUrlParams(currentPage, currentPageSize);
        }
        return;
      }

      const { field, sort } = newModel[0];
      onSortChanged?.({ field, sort: sort === undefined ? null : sort });
      if (enableUrlParams && sort) {
        updateUrlParams(currentPage, currentPageSize, field, sort);
      }
    },
    [currentPage, currentPageSize, enableUrlParams, onSortChanged, updateUrlParams],
  );

  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      const newPage = model.page;
      const newPageSize = model.pageSize;

      setCurrentPage(newPage);
      setCurrentPageSize(newPageSize);
      updateUrlParams(newPage, newPageSize);

      onPageChange?.(newPage);
      if (newPageSize !== currentPageSize) {
        onPageSizeChange?.(newPageSize);
      }
    },
    [currentPageSize, onPageChange, onPageSizeChange, updateUrlParams],
  );

  const initialSort = useMemo(() => {
    if (enableUrlParams && searchParams) {
      const sortBy = searchParams.get(`${urlParamsPrefix}sortBy`);
      const sortOrder = searchParams.get(`${urlParamsPrefix}sortOrder`);
      if (sortBy && sortOrder) {
        return [{ field: sortBy, sort: sortOrder as 'asc' | 'desc' }];
      }
    }
    return [];
  }, [enableUrlParams, searchParams, urlParamsPrefix]);
  return (
    <Box
      sx={{
        width: '100%',
        height: autoHeight ? 'auto' : gridHeight,
        '& .MuiDataGrid-root': {
          border: 'none',
          backgroundColor: 'background.paper',
          borderRadius: 1,
        },
        '& .MuiDataGrid-cell': {
          borderBottom: '1px solid',
          borderColor: 'divider',
          padding: '8px 16px',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          maxHeight: 'none !important',
        },
        '& .MuiDataGrid-row': {
          maxHeight: 'none !important',
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: 'action.hover',
          borderBottom: '2px solid',
          borderColor: 'divider',
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: '1px solid',
          borderColor: 'divider',
        },
        // Mobile optimizations
        '@media (max-width: 600px)': {
          '& .MuiDataGrid-columnHeaders': {
            minWidth: 'fit-content',
          },
          '& .MuiDataGrid-virtualScrollerContent': {
            minWidth: 'fit-content',
          },
          '& .MuiDataGrid-cell': {
            padding: '8px',
            fontSize: '0.875rem',
          },
        },
      }}
    >
      <DataGrid
        rows={data}
        columns={columns}
        rowCount={total}
        pageSizeOptions={pageSizeOptions}
        paginationModel={{
          page: currentPage,
          pageSize: currentPageSize,
        }}
        columnHeaderHeight={columnHeaderHeight}
        paginationMode='server'
        sortingMode='server'
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={handleSortModelChange}
        initialState={{
          sorting: {
            sortModel: initialSort,
          },
          pagination: {
            paginationModel: {
              pageSize: currentPageSize,
            },
          },
        }}
        autoHeight={autoHeight}
        getRowHeight={() => rowHeight}
        loading={isLoading}
        slots={{
          loadingOverlay: LoadingOverlay,
        }}
        disableColumnMenu={disableColumnMenu}
        density={density}
        sx={{
          '& .MuiDataGrid-cell': {
            wordBreak: 'break-word',
          },
        }}
      />
    </Box>
  );
}

export default DataTableV3;
