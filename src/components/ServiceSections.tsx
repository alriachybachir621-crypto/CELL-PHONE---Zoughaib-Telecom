import React, { useState } from 'react';
import {
  BadgeDollarSign,
  BatteryCharging,
  Camera,
  ExternalLink,
  MonitorSmartphone,
  ShieldCheck,
  Terminal,
  Usb,
  Volume2,
  Wrench,
} from 'lucide-react';
import { Language, RepairIconKey, RepairService, ShopSettings } from '../types';
import { buildWhatsAppUrl, TRANSLATIONS } from '../i18n';
import { DeviceVisual } from './DeviceVisual';
import { WhatsAppIcon } from './WhatsAppButton';

interface ServiceSectionsProps {
  lang: Language;
  repairs: RepairService[];
  settings: ShopSettings;
}

function RepairIcon({ iconKey }: { iconKey: RepairIconKey }) {
  const cls = 'h-5 w-5 text-[#1499D6]';
  switch (iconKey) {
    case 'screen':
      return <MonitorSmartphone className={cls} />;
    case 'battery':
      return <BatteryCharging className={cls} />;
    case 'port':
      return <Usb className={cls} />;
    case 'software':
      return <Terminal className={cls} />;
    case 'camera':
      return <Camera className={cls} />;
    case 'speaker':
      return <Volume2 className={cls} />;
    default:
      return <Wrench className={cls} />;
  }
}

export const ServiceSections: React.FC<ServiceSectionsProps> = ({
  lang,
  repairs,
  settings,
}) => {
  const t = TRANSLATIONS[lang];

  // Sell Your Phone form state
  const [sellModel, setSellModel] = useState('');
  const [sellStorage, setSellStorage] = useState('256GB');
  const [sellCondition, setSellCondition] = useState('Like New');
  const [sellNotes, setSellNotes] = useState('');

  // Custom Repair inquiry form state
  const [repairModel, setRepairModel] = useState('');
  const [repairIssue, setRepairIssue] = useState('');

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellModel.trim()) return;
    const msg =
      lang === 'ar'
        ? [
            'مرحباً CELL PHONE - Zoughaib Telecom، أود بيع هاتفي:',
            `• الموديل: ${sellModel.trim()}`,
            `• السعة: ${sellStorage}`,
            `• الحالة: ${sellCondition}`,
            sellNotes.trim() ? `• ملاحظات: ${sellNotes.trim()}` : '',
          ]
            .filter(Boolean)
            .join('\n')
        : [
            'Hello CELL PHONE - Zoughaib Telecom, I want to sell my phone:',
            `• Model: ${sellModel.trim()}`,
            `• Storage: ${sellStorage}`,
            `• Condition: ${sellCondition}`,
            sellNotes.trim() ? `• Notes: ${sellNotes.trim()}` : '',
          ]
            .filter(Boolean)
            .join('\n');

    window.open(buildWhatsAppUrl(settings.whatsappNumber, msg), '_blank', 'noopener,noreferrer');
  };

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairModel.trim() || !repairIssue.trim()) return;
    const msg =
      lang === 'ar'
        ? [
            'مرحباً CELL PHONE - Zoughaib Telecom، أحتاج صيانة لهاتفي:',
            `• الموديل: ${repairModel.trim()}`,
            `• المشكلة: ${repairIssue.trim()}`,
          ].join('\n')
        : [
            'Hello CELL PHONE - Zoughaib Telecom, I need a repair quote:',
            `• Phone Model: ${repairModel.trim()}`,
            `• Problem: ${repairIssue.trim()}`,
          ].join('\n');

    window.open(buildWhatsAppUrl(settings.whatsappNumber, msg), '_blank', 'noopener,noreferrer');
  };

  const gallery =
    settings.galleryImages && settings.galleryImages.length > 0
      ? settings.galleryImages
      : ['preset:hero-flagships', 'preset:repair-bench', 'preset:store-showcase', 'preset:accessories'];

  return (
    <>
      {/* Section 5: Sell Your Phone */}
      <section id="sell" className="bg-[#F3F5F8] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-[#26286B]/8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1499D6]">
                <BadgeDollarSign className="h-4 w-4 text-[#A8C814]" />
                <span>{lang === 'ar' ? 'تبديل أو بيع نقدي' : 'Trade-in or Cash Offer'}</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#26286B] sm:text-3xl [text-wrap:balance]">
                {t.sellTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#26286B]/75">{t.sellSub}</p>
            </div>

            <form onSubmit={handleSellSubmit} className="lg:col-span-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#26286B]">
                  {t.sellModelLabel}
                </label>
                <input
                  type="text"
                  required
                  value={sellModel}
                  onChange={(e) => setSellModel(e.target.value)}
                  placeholder={t.sellModelPlaceholder}
                  className="h-11 w-full rounded-xl bg-[#F3F5F8] px-3.5 text-sm text-[#26286B] placeholder:text-[#26286B]/45 border border-transparent focus:border-[#1499D6] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#26286B]">
                  {t.sellStorageLabel}
                </label>
                <select
                  value={sellStorage}
                  onChange={(e) => setSellStorage(e.target.value)}
                  className="h-11 w-full rounded-xl bg-[#F3F5F8] px-3.5 text-sm font-medium text-[#26286B] border border-transparent focus:border-[#1499D6] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="64GB">64GB</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#26286B]">
                  {t.sellConditionLabel}
                </label>
                <select
                  value={sellCondition}
                  onChange={(e) => setSellCondition(e.target.value)}
                  className="h-11 w-full rounded-xl bg-[#F3F5F8] px-3.5 text-sm font-medium text-[#26286B] border border-transparent focus:border-[#1499D6] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Like New">{t.sellCondLikeNew}</option>
                  <option value="Good">{t.sellCondGood}</option>
                  <option value="Fair">{t.sellCondFair}</option>
                  <option value="Needs Repair">{t.sellCondRepair}</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#26286B]">
                  {t.sellNotesLabel}
                </label>
                <input
                  type="text"
                  value={sellNotes}
                  onChange={(e) => setSellNotes(e.target.value)}
                  placeholder={t.sellNotesPlaceholder}
                  className="h-11 w-full rounded-xl bg-[#F3F5F8] px-3.5 text-sm text-[#26286B] placeholder:text-[#26286B]/45 border border-transparent focus:border-[#1499D6] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#26286B] px-6 text-sm font-semibold text-white hover:bg-[#1c1e57] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#A8C814]" />
                  <span>{t.sellSubmit}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Section 6: Repair Services */}
      <section id="repair" className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-[#26286B] sm:text-3xl">
              {t.repairTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#26286B]/70">{t.repairSub}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {repairs.map((repair) => {
              const title = lang === 'ar' && repair.titleAr ? repair.titleAr : repair.title;
              const desc =
                lang === 'ar' && repair.descriptionAr ? repair.descriptionAr : repair.description;
              const eta =
                lang === 'ar' && repair.estimatedTimeAr
                  ? repair.estimatedTimeAr
                  : repair.estimatedTime;

              const waMsg =
                lang === 'ar'
                  ? `مرحباً CELL PHONE - Zoughaib Telecom، أود الاستفسار عن سعر خدمة: ${title}`
                  : `Hello CELL PHONE - Zoughaib Telecom, I would like to ask for a price for: ${title}`;

              return (
                <div
                  key={repair.id}
                  className="flex flex-col justify-between rounded-2xl bg-[#F3F5F8] p-5 border border-[#26286B]/6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs">
                        <RepairIcon iconKey={repair.iconKey} />
                      </div>
                      {eta && (
                        <span className="text-xs font-medium text-[#26286B]/60">{eta}</span>
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#26286B]">
                      {title}
                    </h3>
                    {desc && (
                      <p className="mt-1.5 text-xs leading-relaxed text-[#26286B]/70">{desc}</p>
                    )}
                  </div>

                  <a
                    href={buildWhatsAppUrl(settings.whatsappNumber, waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-[#26286B] shadow-xs hover:bg-[#25D366] hover:text-white transition-colors"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    <span>{t.repairAskPrice}</span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Custom Repair Request Form */}
          <form
            onSubmit={handleRepairSubmit}
            className="mt-8 grid grid-cols-1 items-center gap-3 rounded-2xl border border-[#1499D6]/25 bg-[#1499D6]/5 p-5 lg:grid-cols-12"
          >
            <div className="lg:col-span-4">
              <h3 className="font-display text-base font-bold text-[#26286B]">
                {t.repairCustomTitle}
              </h3>
              <p className="text-xs text-[#26286B]/70">{t.repairCustomSub}</p>
            </div>
            <div className="lg:col-span-3">
              <input
                type="text"
                required
                value={repairModel}
                onChange={(e) => setRepairModel(e.target.value)}
                placeholder={t.repairModelPlaceholder}
                className="h-11 w-full rounded-xl bg-white px-3.5 text-sm text-[#26286B] placeholder:text-[#26286B]/45 border border-[#26286B]/12 focus:border-[#1499D6] focus:outline-none"
              />
            </div>
            <div className="lg:col-span-3">
              <input
                type="text"
                required
                value={repairIssue}
                onChange={(e) => setRepairIssue(e.target.value)}
                placeholder={t.repairIssuePlaceholder}
                className="h-11 w-full rounded-xl bg-white px-3.5 text-sm text-[#26286B] placeholder:text-[#26286B]/45 border border-[#26286B]/12 focus:border-[#1499D6] focus:outline-none"
              />
            </div>
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1499D6] px-4 text-xs font-semibold text-white hover:bg-[#1086bd] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>{t.repairSendBtn}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Section 7: Why Zoughaib Telecom */}
      <section className="bg-[#F3F5F8] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-[#26286B] sm:text-3xl">
              {t.whyTitle}
            </h2>
            <p className="mt-1.5 text-sm text-[#26286B]/70">{t.whySub}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-[#26286B]/6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1499D6]/12 text-[#1499D6]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#26286B]">
                {t.why1Title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#26286B]/70">{t.why1Desc}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs border border-[#26286B]/6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A8C814]/20 text-[#5D7200]">
                <BadgeDollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#26286B]">
                {t.why2Title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#26286B]/70">{t.why2Desc}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-xs border border-[#26286B]/6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#26286B]/10 text-[#26286B]">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#26286B]">
                {t.why3Title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#26286B]/70">{t.why3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Shop Gallery + Facebook Page */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#26286B] sm:text-3xl">
                {t.galleryTitle}
              </h2>
              <p className="mt-1.5 text-sm text-[#26286B]/70">{t.gallerySub}</p>
            </div>

            <a
              href={
                settings.facebookUrl ||
                'https://www.facebook.com/search/top?q=CELLphone%20-%20Zoughaib%20Telecom'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1877F2]/10 px-4 text-xs font-semibold text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <span>{t.followFacebook}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {gallery.map((img, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-[#F3F5F8] border border-[#26286B]/6"
              >
                <DeviceVisual
                  src={img}
                  alt={`CELL PHONE - Zoughaib Telecom Gallery ${i + 1}`}
                  aspect="4/3"
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
