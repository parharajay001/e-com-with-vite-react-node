import { useEffect, useState } from 'react';
import { Product, productService } from '../../services/product.service';
import { NoImagePlaceholder } from '../../assets/images';
import { formatCurrency } from '@workspace/config';

export const FeaturedProductsSection = () => {
  const [featuredStatues, setFeaturedStatues] = useState<Product[]>([]);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchStatues = async () => {
      const response = await productService.getProducts({ page: 1, limit: 6 }); // Replace with your API endpoint
      setFeaturedStatues(response?.data ?? []);
    };

    fetchStatues();
  }, []);

  return (
    <section className='py-12 bg-gray-50'>
      <div className='container mx-auto px-4'>
        <h2 className='text-3xl font-bold text-center mb-8'>Featured Statues</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6'>
          {featuredStatues.map((statue) => (
            <div
              key={statue.id}
              className='bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300'
            >
              <div className='relative'>
                <img
                  src={
                    statue.productImage[0]?.imageUrl
                      ? statue.productImage[0]?.imageUrl.startsWith('http')
                        ? statue.productImage[0]?.imageUrl
                        : new URL(
                            statue.productImage[0]?.imageUrl,
                            import.meta.env.VITE_SERVER_URL,
                          ).toString()
                      : NoImagePlaceholder
                  }
                  alt={statue.name}
                  className='w-full h-64 object-cover hover:scale-105 transition-transform duration-300'
                  crossOrigin='anonymous'
                />
                <div className='absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-800'>
                  {statue.category.name}
                </div>
              </div>
              <div className='p-3'>
                <h3 className='text-lg font-semibold mb-2'>{statue.name}</h3>
                <div className='flex justify-between items-center mt-4'>
                  <span className='text-xl font-bold'>{formatCurrency(statue.price, 'INR')}</span>
                  <button className='bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700'>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='text-center mt-8'>
          <button className='bg-transparent border-2 border-gray-800 text-gray-800 font-semibold py-2 px-8 rounded-lg hover:bg-gray-800 hover:text-white transition duration-300'>
            View All Statues
          </button>
        </div>
      </div>
    </section>
  );
};
