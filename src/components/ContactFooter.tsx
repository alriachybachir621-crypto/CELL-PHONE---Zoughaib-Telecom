import React from 'react';
import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { Language, ShopSettings } from '../types';
import { buildWhatsAppUrl, TRANSLATIONS } from '../i18n';
import { WhatsAppIcon } from './WhatsAppButton';

interface ContactFooterProps {
  lang: Language;
  settings: ShopSettings;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({ lang, settings }) => {
  const t = TRANSLATIONS[lang];
  const address = lang === 'ar' ? settings.addressAr || settings.address : settings.address;
  const hours = lang === 'ar' ? settings.hoursAr || settings.hours : settings.hours;
  const mapsEmbed =
    settings.mapsEmbedUrl || 'https://www.google.com/maps?q=Zahle,+Lebanon&output=embed';
  const mapsLink = settings.mapsLink || 'https://maps.google.com/?q=Zahle,+Lebanon';

  return (
    <>
      {/* Section 9: Contact & Maps */}
      <section id="contact" className="bg-[#F3F5F8] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-[#26286B] sm:text-3xl">
              {t.contactTitle}
            </h2>
            <p className="mt-1.5 text-sm text-[#26286B]/70">{t.contactSub}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Contact Info Card */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-8 shadow-xs border border-[#26286B]/8 lg:col-span-5 space-y-6">
              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/12 text-[#1da851]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#26286B]/60">{t.phoneWhatsApp}</p>
                    <a
                      href={`tel:${settings.whatsapp.replace(/\s+/g, '')}`}
                      dir="ltr"
                      className="mt-0.5 inline-block font-display text-base font-bold text-[#26286B] hover:text-[#1499D6] tabular-nums"
                    >
                      {settings.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1499D6]/12 text-[#1499D6]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#26286B]/60">{t.emailLabel}</p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="mt-0.5 inline-block text-sm font-semibold text-[#26286B] hover:text-[#1499D6] break-all"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A8C814]/20 text-[#5D7200]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#26286B]/60">{t.addressLabel}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#26286B]">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#26286B]/10 text-[#26286B]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#26286B]/60">{t.hoursLabel}</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#26286B]">{hours}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={buildWhatsAppUrl(settings.whatsappNumber, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs font-semibold text-white hover:bg-[#1fb858] transition-colors whitespace-nowrap"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>{t.chatWhatsApp}</span>
                </a>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#F3F5F8] px-4 text-xs font-semibold text-[#26286B] hover:bg-[#26286B] hover:text-white transition-colors whitespace-nowrap"
                >
                  <span>{t.openInMaps}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-xs border border-[#26286B]/8 lg:col-span-7 min-h-[320px]">
              <iframe
                title="CELL PHONE - Zoughaib Telecom Location in Zahle"
                src={mapsEmbed}
                className="h-full min-h-[304px] w-full rounded-2xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#26286B]/10 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CELL PHONE - Zoughaib Telecom"
              className="h-11 w-auto object-contain"
            />
            <span className="text-xs text-[#26286B]/65">
              © {new Date().getFullYear()} {t.footerRights}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-[#26286B]/75">
            <a href="#shop" className="hover:text-[#1499D6]">
              {t.navShop}
            </a>
            <a href="#sell" className="hover:text-[#1499D6]">
              {t.navSell}
            </a>
            <a href="#repair" className="hover:text-[#1499D6]">
              {t.navRepair}
            </a>
            <a
              href={
                settings.facebookUrl ||
                'https://www.facebook.com/search/top?q=CELLphone%20-%20Zoughaib%20Telecom'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1877F2]"
            >
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};
