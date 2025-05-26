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
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
} from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Role, roleService } from '../../services/role.service';
import { RoleForm } from './components/RoleForm';

const Roles = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [gridInitialized, setGridInitialized] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [totalRoles, setTotalRoles] = useState(0);
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

  const columnDefs: ColDef<Role>[] = useMemo<ColDef<Role>[]>(
    () => [
      { field: 'id', flex: 1, headerName: 'ID', maxWidth: 100 },
      { field: 'name', flex: 1, headerName: 'Name', minWidth: 150 },
      { field: 'description', flex: 2, headerName: 'Description', minWidth: 200 },
      {
        field: '_count.users',
        headerName: 'Users',
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => params.value || 0,
      },
      {
        flex: 1,
        headerName: 'Actions',
        sortable: false,
        maxWidth: 150,
        cellStyle: {
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
        },
        cellRenderer: (params: ICellRendererParams<Role>) => {
          const role = params.data;
          if (!role) return <></>;
          return (
            <>
              <Tooltip title='Edit role'>
                <IconButton size='small' onClick={() => handleEdit(role)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete role'>
                <span>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => handleDelete(role.id)}
                    disabled={Boolean(role._count?.users)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          );
        },
      },
    ],
    [],
  );

  const handleGridReady = useCallback(() => {
    setGridInitialized(true);
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roleService.getRoles({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field as 'id' | 'name' | 'createdAt',
        sortOrder: sortModel?.sort,
      });
      setRoles(response.data);
      setTotalRoles(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load roles');
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
        await loadRoles();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadRoles]);

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

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setRoleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    setLoading(true);
    try {
      await roleService.deleteRole(roleToDelete);
      await loadRoles();
      showSuccess('Role deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete role');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleFormSubmit = async (roleData: Partial<Role>) => {
    setLoading(true);
    try {
      if (selectedRole) {
        await roleService.updateRole(selectedRole.id, roleData);
        showSuccess('Role updated successfully');
      } else {
        await roleService.createRole(roleData);
        showSuccess('Role created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedRole(null);
      }, 100);
      await loadRoles();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save role');
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
    <DashboardLayout title='Roles Management'>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant='contained' onClick={() => setIsModalOpen(true)}>
          Add Role
        </Button>
      </Box>

      <DataTableV2<Role>
        columns={columnDefs}
        data={roles}
        total={totalRoles}
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

      <RoleForm
        open={isModalOpen}
        role={selectedRole}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => {
            setSelectedRole(null);
          }, 100);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this role? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default Roles;
