import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useState, useCallback, useEffect } from 'react';
import { DataTableV3, DataGridSortModel } from './index';
import { useSearchParams, useNavigate } from '@workspace/router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  isVerified: boolean;
  roles: Array<{ role: { name: string } }>;
}

// Mock user service
const userService = {
  getUsers: async ({
    page,
    limit,
    sortBy,
    sortOrder,
  }: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUsers: User[] = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      firstName: `John ${i + 1}`,
      lastName: `Doe ${i + 1}`,
      email: `user${i + 1}@example.com`,
      telephone: `+1234567890${i}`,
      isVerified: Math.random() > 0.5,
      roles: [{ role: { name: Math.random() > 0.7 ? 'Admin' : 'User' } }],
    }));

    return {
      data: mockUsers,
      meta: {
        total: 100,
      },
    };
  },
  deleteUser: async (id: number) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  },
  updateUser: async (id: number, data: Partial<User>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id };
  },
};

export const DataTableExample = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('users_page');
    return pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;
  });

  const [pageSize, setPageSize] = useState(() => {
    const sizeParam = searchParams.get('users_size');
    return sizeParam ? parseInt(sizeParam) : 10;
  });

  const [sortModel, setSortModel] = useState<DataGridSortModel>(() => {
    const sortBy = searchParams.get('users_sortBy');
    const sortOrder = searchParams.get('users_sortOrder') as 'asc' | 'desc' | null;
    return sortBy && sortOrder ? { field: sortBy, sort: sortOrder } : { field: null, sort: null };
  });
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.3,
      minWidth: 50,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',
            lineHeight: '1.2',
            padding: '8px 0',
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',
            lineHeight: '1.2',
            padding: '8px 0',
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',
            lineHeight: '1.2',
            padding: '8px 0',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'telephone',
      headerName: 'Phone',
      flex: 0.8,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'isVerified',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: params.value ? '#e6ffe6' : '#ffe6e6',
              color: params.value ? '#006600' : '#cc0000',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value ? 'Verified' : 'Pending'}
          </span>
        </Box>
      ),
    },
    {
      field: 'roles',
      headerName: 'Role',
      flex: 0.6,
      minWidth: 90,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params: GridRenderCellParams<User>) => {
        const user = params.row;
        return user?.roles?.[0]?.role.name ?? '';
      },
      renderCell: (params) => (
        <div
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: params.value === 'Admin' ? '#e3f2fd' : '#f5f5f5',
            color: params.value === 'Admin' ? '#1976d2' : '#666666',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.6,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box
          sx={{
            display: 'flex',
            gap: '4px',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Tooltip title='Edit user'>
            <IconButton size='small' onClick={() => handleEdit(params.row)} sx={{ padding: '4px' }}>
              <EditIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete user'>
            <IconButton
              size='small'
              color='error'
              onClick={() => handleDelete(params.row.id)}
              sx={{ padding: '4px' }}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel.field ?? undefined,
        sortOrder: sortModel.sort ?? undefined,
      });
      setUsers(response.data);
      setTotalUsers(response.meta.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  }, []);

  const handleSortChange = useCallback((newSortModel: DataGridSortModel) => {
    setSortModel(newSortModel);
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    // You would typically open a modal or navigate to edit page here
    console.log('Edit user:', user);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await userService.deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box
        sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}
      >
        <h2>Users Management</h2>
        <Button variant='contained' color='primary' onClick={() => handleEdit({ id: 0 } as User)}>
          Add New User
        </Button>
      </Box>

      <Box sx={{ width: '100%', height: 'calc(100vh - 270px)' }}>
        <DataTableV3
          density='compact'
          columns={columns}
          data={users}
          total={totalUsers}
          pageSize={pageSize}
          page={page}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChanged={handleSortChange}
          enableUrlParams={true}
          urlParamsPrefix='users_'
          autoHeight={false}
          rowHeight={'auto'}
          navigate={setSearchParams}
          searchParams={searchParams}
          isLoading={loading}
        />
      </Box>
    </Box>
  );
};

export default DataTableExample;
