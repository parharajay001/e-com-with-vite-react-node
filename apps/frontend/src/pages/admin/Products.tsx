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
import { Box, Button, Chip, IconButton, Rating, Tooltip } from '@workspace/ui/src/lib/mui';
import {
  AddBoxOutlined as AddBoxIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  ImageOutlined as ImageIcon,
  LibraryAddOutlined as LibraryAddIcon,
} from '@workspace/ui/src/lib/mui-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Category, categoryService } from '../../services/category.service';
import { Product, ProductImage, productService } from '../../services/product.service';
import { ProductForm, FormData as ProductFormData } from './components/ProductForm';
import { ProductImagesModal } from './components/ProductImagesModal';
import { NoImagePlaceholder } from '../../assets/images';
import { formatCurrency } from '@workspace/config';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gridInitialized, setGridInitialized] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
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

  const handleUpdateImages = async (images: { imageUrl: string }[]) => {
    if (!selectedProductForImages) return;

    setLoading(true);
    try {
      await productService.updateProduct(selectedProductForImages.id, {
        // Use direct array assignment instead of Prisma syntax
        productImage: images as ProductImage[],
      });
      showSuccess('Product images updated successfully');
      await loadProducts();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update product images');
    } finally {
      setLoading(false);
    }
  };

  const columnDefs: ColDef<Product>[] = useMemo<ColDef<Product>[]>(
    () => [
      { field: 'id', sortable: true, flex: 1, headerName: 'ID', maxWidth: 100 },
      {
        field: 'productImage',
        flex: 1,
        sortable: false,
        headerName: 'Product Images',
        maxWidth: 200,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams<Product>) => {
          const product = params.data;
          if (!product) return null;

          const images = product.productImage || [];
          const processedImages =
            images.length > 0
              ? images.map((img) => ({
                  url: img.imageUrl.startsWith('http')
                    ? img.imageUrl
                    : new URL(img.imageUrl, import.meta.env.VITE_SERVER_URL).toString(),
                  alt: `${product.name} product image`,
                }))
              : [{ url: NoImagePlaceholder, alt: 'No product image' }];

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ImageCarousel
                images={processedImages}
                thumbnailSize={{ width: '50px', height: '50px' }}
                showAll={false}
              />
              <Tooltip title={images.length ? 'Manage Images' : 'Add Images'}>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => {
                    setSelectedProductForImages(product);
                    setIsImageModalOpen(true);
                  }}
                >
                  {images.length ? <ImageIcon /> : <AddBoxIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
      { field: 'name', sortable: true, flex: 1, headerName: 'Name', minWidth: 200 },
      { field: 'description', flex: 1, headerName: 'Description', minWidth: 200 },
      { field: 'SKU', flex: 1, sortable: false, headerName: 'SKU', maxWidth: 150, minWidth: 120 },
      {
        field: 'price',
        flex: 1,
        headerName: 'Price',
        sortable: true,
        maxWidth: 250,
        valueFormatter: (params) => {
          return formatCurrency(params.value, 'INR');
        },
      },
      {
        field: 'isPublished',
        flex: 1,
        sortable: true,
        headerName: 'Status',
        maxWidth: 200,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<Product>) => {
          return (
            <Chip
              sx={{ width: '100%', height: '30px' }}
              label={params.value ? 'Published' : 'Draft'}
              color={params.value ? 'success' : 'default'}
              size='small'
              variant='outlined'
            />
          );
        },
      },
      {
        field: 'inventory.quantity',
        flex: 1,
        sortable: false,
        headerName: 'Quantity',
        maxWidth: 100,
      },
      {
        field: 'averageRating',
        flex: 1,
        sortable: true,
        headerName: 'Rating',
        maxWidth: 160,
        minWidth: 160,
        cellRenderer: (params: ICellRendererParams<Product>) => {
          const value = Number(params?.value);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={value} precision={0.1} readOnly size='small' />
              <span>({value.toFixed(1)})</span>
            </Box>
          );
        },
      },
      {
        headerName: 'Actions',
        field: 'id',
        flex: 1,
        sortable: false,
        maxWidth: 160,
        minWidth: 160,
        cellStyle: {
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
        },
        cellRenderer: (params: ICellRendererParams<Product>) => {
          const product = params.data;
          if (!product) return <></>;
          return (
            <Box sx={{ width: '100%' }}>
              <Tooltip title='Manage Images'>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => {
                    setSelectedProductForImages(product);
                    setIsImageModalOpen(true);
                  }}
                >
                  <ImageIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Manage Variants'>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => navigate(`/admin/products/variants?productId=${product.id}`)}
                >
                  <LibraryAddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Edit product'>
                <IconButton size='small' onClick={() => handleEdit(product)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete product'>
                <IconButton size='small' color='error' onClick={() => handleDelete(product.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [navigate, setSelectedProductForImages, setIsImageModalOpen],
  );

  const handleGridReady = useCallback(() => {
    setGridInitialized(true);
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page: page + 1,
        limit: pageSize,
        sortBy: sortModel?.field as 'id' | 'name' | 'price' | 'createdAt',
        sortOrder: sortModel?.sort,
      });
      setProducts(response.data);
      setTotalProducts(response.meta.total);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load products');
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
        await loadProducts();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadProducts]);

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

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setLoading(true);
    try {
      await productService.deleteProduct(productToDelete);
      await loadProducts();
      showSuccess('Product deleted successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    setLoading(true);
    try {
      const sanitizedData = {
        ...formData,
        categoryId: Number(formData.categoryId),
      };

      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, sanitizedData);
        showSuccess('Product updated successfully');
      } else {
        await productService.createProduct(sanitizedData);
        showSuccess('Product created successfully');
      }
      setIsModalOpen(false);
      setTimeout(() => {
        setSelectedProduct(null);
      }, 100);
      await loadProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      showError(errorMessage);
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

  // Load categories when component mounts
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryService.getCategories({
        limit: 100, // Load all categories for the dropdown
      });
      setCategories(response.data);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load categories');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); //todo

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return (
    <DashboardLayout title='Products Management'>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant='contained' onClick={() => setIsModalOpen(true)}>
          Add Product
        </Button>
      </Box>

      <DataTableV2<Product>
        columns={columnDefs}
        data={products}
        total={totalProducts}
        page={page}
        pageSize={pageSize}
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

      <ProductForm
        open={isModalOpen}
        product={selectedProduct}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => {
            setSelectedProduct(null);
          }, 100);
        }}
        onSubmit={handleFormSubmit}
      />

      <ProductImagesModal
        open={isImageModalOpen}
        onClose={async () => {
          setIsImageModalOpen(false);
          setSelectedProductForImages(null);
          // refresh the product list
          await loadProducts();
        }}
        images={selectedProductForImages?.productImage || []}
        onSave={handleUpdateImages}
        isLoading={loading}
        productId={selectedProductForImages?.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this product? This action cannot be undone.'
        confirmLabel='Delete'
        confirmColor='error'
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        isLoading={loading}
      />
    </DashboardLayout>
  );
};

export default Products;
