import { useNavigate, useSearchParams } from '@workspace/router';
import { useNotification } from '@workspace/store';
import { ConfirmDialog, DashboardLayout } from '@workspace/ui';
import { Box, Button, Card, IconButton, Typography } from '@workspace/ui/src/lib/mui';
import { Delete as DeleteIcon, Edit as EditIcon } from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useState } from 'react';
import { Address, addressService } from '../../services/address.service';
import { AddressForm } from './components/AddressForm';

const Addresses = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  // Get userId from URL query params
  const userId = searchParams.get('userId');

  // Validate and parse id parameter
  useEffect(() => {
    if (!userId || isNaN(parseInt(userId))) {
      showError('Invalid user ID');
      navigate('/admin/users');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, navigate]); //todo

  // States for DataTableV2
  const [addresses, setAddresses] = useState<Address[]>([]);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await addressService.getAddresses(Number(userId) || 0);
      setAddresses(response?.data || []);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // todo

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (mounted) {
        await loadAddresses();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadAddresses]);

  const handleEdit = (address: Address) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setAddressToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    setLoading(true);
    try {
      await addressService.deleteAddress(addressToDelete);
      await loadAddresses();
      showSuccess('Address deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete address');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleFormSubmit = async (addressData: Partial<Address>) => {
    setLoading(true);
    try {
      if (selectedAddress) {
        await addressService.updateAddress(selectedAddress.id, addressData);
        showSuccess('Address updated successfully');
      } else {
        await addressService.createAddress({ ...addressData, userId: Number(userId) });
        showSuccess('Address created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedAddress(null);
      }, 100);
      await loadAddresses();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={userId ? `Addresses for User ${userId}` : 'Address Management'}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {userId && (
          <Button variant='outlined' onClick={() => navigate('/admin/users')}>
            Back to Users
          </Button>
        )}
        <Button variant='contained' onClick={() => setIsModalOpen(true)}>
          Add Address
        </Button>
      </Box>

      {addresses.length === 0 ? (
        <Typography variant='subtitle1' color='text.secondary' textAlign='center' py={4}>
          No address found. Click "Add Address" to create one.
        </Typography>
      ) : (
        <Box display='grid' gridTemplateColumns='repeat(auto-fill, minmax(300px, 1fr))' gap={2}>
          {addresses.map((address) => (
            <Card key={address.id} sx={{ p: 2 }}>
              <Box display='flex' justifyContent='space-between' alignItems='start'>
                <Box>
                  <Typography variant='h6' gutterBottom>
                    Address:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {address.addressLine1}, {address.addressLine2}, {address.city},{' '}
                    {address.country}, {address.postalCode}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Phone : {address.mobile}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Type: {address.addressType}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size='small' onClick={() => handleEdit(address)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size='small' color='error' onClick={() => handleDelete(address.id!)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      <AddressForm
        open={isModalOpen}
        address={selectedAddress}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => {
            setSelectedAddress(null);
          }, 100);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this address? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default Addresses;
