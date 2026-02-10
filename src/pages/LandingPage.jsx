import { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsBar from '../components/landing/StatsBar';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import MiniDemo from '../components/landing/MiniDemo';
import Testimonials from '../components/landing/Testimonials';
import PricingSection from '../components/landing/PricingSection';
import FAQ from '../components/landing/FAQ';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'TablePlanner — Free Event Seating Chart Maker';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesGrid />
      <HowItWorks />
      <MiniDemo />
      <Testimonials />
      <PricingSection />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
