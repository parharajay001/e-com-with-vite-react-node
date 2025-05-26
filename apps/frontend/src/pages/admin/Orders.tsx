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
import { Box, Chip, IconButton, Tooltip } from '@workspace/ui/src/lib/mui';
import {
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  VisibilityOutlined as VisibilityIcon,
} from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Order, orderService } from '../../services/order.service';
import { OrderStatus, PaymentStatus } from '../../types/enums';
import { OrderStatusModal } from './components/OrderStatusModal';

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [gridInitialized, setGridInitialized] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.PROCESSING:
        return 'info';
      case OrderStatus.SHIPPED:
        return 'primary';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'warning';
      case PaymentStatus.SUCCESS:
        return 'success';
      case PaymentStatus.FAILED:
        return 'error';
      case PaymentStatus.REFUNDED:
        return 'info';
      default:
        return 'default';
    }
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'id',
        flex: 1,
        headerName: 'Order ID',
        sortable: true,
        minWidth: 100,
        maxWidth: 100,
      },
      {
        field: 'user',
        flex: 1,
        headerName: 'Customer',
        valueGetter: (params) => {
          const order = params.data as Order;
          return `${order.user.firstName} ${order.user.lastName}`;
        },
        sortable: false,
      },
      {
        field: 'status',
        flex: 1,
        headerName: 'Status',
        sortable: true,
        minWidth: 100,
        maxWidth: 200,
        cellRenderer: (params: ICellRendererParams) => {
          const status = (params.value as OrderStatus) || OrderStatus.PENDING;
          return (
            <Chip
              sx={{ width: '100%', height: '30px' }}
              label={status}
              color={getStatusColor(status)}
              size='small'
              variant='outlined'
            />
          );
        },
      },
      {
        field: 'paymentDetails.status',
        flex: 1,
        headerName: 'Payment',
        sortable: false,
        minWidth: 100,
        maxWidth: 200,
        cellRenderer: (params: ICellRendererParams) => {
          const order = params.data as Order;
          const status = order.paymentDetails?.status || PaymentStatus.PENDING;
          return (
            <Chip
              sx={{ width: '100%', height: '30px' }}
              label={status}
              color={getPaymentStatusColor(status)}
              size='small'
              variant='outlined'
            />
          );
        },
      },
      {
        field: 'total',
        flex: 1,
        headerName: 'Total',
        sortable: true,
        valueGetter: (params) => {
          const order = params.data as Order;
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: order.currency || 'INR',
          }).format(order.total);
        },
      },
      {
        field: 'createdAt',
        flex: 1,
        headerName: 'Order Date',
        sortable: true,
        valueGetter: (params) => {
          return new Date(params.data.createdAt).toLocaleDateString();
        },
      },
      {
        field: 'actions',
        flex: 1,
        headerName: 'Actions',
        sortable: false,
        filter: false,
        maxWidth: 160,
        minWidth: 160,
        cellRenderer: (params: ICellRendererParams) => {
          const order = params.data as Order;
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title='View Details'>
                <IconButton
                  size='small'
                  onClick={() => navigate(`/admin/orders/details?orderId=${order.id}`)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Edit Status'>
                <IconButton size='small' onClick={() => handleEdit(order)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete'>
                <IconButton size='small' onClick={() => handleDelete(order.id)} color='error'>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [navigate],
  );

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field as 'id' | 'status' | 'total' | 'createdAt',
        sortOrder: sortModel?.sort,
      });
      setOrders(response.data);
      setTotalOrders(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]); //todo

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (mounted) {
        await loadOrders();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadOrders]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', (page + 1).toString());
    params.set('size', pageSize.toString());
    if (sortModel?.field) {
      params.set('sortBy', sortModel.field);
      params.set('sortOrder', sortModel.sort);
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [page, pageSize, sortModel, navigate]);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setOrderToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    setLoading(true);
    try {
      await orderService.deleteOrder(orderToDelete);
      await loadOrders();
      showSuccess('Order deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      showSuccess('Order status updated successfully');
      await loadOrders();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update order status');
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
        flex: 1,
        sort: sortModel.sort || 'asc',
      };
      setSortModel(newSortModel);
    },
    [gridInitialized],
  );

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title='Orders Management'>
      <Box>
        <DataTableV2<Order>
          columns={columnDefs}
          data={orders}
          total={totalOrders}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChanged={handleSortChanged}
          onGridReady={() => setGridInitialized(true)}
          enableUrlParams={true}
          navigate={navigate}
          searchParams={searchParams}
          isLoading={loading}
          loadingOverlayComponent={LoadingSpinner}
        />
      </Box>

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Delete Order'
        message='Are you sure you want to delete this order? This action cannot be undone.'
        onConfirm={confirmDelete}
        confirmLabel='Delete'
        confirmColor='error'
        onCancel={() => {
          setDeleteDialogOpen(false);
          setOrderToDelete(null);
        }}
        isLoading={loading}
      />

      <OrderStatusModal
        open={isStatusModalOpen}
        order={selectedOrder}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleStatusUpdate}
      />
    </DashboardLayout>
  );
};

export default Orders;
