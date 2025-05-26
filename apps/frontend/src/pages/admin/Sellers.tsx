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
import { Box, Button, Chip, IconButton, Rating, Tooltip } from '@workspace/ui/src/lib/mui';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Seller, sellerService } from '../../services/seller.service';
import { SellerForm } from './components/SellerForm';

const Sellers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gridInitialized, setGridInitialized] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [totalSellers, setTotalSellers] = useState(0);
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
  });
  const [pageSize, setPageSize] = useState(() => {
    const sizeParam = searchParams.get('size');
    return sizeParam ? parseInt(sizeParam) : 10;
  });
  const [sortModel, setSortModel] = useState<{ field: string; sort: 'asc' | 'desc' } | null>(() => {
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
    return sortBy && sortOrder ? { field: sortBy, sort: sortOrder } : null;
  });
  const { id: userId } = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDelete = useCallback(
    (id: number) => {
      setSelectedSeller(sellers.find((s) => s.id === id) || null);
      setIsDeleteDialogOpen(true);
    },
    [sellers],
  );

  const columnDefs: ColDef<Seller>[] = useMemo<ColDef<Seller>[]>(
    () => [
      { field: 'id', headerName: 'Id', flex: 1 },
      { field: 'businessName', headerName: 'Business Name', flex: 1 },
      {
        field: 'user.email',
        headerName: 'Email',
        flex: 1,
        valueGetter: (params) => params.data?.user?.email,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        cellRenderer: (params: ICellRendererParams) => {
          const status = params.value;
          let color:
            | 'default'
            | 'primary'
            | 'secondary'
            | 'error'
            | 'info'
            | 'success'
            | 'warning' = 'default';

          switch (status) {
            case 'APPROVED':
              color = 'success';
              break;
            case 'PENDING':
              color = 'warning';
              break;
            case 'REJECTED':
              color = 'error';
              break;
            case 'SUSPENDED':
              color = 'secondary';
              break;
          }

          return <Chip label={status} color={color} size='small' />;
        },
      },
      {
        field: 'rating',
        headerName: 'Rating',
        width: 150,
        cellRenderer: (params: ICellRendererParams) => (
          <Rating value={params.value || 0} readOnly precision={0.5} size='small' />
        ),
      },
      { field: 'totalSales', headerName: 'Total Sales', width: 120 },
      {
        field: 'commissionRate',
        headerName: 'Commission Rate',
        width: 150,
        valueFormatter: (params) => `${params.value}%`,
      },
      {
        headerName: 'Actions',
        minWidth: 150,
        maxWidth: 150,
        cellRenderer: (params: ICellRendererParams) => {
          const seller = params.data;
          if (!seller) return <></>;
          return (
            <>
              <Tooltip title='View products'>
                <IconButton
                  size='small'
                  onClick={() => navigate(`/admin/sellers/products?sellerId=${seller.id}`)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Edit seller'>
                <IconButton size='small' onClick={() => handleEdit(seller)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete seller'>
                <IconButton size='small' color='error' onClick={() => handleDelete(seller.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          );
        },
      },
    ],
    [navigate, handleDelete],
  );

  const handleGridReady = useCallback(() => {
    setGridInitialized(true);
  }, []);

  const loadSellers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sellerService.getSellers({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field || 'id',
        sortOrder: sortModel?.sort || 'asc',
      });
      setSellers(response.data);
      setTotalSellers(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load sellers');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]); // todo

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (mounted) {
        await loadSellers();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadSellers]);

  const handleSubmit = async (data: Partial<Seller>) => {
    try {
      setLoading(true);
      if (selectedSeller) {
        await sellerService.updateSeller(selectedSeller.id, data);
        showSuccess('Seller updated successfully');
      } else {
        await sellerService.createSeller(userId, data);
        showSuccess('Product created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedSeller(null);
      }, 100);
      await loadSellers();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save seller');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSeller) return;
    try {
      setLoading(true);
      await sellerService.deleteSeller(selectedSeller.id);
      showSuccess('Seller deleted successfully');
      setIsDeleteDialogOpen(false);
      setTimeout(() => {
        setSelectedSeller(null);
      }, 100);
      await loadSellers();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete seller');
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

  return (
    <DashboardLayout title='Sellers Management'>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant='contained' onClick={() => setIsModalOpen(true)}>
          Add Seller
        </Button>
      </Box>

      <DataTableV2<Seller>
        columns={columnDefs}
        data={sellers}
        page={page}
        pageSize={pageSize}
        total={totalSellers}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChanged={handleSortChanged}
        onGridReady={handleGridReady}
        gridHeight='calc(100vh - 295px)'
        enableUrlParams
        navigate={navigate}
        isLoading={loading}
        loadingOverlayComponent={LoadingSpinner}
      />

      <SellerForm
        open={isModalOpen}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedSeller || undefined}
        isSubmitting={loading}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title='Delete Seller'
        message='Are you sure you want to delete this seller? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default Sellers;
