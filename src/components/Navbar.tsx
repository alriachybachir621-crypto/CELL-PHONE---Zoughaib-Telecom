import React, { useRef, useState } from 'react';
import { Globe, Heart, Menu, ShoppingBag, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onSecretTrigger: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onSecretTrigger,
}) => {
  const t = TRANSLATIONS[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tapTimesRef = useRef<number[]>([]);

  const handleLogoTap = () => {
    const now = Date.now();
    const recent = tapTimesRef.current.filter((ts) => now - ts < 2500);
    recent.push(now);
    tapTimesRef.current = recent;

    if (recent.length >= 5) {
      tapTimesRef.current = [];
      onSecretTrigger();
      return;
    }

    if (recent.length === 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { href: '#shop', label: t.navShop },
    { href: '#sell', label: t.navSell },
    { href: '#repair', label: t.navRepair },
    { href: '#contact', label: t.navContact },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#26286B]/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Logo (5 rapid taps opens hidden PIN modal) */}
        <button
          type="button"
          onClick={handleLogoTap}
          className="flex shrink-0 items-center rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-[#1499D6] active:scale-[0.98] transition-transform cursor-pointer"
          aria-label="CELL PHONE - Zoughaib Telecom"
        >
          <img
            src="/logo.png"
            alt="CELL PHONE - Zoughaib Telecom"
            className="h-12 w-auto object-contain"
          />
        </button>

        {/* Zone 2: Desktop Single-Line Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#26286B]/80">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 py-1 hover:text-[#1499D6] transition-colors relative after:absolute after:bottom-0 after:start-0 after:h-0.5 after:w-0 after:bg-[#1499D6] hover:after:w-full after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Language Switch, Wishlist & Cart */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#F3F5F8] px-3 text-xs font-semibold text-[#26286B] hover:bg-[#1499D6]/10 hover:text-[#1499D6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Switch language"
          >
            <Globe className="h-3.5 w-3.5 text-[#1499D6]" />
            <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5F8] text-[#26286B] hover:bg-[#1499D6]/10 hover:text-[#1499D6] transition-colors cursor-pointer"
            aria-label={t.wishlistTitle}
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#A8C814] px-1 text-[10px] font-bold text-[#26286B] tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-[#26286B] px-3.5 text-xs font-semibold text-white hover:bg-[#1d1f54] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={t.cartTitle}
          >
            <ShoppingBag className="h-4 w-4 text-[#A8C814]" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Bag' : 'السلة'}</span>
            {cartCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1499D6] px-1.5 text-[11px] font-bold text-white tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5F8] text-[#26286B] md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <nav className="border-t border-[#26286B]/10 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#26286B] hover:bg-[#F3F5F8]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
