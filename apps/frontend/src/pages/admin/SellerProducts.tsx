import { useNavigate, useSearchParams } from '@workspace/router';
import { useNotification } from '@workspace/store';
import { DashboardLayout, DataTableV2, LoadingSpinner, SortModel } from '@workspace/ui';
import { ColDef, ICellRendererParams } from '@workspace/ui/src/lib/ag-grid-community';
import { ArrowBack as ArrowBackIcon } from '@workspace/ui/src/lib/mui-icons';
import { Box, Button, Chip } from '@workspace/ui/src/lib/mui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Seller, SellerProduct, sellerService } from '../../services/seller.service';

interface ProductParams extends ICellRendererParams {
  data: SellerProduct;
}

const SellerProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError } = useNotification();

  // Get sellerId from URL query params
  const sellerId = searchParams.get('sellerId');

  const [loading, setLoading] = useState(false);
  const [gridInitialized, setGridInitialized] = useState(false);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [seller, setSeller] = useState<Seller | null>(null);
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
    return sortBy ? { field: sortBy, sort: sortOrder || 'asc' } : null;
  });

  // Validate and parse id parameter
  useEffect(() => {
    if (!sellerId || isNaN(parseInt(sellerId))) {
      showError('Invalid seller ID');
      navigate('/admin/sellers');
    }
  }, [sellerId, showError, navigate]);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'product.name',
        headerName: 'Product',
        flex: 1,
        valueGetter: (params) => params.data.product.name,
      },
      {
        field: 'product.SKU',
        headerName: 'SKU',
        width: 150,
        valueGetter: (params) => params.data.product.SKU,
      },
      {
        field: 'product.category.name',
        headerName: 'Category',
        width: 150,
        valueGetter: (params) => params.data.product.category.name,
      },
      {
        field: 'price',
        headerName: 'Price',
        width: 120,
        valueFormatter: (params) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(params.value),
      },
      {
        field: 'quantity',
        headerName: 'Stock',
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        cellRenderer: (params: ProductParams) => {
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
            case 'ACTIVE':
              color = 'success';
              break;
            case 'INACTIVE':
              color = 'error';
              break;
            case 'OUT_OF_STOCK':
              color = 'warning';
              break;
          }

          return <Chip label={status} color={color} size='small' />;
        },
      },
    ],
    [],
  );

  const loadSellerDetails = useCallback(async () => {
    if (!sellerId) return;

    try {
      const sellerData = await sellerService.getSellerById(parseInt(sellerId));
      setSeller(sellerData);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load seller details');
      navigate('/admin/sellers');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, navigate]); //todo

  const loadProducts = useCallback(async () => {
    if (!sellerId) return;

    try {
      setLoading(true);
      const response = await sellerService.getSellerProducts(parseInt(sellerId), {
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field || 'id',
        sortOrder: sortModel?.sort || 'asc',
      });
      setProducts(response.data);
      setTotalProducts(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load seller products');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, page, pageSize, sortModel]); // todo

  useEffect(() => {
    void loadSellerDetails();
  }, [loadSellerDetails]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  // Update URL params when page, size or sort changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('sellerId', sellerId || '');
    params.set('page', (page + 1).toString());
    params.set('size', pageSize.toString());
    if (sortModel?.field) {
      params.set('sortBy', sortModel.field);
      params.set('sortOrder', sortModel.sort || 'asc');
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [page, pageSize, sortModel, navigate, sellerId]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handleGridReady = useCallback(() => {
    setGridInitialized(true);
  }, []);

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
    <DashboardLayout title={`Products - ${seller?.businessName || 'Loading...'}`}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant='outlined'
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/sellers')}
        >
          Back to Sellers
        </Button>
      </Box>

      <Box sx={{ position: 'relative', height: '100%' }}>
        {loading && <LoadingSpinner />}
        <DataTableV2<SellerProduct>
          data={products}
          columns={columnDefs}
          page={page}
          pageSize={pageSize}
          total={totalProducts}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChanged={handleSortChanged}
          onGridReady={handleGridReady}
          gridHeight='calc(100vh - 295px)'
          enableUrlParams
          navigate={navigate}
          searchParams={searchParams}
          isLoading={loading}
          loadingOverlayComponent={LoadingSpinner}
        />
      </Box>
    </DashboardLayout>
  );
};

export default SellerProducts;
