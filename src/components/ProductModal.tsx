import React, { useEffect, useState } from 'react';
import { BatteryCharging, Check, Heart, ShoppingBag, X } from 'lucide-react';
import { Language, Product } from '../types';
import { buildWhatsAppUrl, formatProductWhatsAppMessage, TRANSLATIONS } from '../i18n';
import { DeviceVisual } from './DeviceVisual';
import { WhatsAppIcon } from './WhatsAppButton';

interface ProductModalProps {
  product: Product | null;
  lang: Language;
  whatsappNumber: string;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, storage: string, color: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  lang,
  whatsappNumber,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(0);
    setSelectedStorage(product.storageOptions?.[0] || '');
    setSelectedColor(product.colors?.[0] || '');
    setJustAdded(false);
  }, [product]);

  if (!product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['preset:iphone-16-pro-max'];
  const displayName = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  const displayDesc =
    lang === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;

  const waUrl = buildWhatsAppUrl(
    whatsappNumber,
    formatProductWhatsAppMessage(product, selectedStorage, selectedColor, lang)
  );

  const handleAdd = () => {
    if (!product.inStock) return;
    onAddToCart(product, selectedStorage, selectedColor);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#26286B]/45 p-0 sm:p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close + Wishlist top controls */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-[#26286B]/60">
            {product.brand} · {product.condition === 'New' ? t.conditionNew : t.conditionUsed}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#26286B]/10 transition-colors cursor-pointer ${
                isWishlisted ? 'bg-rose-50 text-rose-500' : 'text-[#26286B]/60 hover:text-rose-500'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F5F8] text-[#26286B] hover:bg-[#26286B]/10 cursor-pointer"
              aria-label={t.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Gallery */}
          <div className="md:col-span-6 space-y-3">
            <div className="overflow-hidden rounded-2xl bg-[#F3F5F8] border border-[#26286B]/8">
              <DeviceVisual
                src={images[selectedImage] || images[0]}
                alt={displayName}
                aspect="4/3"
                className="w-full"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      i === selectedImage
                        ? 'border-[#1499D6]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <DeviceVisual src={img} alt={`${displayName} ${i + 1}`} aspect="4/3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Module */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#26286B] leading-tight">
                {displayName}
              </h2>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-[#26286B] tabular-nums">
                  ${product.price}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-base text-[#26286B]/45 line-through tabular-nums">
                    ${product.oldPrice}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold ${
                    product.inStock ? 'text-[#1499D6]' : 'text-rose-600'
                  }`}
                >
                  {product.inStock ? t.available : t.soldOut}
                </span>
              </div>

              {displayDesc && (
                <p className="mt-3 text-sm leading-relaxed text-[#26286B]/75">{displayDesc}</p>
              )}

              {/* Battery Health for Used Phones */}
              {product.condition === 'Used' && product.batteryHealth && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#A8C814]/15 px-3 py-2 text-xs font-semibold text-[#26286B]">
                  <BatteryCharging className="h-4 w-4 text-[#6B8200]" />
                  <span>
                    {t.batteryHealth}: <span className="tabular-nums">{product.batteryHealth}</span>
                  </span>
                </div>
              )}

              {/* Storage Options */}
              {product.storageOptions && product.storageOptions.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-[#26286B]/70">
                    {t.storageLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.storageOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStorage(st)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          selectedStorage === st
                            ? 'bg-[#26286B] text-white shadow-xs'
                            : 'bg-[#F3F5F8] text-[#26286B] hover:bg-[#1499D6]/12'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Options */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-[#26286B]/70">{t.colorLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          selectedColor === clr
                            ? 'bg-[#1499D6] text-white shadow-xs'
                            : 'bg-[#F3F5F8] text-[#26286B] hover:bg-[#1499D6]/12'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-[#26286B]/10">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1fb858] active:scale-[0.98] transition-all"
              >
                <WhatsAppIcon className="h-5 w-5" />
                <span>{t.orderWhatsApp}</span>
              </a>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAdd}
                className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                  !product.inStock
                    ? 'bg-[#F3F5F8] text-[#26286B]/35 cursor-not-allowed'
                    : justAdded
                      ? 'bg-[#A8C814] text-[#26286B] cursor-pointer'
                      : 'bg-[#26286B] text-white hover:bg-[#1b1d52] active:scale-[0.98] cursor-pointer'
                }`}
              >
                {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                <span>{justAdded ? t.addedToCart : t.addToCart}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
