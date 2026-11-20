import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { CheckCircle2 } from 'lucide-react';
import {
  ADMIN_EMAIL,
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_REPAIRS,
  DEFAULT_SHOP_SETTINGS,
} from './data/defaults';
import {
  CartItem,
  Language,
  Product,
  RepairService,
  ShopSettings,
} from './types';
import { TRANSLATIONS } from './i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { ProductModal } from './components/ProductModal';
import { ServiceSections } from './components/ServiceSections';
import { ContactFooter } from './components/ContactFooter';
import { CartDrawer, WishlistDrawer } from './components/Drawers';
import { FloatingWhatsAppButton } from './components/WhatsAppButton';
import { PinModal } from './components/PinModal';
import { ShopManagerModal } from './components/ShopManagerModal';

const CART_STORAGE_KEY = 'zt_cart';
const WISHLIST_STORAGE_KEY = 'zt_wishlist';
const LANG_STORAGE_KEY = 'zt_lang';

function StorefrontApp() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'ar' ? 'ar' : 'en';
  });

  // Firestore synced state
  const [firestoreProducts, setFirestoreProducts] = useState<Product[] | null>(null);
  const [firestoreRepairs, setFirestoreRepairs] = useState<RepairService[] | null>(null);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);

  // Auth & Secret Manager UI
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  // Storefront Interactive State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Sync RTL & lang attribute on <html>
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  // Persist wishlist & cart
  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsub();
  }, []);

  // Firestore real-time listeners
  useEffect(() => {
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const list: Product[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, 'id'>),
        }));
        setFirestoreProducts(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'products');
      }
    );

    const repairsQuery = query(collection(db, 'repairs'), orderBy('order', 'asc'));
    const unsubRepairs = onSnapshot(
      repairsQuery,
      (snap) => {
        const list: RepairService[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<RepairService, 'id'>),
        }));
        setFirestoreRepairs(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'repairs');
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'shop'),
      (snap) => {
        if (snap.exists()) {
          setSettings({
            ...DEFAULT_SHOP_SETTINGS,
            ...(snap.data() as Partial<ShopSettings>),
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'settings/shop');
      }
    );

    return () => {
      unsubProducts();
      unsubRepairs();
      unsubSettings();
    };
  }, []);

  const isUsingDefaultProducts = firestoreProducts !== null && firestoreProducts.length === 0;
  const products = useMemo(() => {
    if (firestoreProducts && firestoreProducts.length > 0) return firestoreProducts;
    return DEFAULT_PRODUCTS;
  }, [firestoreProducts]);

  const isUsingDefaultRepairs = firestoreRepairs !== null && firestoreRepairs.length === 0;
  const repairs = useMemo(() => {
    if (firestoreRepairs && firestoreRepairs.length > 0) return firestoreRepairs;
    return DEFAULT_REPAIRS;
  }, [firestoreRepairs]);

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2000);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: Product, storage: string, color: string) => {
    if (!product.inStock) return;
    const key = `${product.id}__${storage}__${color}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          nameAr: product.nameAr,
          price: product.price,
          condition: product.condition,
          storage,
          color,
          image: product.images?.[0] || 'preset:iphone-16-pro-max',
          quantity: 1,
        },
      ];
    });
    const t = TRANSLATIONS[lang];
    showToast(`${t.addedToCart}: ${lang === 'ar' && product.nameAr ? product.nameAr : product.name}`);
  };

  const handleQuickAdd = (product: Product) => {
    addToCart(
      product,
      product.storageOptions?.[0] || '',
      product.colors?.[0] || ''
    );
  };

  const updateCartQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSecretTrigger = () => {
    if (authUser && authUser.email === ADMIN_EMAIL) {
      setManagerOpen(true);
    } else {
      setPinModalOpen(true);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="top" className="min-h-screen bg-white text-[#26286B]">
      <Navbar
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onSecretTrigger={handleSecretTrigger}
      />

      <main>
        <Hero lang={lang} settings={settings} />

        <CatalogSection
          products={products}
          lang={lang}
          whatsappNumber={settings.whatsappNumber}
          wishlistIds={wishlistIds}
          onToggleWishlist={toggleWishlist}
          onOpenProduct={(p) => setActiveProduct(p)}
          onQuickAdd={handleQuickAdd}
        />

        <ServiceSections
          lang={lang}
          repairs={repairs}
          settings={settings}
        />
      </main>

      <ContactFooter lang={lang} settings={settings} />

      <FloatingWhatsAppButton
        phoneDigits={settings.whatsappNumber}
        label={TRANSLATIONS[lang].chatWhatsApp}
      />

      <ProductModal
        product={activeProduct}
        lang={lang}
        whatsappNumber={settings.whatsappNumber}
        isWishlisted={activeProduct ? wishlistIds.includes(activeProduct.id) : false}
        onClose={() => setActiveProduct(null)}
        onToggleWishlist={toggleWishlist}
        onAddToCart={addToCart}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        lang={lang}
        whatsappNumber={settings.whatsappNumber}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeCartItem}
        onClearCart={() => setCart([])}
      />

      <WishlistDrawer
        open={wishlistOpen}
        products={wishlistedProducts}
        lang={lang}
        onClose={() => setWishlistOpen(false)}
        onRemove={toggleWishlist}
        onSelectProduct={(p) => setActiveProduct(p)}
      />

      <PinModal
        open={pinModalOpen}
        lang={lang}
        settings={settings}
        onClose={() => setPinModalOpen(false)}
        onAuthenticated={() => {
          setPinModalOpen(false);
          setManagerOpen(true);
        }}
      />

      <ShopManagerModal
        open={managerOpen && Boolean(authUser && authUser.email === ADMIN_EMAIL)}
        products={products}
        isUsingDefaultProducts={isUsingDefaultProducts}
        repairs={repairs}
        isUsingDefaultRepairs={isUsingDefaultRepairs}
        settings={settings}
        onClose={() => setManagerOpen(false)}
      />

      {/* Subtle Add-to-Cart Toast */}
      {toastMsg && (
        <div className="fixed bottom-24 start-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-xl bg-[#26286B] px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-[#A8C814]" />
          <span className="whitespace-nowrap">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StorefrontApp />
    </ErrorBoundary>
  );
}
