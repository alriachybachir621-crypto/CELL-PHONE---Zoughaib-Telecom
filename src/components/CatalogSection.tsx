import React, { useMemo, useState } from 'react';
import { RotateCcw, Search, Smartphone, Sparkles } from 'lucide-react';
import { Brand, Condition, Language, Product } from '../types';
import { buildWhatsAppUrl, TRANSLATIONS } from '../i18n';
import { DeviceVisual } from './DeviceVisual';
import { ProductCard } from './ProductCard';
import { WhatsAppIcon } from './WhatsAppButton';

interface CatalogSectionProps {
  products: Product[];
  lang: Language;
  whatsappNumber: string;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

const BRAND_SHORTCUTS: { id: 'All' | Brand; en: string; ar: string }[] = [
  { id: 'All', en: 'All', ar: 'الكل' },
  { id: 'iPhone', en: 'iPhone', ar: 'آيفون' },
  { id: 'Samsung', en: 'Samsung', ar: 'سامسونج' },
  { id: 'Xiaomi', en: 'Xiaomi', ar: 'شاومي' },
  { id: 'Huawei', en: 'Huawei', ar: 'هواوي' },
  { id: 'Other', en: 'Other', ar: 'أخرى' },
  { id: 'Accessories', en: 'Accessories', ar: 'إكسسوارات' },
];

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  lang,
  whatsappNumber,
  wishlistIds,
  onToggleWishlist,
  onOpenProduct,
  onQuickAdd,
}) => {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<'All' | Brand>('All');
  const [selectedCondition, setSelectedCondition] = useState<'All' | Condition>('All');
  const [selectedStorage, setSelectedStorage] = useState<string>('All');
  const [selectedPrice, setSelectedPrice] = useState<'All' | 'under300' | '300to700' | 'over700'>('All');

  const latestArrivals = useMemo(
    () => products.filter((p) => p.isNew),
    [products]
  );

  const availableStorages = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => (p.storageOptions || []).forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (selectedCondition !== 'All' && p.condition !== selectedCondition) return false;
      if (selectedStorage !== 'All' && !(p.storageOptions || []).includes(selectedStorage)) {
        return false;
      }
      if (selectedPrice === 'under300' && p.price >= 300) return false;
      if (selectedPrice === '300to700' && (p.price < 300 || p.price > 700)) return false;
      if (selectedPrice === 'over700' && p.price <= 700) return false;

      if (q) {
        const hay = `${p.name} ${p.nameAr || ''} ${p.brand} ${p.category} ${p.description || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, search, selectedBrand, selectedCondition, selectedStorage, selectedPrice]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedBrand !== 'All' ||
    selectedCondition !== 'All' ||
    selectedStorage !== 'All' ||
    selectedPrice !== 'All';

  const resetFilters = () => {
    setSearch('');
    setSelectedBrand('All');
    setSelectedCondition('All');
    setSelectedStorage('All');
    setSelectedPrice('All');
  };

  return (
    <div id="shop" className="bg-white">
      {/* Brand Shortcuts Band */}
      <section className="border-y border-[#26286B]/8 bg-[#F3F5F8]/70 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {BRAND_SHORTCUTS.map((brand) => {
              const active = selectedBrand === brand.id;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#26286B] text-white shadow-sm'
                      : 'bg-white text-[#26286B] border border-[#26286B]/10 hover:border-[#1499D6] hover:text-[#1499D6]'
                  }`}
                >
                  {brand.id !== 'All' && (
                    <Smartphone className={`h-4 w-4 ${active ? 'text-[#A8C814]' : 'text-[#1499D6]'}`} />
                  )}
                  <span>{lang === 'ar' ? brand.ar : brand.en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Arrivals Strip (controlled by Admin "isNew" flag) */}
      {latestArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1499D6]">
                <Sparkles className="h-4 w-4 text-[#A8C814]" />
                <span>{t.latestArrivalsSub}</span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#26286B] sm:text-3xl">
                {t.latestArrivals}
              </h2>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory">
            {latestArrivals.map((item) => {
              const itemName = lang === 'ar' && item.nameAr ? item.nameAr : item.name;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenProduct(item)}
                  className="group w-64 shrink-0 snap-start rounded-2xl bg-[#F3F5F8] p-3 text-start border border-[#26286B]/6 hover:border-[#1499D6]/40 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-xl bg-white">
                    <DeviceVisual
                      src={item.images?.[0]}
                      alt={itemName}
                      aspect="4/3"
                      className="w-full group-hover:scale-[1.03] transition-transform duration-200"
                    />
                    <span className="absolute top-2 start-2 rounded-lg bg-[#A8C814] px-2 py-0.5 text-[11px] font-bold text-[#26286B]">
                      {t.newTag}
                    </span>
                  </div>
                  <div className="pt-2.5 px-1">
                    <p className="text-xs text-[#26286B]/60">
                      {item.brand} · {item.condition === 'New' ? t.conditionNew : t.conditionUsed}
                    </p>
                    <h3 className="mt-0.5 font-display text-sm font-semibold text-[#26286B] truncate group-hover:text-[#1499D6]">
                      {itemName}
                    </h3>
                    <div className="mt-1.5 flex items-baseline justify-between">
                      <span className="font-display text-base font-bold text-[#26286B] tabular-nums">
                        ${item.price}
                      </span>
                      <span className="text-xs font-medium text-[#1499D6]">
                        {item.inStock ? t.available : t.soldOut}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Catalog Grid + Search & Filters */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#26286B] sm:text-3xl">
              {t.shopCatalog}
            </h2>
            <p className="mt-1 text-sm text-[#26286B]/70">{t.shopCatalogSub}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl bg-[#F3F5F8] p-3.5 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#26286B]/45" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-11 w-full rounded-xl bg-white ps-10 pe-3 text-sm text-[#26286B] placeholder:text-[#26286B]/45 border border-[#26286B]/10 focus:border-[#1499D6] focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as 'All' | Condition)}
              aria-label={t.conditionLabel}
              className="h-11 w-full rounded-xl bg-white px-3 text-sm font-medium text-[#26286B] border border-[#26286B]/10 focus:border-[#1499D6] focus:outline-none cursor-pointer"
            >
              <option value="All">{t.conditionAll}</option>
              <option value="New">{t.conditionNew}</option>
              <option value="Used">{t.conditionUsed}</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              aria-label={t.storageLabel}
              className="h-11 w-full rounded-xl bg-white px-3 text-sm font-medium text-[#26286B] border border-[#26286B]/10 focus:border-[#1499D6] focus:outline-none cursor-pointer"
            >
              <option value="All">{t.storageAll}</option>
              {availableStorages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3 flex gap-2">
            <select
              value={selectedPrice}
              onChange={(e) =>
                setSelectedPrice(e.target.value as 'All' | 'under300' | '300to700' | 'over700')
              }
              aria-label="Price range"
              className="h-11 w-full rounded-xl bg-white px-3 text-sm font-medium text-[#26286B] border border-[#26286B]/10 focus:border-[#1499D6] focus:outline-none cursor-pointer"
            >
              <option value="All">{t.priceAll}</option>
              <option value="under300">{t.priceUnder300}</option>
              <option value="300to700">{t.price300to700}</option>
              <option value="over700">{t.priceOver700}</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                title={t.clearFilters}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#26286B] border border-[#26286B]/10 hover:bg-[#1499D6] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onOpenProduct={onOpenProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#F3F5F8] p-10 text-center">
            <h3 className="font-display text-lg font-semibold text-[#26286B]">
              {t.noProductsTitle}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-[#26286B]/70">
              {t.noProductsSub}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#26286B] shadow-xs hover:bg-[#26286B] hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t.clearFilters}</span>
                </button>
              )}
              <a
                href={buildWhatsAppUrl(
                  whatsappNumber,
                  lang === 'ar'
                    ? 'مرحباً زغيب تيليكوم، أبحث عن جهاز محدد.'
                    : 'Hello Zoughaib Telecom, I am looking for a specific device.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white hover:bg-[#1fb858] transition-colors"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>{t.askWhatsAppGeneral}</span>
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
