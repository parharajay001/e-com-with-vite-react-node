export const LoadingSpinner: React.FC = () => {
  return (
    <div className='absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-50'>
      <div className='relative inline-block'>
        <div className='animate-ping absolute h-8 w-8 rounded-full bg-indigo-400 opacity-75'></div>
        <div className='animate-spin relative rounded-full h-8 w-8 border-4 border-transparent border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-rose-500'></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
