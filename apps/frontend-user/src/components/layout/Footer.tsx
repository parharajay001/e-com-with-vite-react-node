export const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white pt-12 pb-6'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
          <div>
            <h3 className='text-xl font-semibold mb-4'>StatuaryArt</h3>
            <p className='mb-4 text-gray-400'>
              Bringing history and art to your home with our exquisite collection of statues from
              across cultures and time periods.
            </p>
            <div className='flex space-x-4'>
              <a href='#' className='text-gray-400 hover:text-white'>
                <svg
                  className='w-6 h-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'></path>
                </svg>
              </a>
              <a href='#' className='text-gray-400 hover:text-white'>
                <svg
                  className='w-6 h-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm6.11 6.611c1.331 0 2.413 1.082 2.413 2.413s-1.082 2.413-2.413 2.413-2.413-1.082-2.413-2.413c0-1.331 1.082-2.413 2.413-2.413zm-6.127 7.363c-1.863 0-3.374-1.511-3.374-3.374s1.511-3.374 3.374-3.374 3.374 1.511 3.374 3.374-1.511 3.374-3.374 3.374z'></path>
                </svg>
              </a>
              <a href='#' className='text-gray-400 hover:text-white'>
                <svg
                  className='w-6 h-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z'></path>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className='font-semibold mb-4'>Shop</h4>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <a href='#' className='hover:text-white'>
                  All Products
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Greek Statues
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Roman Statues
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Egyptian Statues
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Renaissance Statues
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold mb-4'>Customer Service</h4>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <a href='#' className='hover:text-white'>
                  Contact Us
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold mb-4'>Contact</h4>
            <ul className='space-y-2 text-gray-400'>
              <li>1234 Statue Avenue</li>
              <li>Art District, Creative City</li>
              <li>contact@statuaryart.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-800 pt-6 text-center text-gray-400'>
          <p>&copy; {new Date().getFullYear()} StatuaryArt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
