import { useNotification } from '@workspace/store';
import { useCallback, useEffect, useState } from 'react';
import { categoryService, Category } from '../../services/category.service';
import { NoImagePlaceholder } from '../../assets/images';

export const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { showError } = useNotification();

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryService.getCategories({
        page: 1,
        limit: 6,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      setCategories(data);
    } catch (error) {
      showError('Error fetching categories:' + (error as Error).message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // todo

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <section className='py-12 bg-white'>
      <div className='container mx-auto px-4'>
        <h2 className='text-3xl font-bold text-center mb-8'>Browse By Category</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {categories.map((category) => (
            <div
              key={category.name}
              className='bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition duration-300'
            >
              <img
                src={
                  category?.imageUrl
                    ? new URL(category?.imageUrl, import.meta.env.VITE_SERVER_URL).toString()
                    : NoImagePlaceholder
                }
                alt={category.name}
                className='w-full h-40 object-cover hover:scale-105 transition-transform duration-300'
                crossOrigin='anonymous'
              />
              <div className='p-4 text-center'>
                <h3 className='font-semibold text-gray-800'>{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
