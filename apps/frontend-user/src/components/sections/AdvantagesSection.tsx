export const AdvantagesSection = () => {
  return (
    <section className='py-12 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='text-center p-6'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-gray-800'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M5 13l4 4L19 7'
                ></path>
              </svg>
            </div>
            <h3 className='text-xl font-semibold mb-2'>Authentic Replicas</h3>
            <p className='text-gray-600'>
              Each piece is carefully crafted to ensure historical accuracy and artistic integrity.
            </p>
          </div>
          <div className='text-center p-6'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-gray-800'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                ></path>
              </svg>
            </div>
            <h3 className='text-xl font-semibold mb-2'>Worldwide Shipping</h3>
            <p className='text-gray-600'>
              We carefully pack and ship our statues to customers around the globe.
            </p>
          </div>
          <div className='text-center p-6'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-gray-800'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                ></path>
              </svg>
            </div>
            <h3 className='text-xl font-semibold mb-2'>Money-Back Guarantee</h3>
            <p className='text-gray-600'>Not satisfied? Return within 30 days for a full refund.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
