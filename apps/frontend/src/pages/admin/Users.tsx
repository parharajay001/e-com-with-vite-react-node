import { useNavigate, useSearchParams } from '@workspace/router';
import { useNotification } from '@workspace/store';
import {
  ConfirmDialog,
  DashboardLayout,
  DataTableV2,
  LoadingSpinner,
  SortModel,
  ImageCarousel,
} from '@workspace/ui';
import { ColDef, ICellRendererParams } from '@workspace/ui/src/lib/ag-grid-community';
import { Box, Button, IconButton, Tooltip } from '@workspace/ui/src/lib/mui';
import {
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  HomeOutlined as HomeIcon,
} from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User, userService } from '../../services/user.service';
import { UserForm } from './components/UserForm';
import { NoImagePlaceholder } from '../../assets/images';

const Users = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [gridInitialized, setGridInitialized] = useState(false);

  // New states for DataTableV2
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
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

  const columnDefs: ColDef<User>[] = useMemo<ColDef<User>[]>(
    () => [
      { field: 'id', flex: 1, headerName: 'ID', maxWidth: 100, sortable: true },
      {
        field: 'profilePicture',
        flex: 1,
        sortable: false,
        headerName: 'Profile Picture',
        maxWidth: 150,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<User>) => {
          const user = params.data;
          const imageUrl = user?.profilePicture?.startsWith('http')
            ? user?.profilePicture
            : user?.profilePicture
              ? new URL(user?.profilePicture, import.meta.env.VITE_SERVER_URL).toString()
              : NoImagePlaceholder;
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageCarousel
                images={[{ url: imageUrl, alt: `${user?.firstName}'s profile picture` }]}
                thumbnailSize={{ width: '50px', height: '50px' }}
              />
            </Box>
          );
        },
      },
      { field: 'firstName', flex: 1, headerName: 'First Name', sortable: true, minWidth: 150 },
      { field: 'lastName', flex: 1, headerName: 'Last Name', sortable: true, minWidth: 150 },
      { field: 'email', flex: 1, headerName: 'Email', sortable: true, minWidth: 200 },
      { field: 'telephone', flex: 1, headerName: 'Phone', sortable: true, minWidth: 150 },
      {
        field: 'isVerified',
        flex: 1,
        sortable: false,
        headerName: 'Status',
        maxWidth: 120,
        cellStyle: {
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
        },
        valueFormatter: (params) => {
          return params.value ? 'Verified' : 'Pending';
        },
      },
      {
        field: 'roles',
        flex: 1,
        sortable: false,
        headerName: 'Role',
        maxWidth: 120,
        valueFormatter: (params) => {
          return params.value?.[0]?.role.name ?? '';
        },
      },
      {
        flex: 1,
        headerName: 'Actions',
        sortable: false,
        maxWidth: 200,
        cellStyle: {
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
        },
        cellRenderer: (params: ICellRendererParams<User>) => {
          const user = params.data;
          if (!user) return <></>;
          return (
            <>
              <Tooltip title='Edit user'>
                <IconButton size='small' onClick={() => handleEdit(user)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete user'>
                <IconButton size='small' color='error' onClick={() => handleDelete(user.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Manage addresses'>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => navigate(`/admin/users/addresses?userId=${user.id}`)}
                >
                  <HomeIcon />
                </IconButton>
              </Tooltip>
            </>
          );
        },
      },
    ],
    [navigate],
  );

  const handleGridReady = useCallback(() => {
    setGridInitialized(true);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field as 'id' | 'email' | 'firstName' | 'lastName' | 'createdAt',
        sortOrder: sortModel?.sort,
      });
      setUsers(response.data);
      setTotalUsers(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200); // Simulate loading delay todo: remove this in production
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (mounted) {
        await loadUsers();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadUsers]);

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

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      await userService.deleteUser(userToDelete);
      await loadUsers(); // Reload the data after deletion
      showSuccess('User deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleFormSubmit = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, userData);
        showSuccess('User updated successfully');
      } else {
        await userService.createUser(userData);
        showSuccess('User created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedUser(null);
      }, 100); // Delay to allow modal to close before resetting state
      await loadUsers(); // Reload the data after creating/updating
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save user');
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
    <DashboardLayout title='Users Management'>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant='contained' onClick={() => setIsModalOpen(true)}>
          Add User
        </Button>
      </Box>

      <DataTableV2<User>
        columns={columnDefs}
        data={users}
        total={totalUsers}
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
      <UserForm
        open={isModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => {
            setSelectedUser(null);
          }, 100); // Delay to allow modal to close before resetting state
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this user? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default Users;
