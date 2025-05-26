import { useNavigate, useSearchParams } from '@workspace/router';
import { useNotification } from '@workspace/store';
import { DashboardLayout, LoadingSpinner } from '@workspace/ui';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@workspace/ui/src/lib/mui';
import { ArrowBack as ArrowBackIcon } from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useState } from 'react';
import { Order, orderService } from '../../services/order.service';
import { OrderStatus, PaymentStatus } from '../../types/enums';
import { OrderStatusModal } from './components/OrderStatusModal';

const OrderDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { showError, showSuccess } = useNotification();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'SHIPPED':
        return 'primary';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const data = await orderService.getOrderById(parseInt(orderId));
      setOrder(data);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, navigate]); // todo

  useEffect(() => {
    if (!orderId || isNaN(parseInt(orderId))) {
      showError('Invalid order ID');
      navigate('/admin/orders');
      return;
    }

    void loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, navigate, loadOrder]); // todo

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      showSuccess('Order status updated successfully');
      await loadOrder();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  if (loading || !order) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title='Order Details'>
      <Box sx={{ mb: 4 }}>
        <Button
          variant='outlined'
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant='h6'>Order #{order.id}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      variant='outlined'
                    />
                    <Button
                      variant='contained'
                      size='small'
                      onClick={() => setIsStatusModalOpen(true)}
                    >
                      Update Status
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Customer Information
                    </Typography>
                    <Typography>
                      {order.user.firstName} {order.user.lastName}
                    </Typography>
                    <Typography>{order.user.email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Order Information
                    </Typography>
                    <Typography>Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
                    <Typography>
                      Payment Status:{' '}
                      <Chip
                        label={order.paymentDetails.status}
                        color={getPaymentStatusColor(order.paymentDetails.status)}
                        size='small'
                        variant='outlined'
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Order Items
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align='right'>Price</TableCell>
                        <TableCell align='right'>Quantity</TableCell>
                        <TableCell align='right'>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant='body2'>{item.product.name}</Typography>
                            <Typography variant='caption' color='text.secondary'>
                              SKU: {item.product.SKU}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.currency,
                            }).format(item.product.price)}
                          </TableCell>
                          <TableCell align='right'>{item.quantity}</TableCell>
                          <TableCell align='right'>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.currency,
                            }).format(item.product.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell align='right'>
                          <Typography variant='subtitle2'>Subtotal</Typography>
                          <Typography variant='subtitle2'>Shipping</Typography>
                          <Typography variant='subtitle2'>Tax</Typography>
                          <Typography variant='subtitle1'>Total</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2'>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.currency,
                            }).format(order.subtotal)}
                          </Typography>
                          <Typography variant='body2'>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.currency,
                            }).format(order.shippingCost)}
                          </Typography>
                          <Typography variant='body2'>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.currency,
                            }).format(order.taxAmount)}
                          </Typography>
                          <Typography variant='subtitle1'>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: order.currency,
                            }).format(order.total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Shipping Address
                </Typography>
                <Typography>{order.shippingAddress.addressLine1}</Typography>
                {order.shippingAddress.addressLine2 && (
                  <Typography>{order.shippingAddress.addressLine2}</Typography>
                )}
                <Typography>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </Typography>
                <Typography>{order.shippingAddress.country}</Typography>
                <Typography>Tel: {order.shippingAddress.telephone}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Billing Address
                </Typography>
                <Typography>{order.billingAddress.addressLine1}</Typography>
                {order.billingAddress.addressLine2 && (
                  <Typography>{order.billingAddress.addressLine2}</Typography>
                )}
                <Typography>
                  {order.billingAddress.city}, {order.billingAddress.postalCode}
                </Typography>
                <Typography>{order.billingAddress.country}</Typography>
                <Typography>Tel: {order.billingAddress.telephone}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Payment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Payment Method
                    </Typography>
                    <Typography>{order.paymentDetails.provider}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Transaction ID
                    </Typography>
                    <Typography>{order.paymentDetails.transactionId}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <OrderStatusModal
        open={isStatusModalOpen}
        order={order}
        onClose={() => setIsStatusModalOpen(false)}
        onSave={handleStatusUpdate}
      />
    </DashboardLayout>
  );
};

export default OrderDetails;
