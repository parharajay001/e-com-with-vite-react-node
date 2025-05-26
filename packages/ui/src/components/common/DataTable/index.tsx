import { ColDef, GridReadyEvent, IServerSideGetRowsParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { Box, TextField, Toolbar } from '../../../lib/mui';

export interface DataTableProps<T> {
  title?: string;
  columns: ColDef<T>[];
  fetchData: (params: TableFetchParams) => Promise<TableResponse<T>>;
  onRowAction?: (action: string, data: T) => void;
  defaultSearchField?: string;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
  pageSize?: number;
  toolbarContent?: React.ReactNode;
}

interface TableFetchParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
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

export function DataTable<T>({
  columns,
  fetchData,
  defaultSearchField,
  defaultSortField,
  defaultSortOrder = 'asc',
  pageSize = 10,
  title,
  toolbarContent,
}: DataTableProps<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const [searchText, setSearchText] = useState('');
  const [gridInitialized, setGridInitialized] = useState(false);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    suppressHeaderMenuButton: true,
    minWidth: 100,
  };

  const getServerSideDatasource = useCallback(() => {
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        if (!gridInitialized) {
          return;
        }
        const { startRow = 0, sortModel } = params.request;
        try {
          const response = await fetchData({
            page: Math.floor(startRow / pageSize) + 1,
            limit: pageSize,
            sortBy:
              sortModel?.length && params.api.getColumnDef(sortModel[0].colId)
                ? sortModel[0].colId
                : defaultSortField,
            sortOrder: sortModel?.length ? sortModel[0].sort : defaultSortOrder,
            search: searchText,
            searchField: defaultSearchField,
          });

          params.success({
            rowData: response.data,
            rowCount: response.meta.total,
          });
        } catch (error) {
          console.error('Error loading data:', error);
          params.fail();
        }
      },
    };
  }, [
    searchText,
    pageSize,
    defaultSortField,
    defaultSortOrder,
    defaultSearchField,
    fetchData,
    gridInitialized,
  ]);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      setGridInitialized(true);
      const datasource = getServerSideDatasource();
      params.api.setGridOption('serverSideDatasource', datasource);
    },
    [getServerSideDatasource],
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    if (gridRef.current?.api) {
      const datasource = getServerSideDatasource();
      gridRef.current.api.setGridOption('serverSideDatasource', datasource);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Toolbar sx={{ mb: 2, gap: 2 }}>
        {title && (
          <Box sx={{ flex: '1 1 100%' }}>
            <TextField
              size='small'
              placeholder='Search...'
              value={searchText}
              onChange={handleSearch}
            />
          </Box>
        )}
        {toolbarContent}
      </Toolbar>

      <div className='ag-theme-alpine' style={{ height: 600, width: '100%' }}>
        <AgGridReact<T>
          ref={gridRef}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          rowModelType='serverSide'
          pagination={true}
          paginationPageSize={pageSize}
          onGridReady={onGridReady}
          animateRows={true}
          rowSelection='multiple'
        />
      </div>
    </Box>
  );
}

export default DataTable;
