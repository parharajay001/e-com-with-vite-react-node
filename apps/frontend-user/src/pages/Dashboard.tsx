import { useState } from 'react';
import { Footer } from '../components/layout/Footer';
import { Navigation } from '../components/layout/Navigation';
import { AdvantagesSection } from '../components/sections/AdvantagesSection';
import { CategoriesSection } from '../components/sections/CategoriesSection';
import { FeaturedProductsSection } from '../components/sections/FeaturedProductsSection';
import { HeroCarousel } from '../components/sections/HeroCarousel';
import { NewsletterSection } from '../components/sections/NewsletterSection';
import { bannerImages } from '../constants/data';

export const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <HeroCarousel
        bannerImages={bannerImages}
        currentBanner={currentBanner}
        setCurrentBanner={setCurrentBanner}
      />

      <CategoriesSection />

      <FeaturedProductsSection />

      <AdvantagesSection />

      <NewsletterSection />

      <Footer />
    </div>
  );
};

export default Dashboard;
