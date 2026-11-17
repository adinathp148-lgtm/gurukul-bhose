import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Download, ArrowRight, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export const HeroSection = ({ slides = [], institution = {} }) => {
  const { isMarathi } = useLanguage();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeSlides = (slides || [])
    .filter(s => s.active !== false)
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
  const effectiveSlides = activeSlides.length > 0 ? activeSlides : (slides || []);

  useEffect(() => {
    if (effectiveSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % effectiveSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [effectiveSlides.length]);

  const slide = effectiveSlides[currentSlideIndex] || effectiveSlides[0] || {};

  // Bilingual resolution helper
  const getSlideText = () => {
    if (isMarathi) {
      return {
        badge: slide.badge,
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        ctaPrimaryText: slide.ctaText || slide.ctaPrimary?.text || 'प्रवेश अर्ज करा / Apply',
        ctaSecondaryText: slide.ctaSecondary?.text || 'माहिती पत्रक (Brochure)'
      };
    }

    // English translations based on slide id/index
    if (currentSlideIndex === 1 || slide.id === 'slide-2') {
      return {
        badge: 'Sainik Pattern Residential Training',
        title: 'Assured Government Jobs & Careers After 12th',
        subtitle: 'NDA, Army, Navy, Airforce, Police, MPSC, UPSC',
        description: 'Daily morning & evening physical training, rifle shooting and competitive exam coaching alongside regular schooling.',
        ctaPrimaryText: 'Explore Courses',
        ctaSecondaryText: 'Campus Contact'
      };
    }
    if (currentSlideIndex === 2 || slide.id === 'slide-3') {
      return {
        badge: 'Proven Tradition of Academic Excellence',
        title: 'Gurukul Residential Science & Talent Academy',
        subtitle: 'NEET, JEE, MHT-CET, Scholarship, Navodaya School',
        description: 'Personalized mentorship, only 30 students per class, modern digital labs and expert coaching faculty.',
        ctaPrimaryText: 'About Gurukul Bhose',
        ctaSecondaryText: 'Watch Videos'
      };
    }
    return {
      badge: 'Admissions Open - Current Academic Year',
      title: 'Gurukul Vidyamandir & Junior College, Bhose',
      subtitle: '5th to 12th Std. Sainik Pattern Residential School & College',
      description: '4-acre scenic safe campus, military discipline, quality education and assured career success.',
      ctaPrimaryText: 'Apply for Admission',
      ctaSecondaryText: 'Download Brochure'
    };
  };

  const currentText = getSlideText();

  // Resolve target link for the primary CTA button
  const getPrimaryLink = () => {
    let link = slide.ctaLink || slide.ctaPrimary?.link;
    if (!link || link === '#' || link === '/') {
      if (currentSlideIndex === 1 || slide.id === 'slide-2') return '/courses';
      if (currentSlideIndex === 2 || slide.id === 'slide-3') return '/about';
      return '/admission-enquiry';
    }
    return link;
  };
  const primaryLink = getPrimaryLink();

  return (
    <section className="relative bg-gradient-to-br from-gurukul-navy-950 via-slate-900 to-gurukul-navy-900 text-white min-h-[500px] sm:min-h-[550px] lg:min-h-[620px] flex flex-col justify-center overflow-hidden">
      {/* Background slide image with overlay */}
      {(slide.image || slide.imageUrl) && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${slide.image || slide.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gurukul-navy-950/95 via-gurukul-navy-950/85 to-gurukul-navy-900/75"></div>
        </div>
      )}

      {/* Decorative dot matrix */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10 w-full flex-1 flex items-center">
        <div className="max-w-3xl space-y-4 sm:space-y-6">
          
          {currentText.badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gurukul-saffron-500/20 border border-gurukul-saffron-500/40 text-gurukul-saffron-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentText.badge}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {currentText.title}
          </h1>

          <p className="text-base sm:text-xl text-yellow-400 font-bold">
            {currentText.subtitle}
          </p>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-medium">
            {currentText.description}
          </p>

          {/* Quick highlights badges */}
          <div className="flex flex-wrap gap-2 pt-1 sm:pt-2">
            <span className="px-2.5 sm:px-3 py-1 bg-white/10 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-sm border border-white/15">
              {isMarathi ? '✓ नो डोनेशन, थेट प्रवेश' : '✓ No Donation, Direct Admission'}
            </span>
            <span className="px-2.5 sm:px-3 py-1 bg-white/10 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-sm border border-white/15">
              {isMarathi ? '✓ रोज सकाळ-संध्याकाळ मैदानी सराव' : '✓ Daily Morning & Evening Ground Drills'}
            </span>
            <span className="px-2.5 sm:px-3 py-1 bg-white/10 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-sm border border-white/15">
              {isMarathi ? '✓ NDA, Army, Police भरती पूर्वतयारी' : '✓ NDA, Army & Police Recruitment Prep'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
            <Button 
              to={primaryLink}
              variant="primary" 
              size="lg" 
              className="w-full sm:w-auto shadow-lg shadow-orange-500/25"
            >
              <span>{currentText.ctaPrimaryText}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button 
              href={slide.ctaSecondary?.link || institution.brochureUrl || "https://bit.ly/3mUeaH6"} 
              target="_blank" 
              rel="noopener noreferrer"
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2 text-gurukul-saffron-400" />
              <span>{currentText.ctaSecondaryText}</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Mobile Slide Dots */}
      {effectiveSlides.length > 1 && (
        <div className="sm:hidden flex items-center justify-center gap-2 pb-5 relative z-20">
          {effectiveSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlideIndex ? 'w-6 bg-gurukul-saffron-500' : 'w-2 bg-white/40'
              }`}
              title={`Slide ${idx + 1}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Navigation Controls */}
      {effectiveSlides.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2">
          <button
            onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + effectiveSlides.length) % effectiveSlides.length)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-colors"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {effectiveSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex ? 'w-6 bg-gurukul-saffron-500' : 'w-2 bg-white/40'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % effectiveSlides.length)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-sm transition-colors"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
