export const NewsletterSection = () => {
  return (
    <section className='py-12 bg-gray-800 text-white'>
      <div className='container mx-auto px-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-4'>Join Our Newsletter</h2>
          <p className='mb-6'>
            Subscribe to receive updates on new arrivals, special offers and other discount
            information.
          </p>
          <div className='flex flex-col sm:flex-row gap-2'>
            <input
              type='email'
              placeholder='Your email address'
              className='flex-grow px-4 py-3 rounded-lg text-gray-800'
            />
            <button className='bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200'>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
