import { Close, Menu, Search, ShoppingCart } from '@workspace/ui/src/lib/mui-icons';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navigation = ({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) => {
  return (
    <>
      {/* Navigation */}
      <nav className='bg-white shadow-md'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <button
                className='mr-2 block md:hidden'
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <Close /> : <Menu />}
              </button>
              <h1 className='text-2xl font-bold text-gray-800'>Sahyadri Arts</h1>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex space-x-8'>
              <a href='#' className='text-gray-800 hover:text-gray-600'>
                Home
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600'>
                Shop
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600'>
                Collections
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600'>
                About
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600'>
                Contact
              </a>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='relative hidden md:block'>
                <input
                  type='text'
                  placeholder='Search statues...'
                  className='pl-10 pr-4 py-2 border rounded-full w-64'
                />
                <Search className='absolute left-3 top-2.5 text-gray-400' />
              </div>
              <button className='relative'>
                <ShoppingCart />
                <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='md:hidden bg-white shadow-lg py-4'>
          <div className='container mx-auto px-4'>
            <div className='flex flex-col space-y-3'>
              <a href='#' className='text-gray-800 hover:text-gray-600 py-2 border-b'>
                Home
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600 py-2 border-b'>
                Shop
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600 py-2 border-b'>
                Collections
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600 py-2 border-b'>
                About
              </a>
              <a href='#' className='text-gray-800 hover:text-gray-600 py-2'>
                Contact
              </a>

              <div className='relative mt-2'>
                <input
                  type='text'
                  placeholder='Search statues...'
                  className='pl-10 pr-4 py-2 border rounded-full w-full'
                />
                <Search className='absolute left-3 top-2.5 text-gray-400' />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
