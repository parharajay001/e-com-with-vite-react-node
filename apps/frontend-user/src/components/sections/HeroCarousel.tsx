import { ChevronLeft, ChevronRight } from '@workspace/ui/src/lib/mui-icons';

interface BannerImage {
  image: string;
  title: string;
  description: string;
}

interface HeroCarouselProps {
  bannerImages: BannerImage[];
  currentBanner: number;
  setCurrentBanner: (index: number) => void;
}

export const HeroCarousel = ({
  bannerImages,
  currentBanner,
  setCurrentBanner,
}: HeroCarouselProps) => {
  const nextBanner = () => {
    setCurrentBanner(currentBanner === bannerImages.length - 1 ? 0 : currentBanner + 1);
  };

  const prevBanner = () => {
    setCurrentBanner(currentBanner === 0 ? bannerImages.length - 1 : currentBanner - 1);
  };

  return (
    <div className='container mx-auto relative overflow-hidden px-4'>
      <div className='w-full h-96 bg-cover bg-center relative'>
        <img
          src={`${bannerImages[currentBanner].image}`}
          className='absolute object-cover w-full h-full'
          crossOrigin='anonymous'
        />
        <div className='absolute inset-0 bg-black bg-opacity-40 flex items-center'>
          <div className='container mx-auto px-6 md:px-28'>
            <h2 className='text-4xl font-bold text-white md:text-5xl mb-4'>
              {bannerImages[currentBanner].title}
            </h2>
            <p className='text-xl text-white mb-8'>{bannerImages[currentBanner].description}</p>
            <button className='bg-white text-gray-800 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300'>
              Shop Now
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={prevBanner}
        className='absolute left-6 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-80'
      >
        <ChevronLeft />
      </button>
      <button
        onClick={nextBanner}
        className='absolute right-6 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-80'
      >
        <ChevronRight />
      </button>
      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
        {bannerImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`h-2 w-2 rounded-full ${
              currentBanner === index ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
