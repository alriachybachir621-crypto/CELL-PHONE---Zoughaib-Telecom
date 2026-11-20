import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { Language, ShopSettings } from '../types';
import { buildWhatsAppUrl, TRANSLATIONS } from '../i18n';
import { DeviceVisual } from './DeviceVisual';
import { WhatsAppIcon } from './WhatsAppButton';

interface HeroProps {
  lang: Language;
  settings: ShopSettings;
}

export const Hero: React.FC<HeroProps> = ({ lang, settings }) => {
  const t = TRANSLATIONS[lang];
  const heroImages =
    settings.heroImages && settings.heroImages.length > 0
      ? settings.heroImages
      : ['preset:hero-flagships'];
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    if (slideIdx >= heroImages.length) {
      setSlideIdx(0);
    }
  }, [heroImages.length, slideIdx]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  const title =
    lang === 'ar'
      ? settings.heroTitleAr || t.heroTitle
      : settings.heroTitle || t.heroTitle;

  const subtitle =
    lang === 'ar'
      ? settings.heroSubtitleAr || t.heroSubtitle
      : settings.heroSubtitle || t.heroSubtitle;

  const repairWaUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    lang === 'ar'
      ? 'مرحباً CELL PHONE - Zoughaib Telecom، أود الاستفسار عن صيانة هاتف.'
      : 'Hello CELL PHONE - Zoughaib Telecom, I would like to ask about a phone repair.'
  );

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Subtle Logo-Inspired Swoosh Curves */}
      <svg
        viewBox="0 0 1200 420"
        className="pointer-events-none absolute -top-8 end-0 h-[420px] w-auto opacity-60"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M420 40C640 10 920 80 1160 280"
          stroke="#1499D6"
          strokeOpacity="0.10"
          strokeWidth="28"
          strokeLinecap="round"
        />
        <path
          d="M470 95C690 65 950 130 1175 330"
          stroke="#A8C814"
          strokeOpacity="0.14"
          strokeWidth="18"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Brand Lockup, Headline, CTAs */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <div className="mb-5 flex items-center gap-3">
              <img
                src="/logo.png"
                alt="CELL PHONE - Zoughaib Telecom"
                className="h-14 w-auto rounded-xl border border-[#26286B]/10 bg-white p-1.5 shadow-sm"
              />
              <span className="text-xs font-medium text-[#26286B]/70">
                Zahle, Lebanon
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-[#26286B] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08] [text-wrap:balance]">
              {title}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#26286B]/75 sm:text-lg">
              {subtitle}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#shop"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#26286B] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#26286B]/20 hover:bg-[#1c1e57] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
              >
                <span>{t.heroShopBtn}</span>
                <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </a>

              <a
                href={repairWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#1499D6]/35 bg-[#1499D6]/8 px-5 py-3 text-sm font-semibold text-[#1499D6] hover:bg-[#1499D6] hover:text-white active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>{t.heroRepairBtn}</span>
              </a>
            </div>

            {/* Trust Strip */}
            <div className="mt-8 flex items-center gap-2.5 border-t border-[#26286B]/10 pt-5 text-sm font-medium text-[#26286B]/80">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#A8C814]" />
              <span>{t.trustStrip}</span>
            </div>
          </div>

          {/* Right Column: Replaceable Product Showcase Area */}
          <div className="lg:col-span-6">
            <div className="relative h-full overflow-hidden rounded-3xl bg-[#F3F5F8] p-3 shadow-sm border border-[#26286B]/8">
              <div className="relative overflow-hidden rounded-2xl bg-white">
                <DeviceVisual
                  src={heroImages[slideIdx]}
                  alt="Gulf Flagship Smartphones at CELL PHONE - Zoughaib Telecom"
                  aspect="4/3"
                  className="w-full"
                />

                {heroImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSlideIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length)
                      }
                      className="absolute start-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#26286B] shadow hover:bg-white cursor-pointer"
                      aria-label="Previous hero image"
                    >
                      <ChevronLeft className={`h-5 w-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideIdx((prev) => (prev + 1) % heroImages.length)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#26286B] shadow hover:bg-white cursor-pointer"
                      aria-label="Next hero image"
                    >
                      <ChevronRight className={`h-5 w-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/85 px-2.5 py-1.5 backdrop-blur-sm">
                      {heroImages.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSlideIdx(i)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            i === slideIdx ? 'w-5 bg-[#1499D6]' : 'w-2 bg-[#26286B]/25'
                          }`}
                          aria-label={`Slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
