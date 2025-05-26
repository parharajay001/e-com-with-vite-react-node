import { useNavigate, useSearchParams } from '@workspace/router';
import { useNotification } from '@workspace/store';
import {
  ConfirmDialog,
  DashboardLayout,
  DataTableV2,
  ImageCarousel,
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
import { NoImagePlaceholder } from '../../assets/images';
import { Category, categoryService } from '../../services/category.service';
import { CategoryForm } from './components/CategoryForm';

interface CategoryFormData {
  name: string;
  description?: string;
  image?: File;
}

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [gridInitialized, setGridInitialized] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
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

  const columnDefs: ColDef<Category>[] = useMemo<ColDef<Category>[]>(
    () => [
      { field: 'id', flex: 1, headerName: 'ID', maxWidth: 100 },
      {
        field: 'imageUrl',
        flex: 1,
        sortable: false,
        headerName: 'Category Image',
        maxWidth: 200,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams<Category>) => {
          const category = params.data;
          const imageUrl = category?.imageUrl?.startsWith('http')
            ? category?.imageUrl
            : category?.imageUrl
              ? new URL(category?.imageUrl, import.meta.env.VITE_SERVER_URL).toString()
              : NoImagePlaceholder;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ImageCarousel
                images={[{ url: imageUrl, alt: `${category?.name || 'Category'} image` }]}
                thumbnailSize={{ width: '50px', height: '50px' }}
              />
            </Box>
          );
        },
      },
      { field: 'name', flex: 1, headerName: 'Name', minWidth: 200 },
      { field: 'description', flex: 1, headerName: 'Description', minWidth: 300 },
      {
        field: 'createdAt',
        flex: 1,
        headerName: 'Created At',
        minWidth: 150,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
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
        cellRenderer: (params: ICellRendererParams<Category>) => {
          const category = params.data;
          if (!category) return <></>;
          return (
            <>
              <Tooltip title='Edit category'>
                <IconButton size='small' onClick={() => handleEdit(category)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete category'>
                <IconButton size='small' color='error' onClick={() => handleDelete(category.id)}>
                  <DeleteIcon />
                </IconButton>
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

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field as 'id' | 'name' | 'createdAt',
        sortOrder: sortModel?.sort,
      });
      setCategories(response.data);
      setTotalCategories(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]); // todo

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (mounted) {
        await loadCategories();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadCategories]);

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

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    try {
      await categoryService.deleteCategory(categoryToDelete);
      await loadCategories();
      showSuccess('Category deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };
  const handleFormSubmit = async (categoryData: CategoryFormData) => {
    setLoading(true);
    try {
      if (selectedCategory) {
        // Handle image upload separately if there's a new image
        if (categoryData.image) {
          const imageFormData = new FormData();
          imageFormData.append('image', categoryData.image);
          imageFormData.append('oldImageUrl', selectedCategory.imageUrl || '');
          await categoryService.updateCategoryImage(selectedCategory.id, imageFormData);
        }

        // Update other category data
        const updateFormData = new FormData();
        updateFormData.append('name', categoryData.name);
        if (categoryData.description) {
          updateFormData.append('description', categoryData.description);
        }
        await categoryService.updateCategory(selectedCategory.id, updateFormData);
        showSuccess('Category updated successfully');
      } else {
        // For new category, send all data together
        const formData = new FormData();
        formData.append('name', categoryData.name);
        if (categoryData.description) {
          formData.append('description', categoryData.description);
        }
        if (categoryData.image) {
          formData.append('image', categoryData.image);
        }
        await categoryService.createCategory(formData);
        showSuccess('Category created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedCategory(null);
      }, 100);
      await loadCategories();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save category');
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
    <DashboardLayout title='Categories Management'>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant='contained' onClick={() => setIsModalOpen(true)}>
          Add Category
        </Button>
      </Box>

      <DataTableV2<Category>
        columns={columnDefs}
        data={categories}
        total={totalCategories}
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

      <CategoryForm
        open={isModalOpen}
        category={selectedCategory}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(async () => {
            setSelectedCategory(null);
            await loadCategories();
          }, 100);
        }}
        categoryId={selectedCategory?.id}
        imageUrl={selectedCategory?.imageUrl}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this category? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default Categories;
