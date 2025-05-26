import { useNavigate, useSearchParams } from '@workspace/router';
import { useNotification } from '@workspace/store';
import {
  ConfirmDialog,
  DashboardLayout,
  DataTableV2,
  LoadingSpinner,
  SortModel,
} from '@workspace/ui';
import { ColDef, ICellRendererParams } from '@workspace/ui/src/lib/ag-grid-community';
import { Box, Button, IconButton, Tooltip } from '@workspace/ui/src/lib/mui';
import {
  AddBoxOutlined as AddBoxIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
} from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tax, taxService } from '../../services/tax.service';
import { TaxForm } from './components/TaxForm';

const Taxes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();

  // State
  const [loading, setLoading] = useState(false);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [totalTaxes, setTotalTaxes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [taxToDelete, setTaxToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gridInitialized, setGridInitialized] = useState(false);

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
  });
  const [pageSize, setPageSize] = useState(() => {
    const sizeParam = searchParams.get('size');
    return sizeParam ? parseInt(sizeParam) : 10;
  });
  const [sortModel, setSortModel] = useState<SortModel | null>(() => {
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
    return sortBy && sortOrder ? { field: sortBy, sort: sortOrder } : null;
  });

  // Column definitions
  const columnDefs = useMemo<ColDef<Tax>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        sortable: true,
        flex: 1,
        maxWidth: 100,
      },
      {
        field: 'country',
        headerName: 'Country',
        sortable: true,
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'state',
        headerName: 'State/Province',
        sortable: true,
        flex: 1,
        minWidth: 150,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'rate',
        headerName: 'Tax Rate',
        sortable: true,
        flex: 1,
        minWidth: 120,
        maxWidth: 150,
        valueFormatter: (params) => {
          const rate = params.value as number;
          return `${(rate * 100).toFixed(2)}%`;
        },
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        sortable: true,
        flex: 1,
        minWidth: 150,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      },
      {
        headerName: 'Actions',
        sortable: false,
        flex: 1,
        minWidth: 120,
        maxWidth: 120,
        cellStyle: {
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
        },
        cellRenderer: (params: ICellRendererParams<Tax>) => {
          const tax = params.data;
          if (!tax) return <></>;
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title='Edit tax rate'>
                <IconButton size='small' onClick={() => handleEdit(tax)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete tax rate'>
                <IconButton size='small' color='error' onClick={() => handleDelete(tax.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [],
  );

  const loadTaxes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taxService.getTaxes({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field as 'id' | 'country' | 'state' | 'rate' | 'createdAt',
        sortOrder: sortModel?.sort || undefined,
      });
      setTaxes(response.data);
      setTotalTaxes(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load tax rates');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]); // todo

  useEffect(() => {
    void loadTaxes();
  }, [loadTaxes]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', (page + 1).toString());
    params.set('size', pageSize.toString());
    if (sortModel?.field) {
      params.set('sortBy', sortModel.field);
      params.set('sortOrder', sortModel.sort || 'asc');
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [page, pageSize, sortModel, navigate]);

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setTaxToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taxToDelete) return;

    setLoading(true);
    try {
      await taxService.deleteTax(taxToDelete);
      await loadTaxes();
      showSuccess('Tax rate deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete tax rate');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setTaxToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: { country: string; state?: string; rate: number }) => {
    setLoading(true);
    try {
      if (selectedTax) {
        await taxService.updateTax(selectedTax.id, formData);
        showSuccess('Tax rate updated successfully');
      } else {
        await taxService.createTax(formData);
        showSuccess('Tax rate created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedTax(null);
      }, 100);
      await loadTaxes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save tax rate';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleSortChanged = useCallback(
    (sortModel: SortModel) => {
      if (!gridInitialized || !sortModel.field) {
        setSortModel(null);
        return;
      }

      const newSortModel = {
        field: sortModel.field,
        sort: sortModel.sort || 'asc',
      };
      setSortModel(newSortModel);
    },
    [gridInitialized],
  );

  const handleGridReady = useCallback(() => {
    setGridInitialized(true);
  }, []);

  return (
    <DashboardLayout title='Tax Management'>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant='contained'
          startIcon={<AddBoxIcon />}
          onClick={() => {
            setSelectedTax(null);
            setIsModalOpen(true);
          }}
        >
          Add Tax Rate
        </Button>
      </Box>

      <DataTableV2<Tax>
        columns={columnDefs}
        data={taxes}
        total={totalTaxes}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChanged={handleSortChanged}
        gridHeight='calc(100vh - 295px)'
        onGridReady={handleGridReady}
        enableUrlParams
        navigate={navigate}
        searchParams={searchParams}
        isLoading={loading}
        loadingOverlayComponent={LoadingSpinner}
      />

      <TaxForm
        open={isModalOpen}
        initialValues={selectedTax || undefined}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => {
            setSelectedTax(null);
          }, 100);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Delete Tax Rate'
        message='Are you sure you want to delete this tax rate? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default Taxes;
