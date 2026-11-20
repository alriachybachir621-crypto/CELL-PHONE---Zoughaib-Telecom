import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { Language, Product } from '../types';
import { TRANSLATIONS } from '../i18n';
import { DeviceVisual } from './DeviceVisual';

interface ProductCardProps {
  product: Product;
  lang: Language;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  isWishlisted,
  onToggleWishlist,
  onOpenProduct,
  onQuickAdd,
}) => {
  const t = TRANSLATIONS[lang];
  const displayName = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  const conditionText = product.condition === 'New' ? t.conditionNew : t.conditionUsed;
  const stockText = product.inStock ? t.available : t.soldOut;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-[#F3F5F8] p-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#26286B]/8 border border-[#26286B]/6">
      {/* Image area */}
      <div className="relative overflow-hidden rounded-xl bg-white">
        <button
          type="button"
          onClick={() => onOpenProduct(product)}
          className="block w-full text-start cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1499D6]"
        >
          <DeviceVisual
            src={product.images?.[0]}
            alt={displayName}
            aspect="4/3"
            className="w-full transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </button>

        {/* Single concise status highlight */}
        <div className="pointer-events-none absolute top-2.5 start-2.5 flex items-center gap-1.5">
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${
              product.condition === 'New'
                ? 'bg-[#1499D6] text-white'
                : 'bg-[#26286B] text-white'
            }`}
          >
            {conditionText}
          </span>
          {product.isSale && product.inStock && (
            <span className="rounded-lg bg-[#A8C814] px-2 py-0.5 text-[11px] font-bold text-[#26286B]">
              {t.saleTag}
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 end-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform active:scale-90 cursor-pointer ${
            isWishlisted ? 'text-rose-500' : 'text-[#26286B]/60 hover:text-rose-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Metadata & Actions */}
      <div className="flex flex-1 flex-col justify-between pt-3 px-1">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#26286B]/60">
            <span className="truncate">
              {product.brand} · {product.storageOptions?.[0] || product.category}
            </span>
            <span
              className={`shrink-0 font-medium ${
                product.inStock ? 'text-[#26286B]/75' : 'text-rose-600'
              }`}
            >
              {stockText}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenProduct(product)}
            className="mt-1 block w-full text-start cursor-pointer"
          >
            <h3 className="font-display text-base font-semibold text-[#26286B] line-clamp-2 group-hover:text-[#1499D6] transition-colors">
              {displayName}
            </h3>
          </button>

          {product.condition === 'Used' && product.batteryHealth && (
            <p className="mt-1 text-xs text-[#26286B]/65">
              {t.batteryHealth}: <span className="font-semibold tabular-nums">{product.batteryHealth}</span>
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#26286B]/8">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-[#26286B] tabular-nums">
              ${product.price}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-[#26286B]/45 line-through tabular-nums">
                ${product.oldPrice}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => onQuickAdd(product)}
            className={`inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              product.inStock
                ? 'bg-white text-[#26286B] shadow-xs hover:bg-[#1499D6] hover:text-white active:scale-95 cursor-pointer'
                : 'bg-white/50 text-[#26286B]/35 cursor-not-allowed'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{product.inStock ? t.addToCart : t.soldOut}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
