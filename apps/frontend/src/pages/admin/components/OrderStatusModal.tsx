import { OrderStatus } from '../../../types/enums';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@workspace/ui/src/lib/mui';
import { useEffect, useState } from 'react';
import { Order } from '../../../services/order.service';

interface OrderStatusModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSave: (orderId: number, status: OrderStatus) => Promise<void>;
}

export const OrderStatusModal = ({ open, order, onClose, onSave }: OrderStatusModalProps) => {
  const [status, setStatus] = useState<OrderStatus>(order?.status || OrderStatus.PENDING);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as OrderStatus);
  };

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  const handleSubmit = async () => {
    if (!order) return;

    setLoading(true);
    try {
      await onSave(order.id, status);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Update Order Status</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel id='status-label'>Status</InputLabel>
            <Select
              labelId='status-label'
              value={status}
              label='Status'
              onChange={handleStatusChange}
            >
              {(Object.keys(OrderStatus) as Array<keyof typeof OrderStatus>).map((key) => (
                <MenuItem key={key} value={OrderStatus[key]}>
                  {OrderStatus[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant='contained' disabled={loading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusModal;
