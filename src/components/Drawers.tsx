import React, { useState } from 'react';
import { Heart, Minus, Plus, Trash2, X } from 'lucide-react';
import { CartItem, Language, Product } from '../types';
import { buildWhatsAppUrl, formatCartWhatsAppMessage, TRANSLATIONS } from '../i18n';
import { DeviceVisual } from './DeviceVisual';
import { WhatsAppIcon } from './WhatsAppButton';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  lang: Language;
  whatsappNumber: string;
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  lang,
  whatsappNumber,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}) => {
  const t = TRANSLATIONS[lang];
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSendOrder = () => {
    if (items.length === 0) return;
    const msg = formatCartWhatsAppMessage(items, customerName.trim(), notes.trim(), lang);
    window.open(buildWhatsAppUrl(whatsappNumber, msg), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#26286B]/40 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.cartTitle}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#26286B]/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-[#26286B]">{t.cartTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F5F8] text-[#26286B] hover:bg-[#26286B]/10 cursor-pointer"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <p className="max-w-xs text-sm text-[#26286B]/65">{t.cartEmpty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const name = lang === 'ar' && item.nameAr ? item.nameAr : item.name;
                return (
                  <div
                    key={item.key}
                    className="flex gap-3 rounded-2xl bg-[#F3F5F8] p-3 border border-[#26286B]/6"
                  >
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                      <DeviceVisual src={item.image} alt={name} aspect="4/3" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-display text-sm font-semibold text-[#26286B] truncate">
                            {name}
                          </h3>
                          <p className="text-xs text-[#26286B]/60 truncate">
                            {[item.storage, item.color, item.condition === 'New' ? t.conditionNew : t.conditionUsed]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          className="text-[#26286B]/40 hover:text-rose-500 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-[#26286B] tabular-nums">
                          ${item.price * item.quantity}
                        </span>
                        <div className="flex items-center gap-1 rounded-lg bg-white p-0.5 border border-[#26286B]/10">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#F3F5F8] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#F3F5F8] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#26286B]/10 bg-white p-5 space-y-3">
            <div className="space-y-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t.cartNamePlaceholder}
                className="h-10 w-full rounded-xl bg-[#F3F5F8] px-3 text-xs text-[#26286B] placeholder:text-[#26286B]/45 focus:outline-none focus:ring-1 focus:ring-[#1499D6]"
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.cartNotesPlaceholder}
                className="h-10 w-full rounded-xl bg-[#F3F5F8] px-3 text-xs text-[#26286B] placeholder:text-[#26286B]/45 focus:outline-none focus:ring-1 focus:ring-[#1499D6]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-medium text-[#26286B]/70">{t.cartSubtotal}</span>
              <span className="font-display text-xl font-bold text-[#26286B] tabular-nums">
                ${subtotal}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendOrder}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white hover:bg-[#1fb858] active:scale-[0.98] transition-all cursor-pointer"
            >
              <WhatsAppIcon className="h-5 w-5" />
              <span>{t.cartSendWhatsApp}</span>
            </button>

            <button
              type="button"
              onClick={onClearCart}
              className="w-full py-1.5 text-center text-xs font-medium text-[#26286B]/55 hover:text-rose-600 cursor-pointer"
            >
              {t.cartClear}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface WishlistDrawerProps {
  open: boolean;
  products: Product[];
  lang: Language;
  onClose: () => void;
  onRemove: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  open,
  products,
  lang,
  onClose,
  onRemove,
  onSelectProduct,
}) => {
  const t = TRANSLATIONS[lang];
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#26286B]/40 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.wishlistTitle}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#26286B]/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 fill-current" />
            <h2 className="font-display text-lg font-bold text-[#26286B]">{t.wishlistTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F5F8] text-[#26286B] hover:bg-[#26286B]/10 cursor-pointer"
            aria-label={t.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {products.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <p className="max-w-xs text-sm text-[#26286B]/65">{t.wishlistEmpty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const name = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-2xl bg-[#F3F5F8] p-3 border border-[#26286B]/6"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                      className="h-18 w-22 shrink-0 overflow-hidden rounded-xl bg-white cursor-pointer"
                    >
                      <DeviceVisual src={product.images?.[0]} alt={name} aspect="4/3" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProduct(product);
                        }}
                        className="block w-full text-start cursor-pointer"
                      >
                        <h3 className="font-display text-sm font-semibold text-[#26286B] truncate hover:text-[#1499D6]">
                          {name}
                        </h3>
                      </button>
                      <p className="text-xs text-[#26286B]/60">
                        {product.brand} · {product.condition === 'New' ? t.conditionNew : t.conditionUsed}
                      </p>
                      <p className="mt-1 font-display text-sm font-bold text-[#26286B] tabular-nums">
                        ${product.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(product.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-rose-500 hover:bg-rose-50 cursor-pointer"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
