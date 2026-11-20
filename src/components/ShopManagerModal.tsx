import React, { useState } from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from 'firebase/auth';
import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  Check,
  Database,
  ImagePlus,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  auth,
  db,
  handleFirestoreError,
  OperationType,
  PASSCODE_SUFFIX,
  storage,
} from '../firebase';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_REPAIRS,
  DEFAULT_SHOP_SETTINGS,
  STUDIO_PRESETS,
} from '../data/defaults';
import {
  Brand,
  Condition,
  Product,
  RepairIconKey,
  RepairService,
  ShopSettings,
} from '../types';
import { DeviceVisual } from './DeviceVisual';

interface ShopManagerModalProps {
  open: boolean;
  products: Product[];
  isUsingDefaultProducts: boolean;
  repairs: RepairService[];
  isUsingDefaultRepairs: boolean;
  settings: ShopSettings;
  onClose: () => void;
}

type AdminTab = 'products' | 'repairs' | 'hero' | 'settings';

const BRANDS: Brand[] = ['iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'Other', 'Accessories'];

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImageFile(file: File, folder: string): Promise<string> {
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.warn('Firebase Storage upload fell back to compressed image:', err);
    return await compressImageToDataUrl(file);
  }
}

export const ShopManagerModal: React.FC<ShopManagerModalProps> = ({
  open,
  products,
  isUsingDefaultProducts,
  repairs,
  isUsingDefaultRepairs,
  settings,
  onClose,
}) => {
  const [tab, setTab] = useState<AdminTab>('products');
  const [statusMsg, setStatusMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pNameAr, setPNameAr] = useState('');
  const [pBrand, setPBrand] = useState<Brand>('iPhone');
  const [pCategory, setPCategory] = useState('Phones');
  const [pPrice, setPPrice] = useState('');
  const [pOldPrice, setPOldPrice] = useState('');
  const [pStorageText, setPStorageText] = useState('128GB, 256GB');
  const [pColorsText, setPColorsText] = useState('Natural Titanium, Black');
  const [pCondition, setPCondition] = useState<Condition>('New');
  const [pBattery, setPBattery] = useState('');
  const [pImages, setPImages] = useState<string[]>(['preset:iphone-16-pro-max']);
  const [pImageUrlInput, setPImageUrlInput] = useState('');
  const [pInStock, setPInStock] = useState(true);
  const [pIsNew, setPIsNew] = useState(true);
  const [pIsSale, setPIsSale] = useState(false);
  const [pDesc, setPDesc] = useState('');

  // Repair Form State
  const [editingRepairId, setEditingRepairId] = useState<string | null>(null);
  const [rTitle, setRTitle] = useState('');
  const [rTitleAr, setRTitleAr] = useState('');
  const [rDesc, setRDesc] = useState('');
  const [rTime, setRTime] = useState('30–45 mins');
  const [rIcon, setRIcon] = useState<RepairIconKey>('screen');
  const [rOrder, setROrder] = useState('1');

  // Settings & Hero Form State
  const [sHeroTitle, setSHeroTitle] = useState(settings.heroTitle || DEFAULT_SHOP_SETTINGS.heroTitle || '');
  const [sHeroTitleAr, setSHeroTitleAr] = useState(settings.heroTitleAr || DEFAULT_SHOP_SETTINGS.heroTitleAr || '');
  const [sHeroSub, setSHeroSub] = useState(settings.heroSubtitle || DEFAULT_SHOP_SETTINGS.heroSubtitle || '');
  const [sHeroSubAr, setSHeroSubAr] = useState(settings.heroSubtitleAr || DEFAULT_SHOP_SETTINGS.heroSubtitleAr || '');
  const [sHeroImages, setSHeroImages] = useState<string[]>(settings.heroImages || ['preset:hero-flagships']);
  const [sHeroUrlInput, setSHeroUrlInput] = useState('');
  const [sGalleryImages, setSGalleryImages] = useState<string[]>(settings.galleryImages || DEFAULT_SHOP_SETTINGS.galleryImages);
  const [sGalleryUrlInput, setSGalleryUrlInput] = useState('');

  const [sWhatsapp, setSWhatsapp] = useState(settings.whatsapp);
  const [sWhatsappNum, setSWhatsappNum] = useState(settings.whatsappNumber);
  const [sEmail, setSEmail] = useState(settings.email);
  const [sAddress, setSAddress] = useState(settings.address);
  const [sAddressAr, setSAddressAr] = useState(settings.addressAr || '');
  const [sHours, setSHours] = useState(settings.hours);
  const [sHoursAr, setSHoursAr] = useState(settings.hoursAr || '');
  const [sMapsEmbed, setSMapsEmbed] = useState(settings.mapsEmbedUrl || '');
  const [sMapsLink, setSMapsLink] = useState(settings.mapsLink || '');
  const [sFacebook, setSFacebook] = useState(settings.facebookUrl || '');

  // Change PIN State
  const [currPin, setCurrPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  React.useEffect(() => {
    if (!open) return;
    setSHeroTitle(settings.heroTitle || DEFAULT_SHOP_SETTINGS.heroTitle || '');
    setSHeroTitleAr(settings.heroTitleAr || DEFAULT_SHOP_SETTINGS.heroTitleAr || '');
    setSHeroSub(settings.heroSubtitle || DEFAULT_SHOP_SETTINGS.heroSubtitle || '');
    setSHeroSubAr(settings.heroSubtitleAr || DEFAULT_SHOP_SETTINGS.heroSubtitleAr || '');
    setSHeroImages(settings.heroImages || ['preset:hero-flagships']);
    setSGalleryImages(settings.galleryImages || DEFAULT_SHOP_SETTINGS.galleryImages);
    setSWhatsapp(settings.whatsapp);
    setSWhatsappNum(settings.whatsappNumber);
    setSEmail(settings.email);
    setSAddress(settings.address);
    setSAddressAr(settings.addressAr || '');
    setSHours(settings.hours);
    setSHoursAr(settings.hoursAr || '');
    setSMapsEmbed(settings.mapsEmbedUrl || '');
    setSMapsLink(settings.mapsLink || '');
    setSFacebook(settings.facebookUrl || '');
  }, [open, settings]);

  if (!open) return null;

  const flash = (msg: string) => {
    setStatusMsg(msg);
    window.setTimeout(() => setStatusMsg(''), 3000);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setPName('');
    setPNameAr('');
    setPBrand('iPhone');
    setPCategory('Phones');
    setPPrice('');
    setPOldPrice('');
    setPStorageText('128GB, 256GB');
    setPColorsText('Natural Titanium, Black');
    setPCondition('New');
    setPBattery('');
    setPImages(['preset:iphone-16-pro-max']);
    setPImageUrlInput('');
    setPInStock(true);
    setPIsNew(true);
    setPIsSale(false);
    setPDesc('');
  };

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setPName(p.name);
    setPNameAr(p.nameAr || '');
    setPBrand(p.brand);
    setPCategory(p.category);
    setPPrice(String(p.price));
    setPOldPrice(p.oldPrice ? String(p.oldPrice) : '');
    setPStorageText((p.storageOptions || []).join(', '));
    setPColorsText((p.colors || []).join(', '));
    setPCondition(p.condition);
    setPBattery(p.batteryHealth || '');
    setPImages(p.images?.length ? p.images : ['preset:iphone-16-pro-max']);
    setPInStock(p.inStock);
    setPIsNew(p.isNew);
    setPIsSale(p.isSale);
    setPDesc(p.description || '');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(pPrice);
    if (!pName.trim() || Number.isNaN(numericPrice) || numericPrice < 0) return;

    setBusy(true);
    const id = editingProductId || `prod_${Date.now()}`;
    const storageOptions = pStorageText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
    const colors = pColorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 10);

    const payload: Record<string, unknown> = {
      name: pName.trim().slice(0, 140),
      nameAr: pNameAr.trim().slice(0, 140),
      brand: pBrand,
      category: pCategory.trim().slice(0, 60) || 'Phones',
      price: numericPrice,
      oldPrice: pOldPrice.trim() ? Number(pOldPrice) : null,
      storageOptions,
      colors,
      condition: pCondition,
      batteryHealth: pCondition === 'Used' ? pBattery.trim().slice(0, 40) : '',
      images: pImages.slice(0, 10),
      inStock: pInStock,
      isNew: pIsNew,
      isSale: pIsSale,
      description: pDesc.trim().slice(0, 1000),
      updatedAt: serverTimestamp(),
    };

    if (!editingProductId) {
      payload.createdAt = serverTimestamp();
    }

    try {
      await setDoc(doc(db, 'products', id), payload, { merge: Boolean(editingProductId) });
      resetProductForm();
      flash('Product saved to Firebase');
    } catch (err) {
      handleFirestoreError(
        err,
        editingProductId ? OperationType.UPDATE : OperationType.CREATE,
        `products/${id}`
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (isUsingDefaultProducts) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'products', id));
      if (editingProductId === id) resetProductForm();
      flash('Product deleted');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSeedStarterProducts = async () => {
    setBusy(true);
    try {
      for (const item of DEFAULT_PRODUCTS) {
        const { id, ...rest } = item;
        await setDoc(doc(db, 'products', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      flash('Starter catalog imported into Firestore');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    } finally {
      setBusy(false);
    }
  };

  const handleSeedStarterRepairs = async () => {
    setBusy(true);
    try {
      for (const r of DEFAULT_REPAIRS) {
        const { id, ...rest } = r;
        await setDoc(doc(db, 'repairs', id), {
          ...rest,
          updatedAt: serverTimestamp(),
        });
      }
      flash('Starter repairs imported into Firestore');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'repairs');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rTitle.trim()) return;
    setBusy(true);
    const id = editingRepairId || `repair_${Date.now()}`;
    try {
      await setDoc(doc(db, 'repairs', id), {
        title: rTitle.trim().slice(0, 120),
        titleAr: rTitleAr.trim().slice(0, 120),
        description: rDesc.trim().slice(0, 400),
        estimatedTime: rTime.trim().slice(0, 60),
        iconKey: rIcon,
        order: Number(rOrder) || 1,
        updatedAt: serverTimestamp(),
      });
      setEditingRepairId(null);
      setRTitle('');
      setRTitleAr('');
      setRDesc('');
      setRTime('30–45 mins');
      setRIcon('screen');
      setROrder('1');
      flash('Repair service saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `repairs/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteRepair = async (id: string) => {
    if (isUsingDefaultRepairs) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'repairs', id));
      flash('Repair removed');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `repairs/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await setDoc(doc(db, 'settings', 'shop'), {
        heroImages: sHeroImages.slice(0, 6),
        heroTitle: sHeroTitle.trim().slice(0, 120),
        heroTitleAr: sHeroTitleAr.trim().slice(0, 120),
        heroSubtitle: sHeroSub.trim().slice(0, 240),
        heroSubtitleAr: sHeroSubAr.trim().slice(0, 240),
        whatsapp: sWhatsapp.trim().slice(0, 30),
        whatsappNumber: sWhatsappNum.replace(/[^0-9]/g, '').slice(0, 20) || '9613399309',
        email: sEmail.trim().slice(0, 120),
        address: sAddress.trim().slice(0, 240),
        addressAr: sAddressAr.trim().slice(0, 240),
        mapsEmbedUrl: sMapsEmbed.trim().slice(0, 800),
        mapsLink: sMapsLink.trim().slice(0, 500),
        hours: sHours.trim().slice(0, 240),
        hoursAr: sHoursAr.trim().slice(0, 240),
        facebookUrl: sFacebook.trim().slice(0, 400),
        galleryImages: sGalleryImages.slice(0, 12),
        adminInitialized: true,
        updatedAt: serverTimestamp(),
      });
      flash('Shop settings updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/shop');
    } finally {
      setBusy(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg('');
    if (!/^\d{4}$/.test(currPin) || !/^\d{4}$/.test(newPin)) {
      setPinMsg('Codes must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinMsg('New codes do not match.');
      return;
    }
    const user = auth.currentUser;
    if (!user) return;

    setBusy(true);
    try {
      const cred = EmailAuthProvider.credential(
        ADMIN_EMAIL,
        currPin + PASSCODE_SUFFIX
      );
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPin + PASSCODE_SUFFIX);
      setCurrPin('');
      setNewPin('');
      setConfirmNewPin('');
      setPinMsg('4-digit code updated successfully.');
    } catch (err: unknown) {
      setPinMsg((err as Error)?.message || 'Current code is incorrect.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImageFile(file, 'products');
      setPImages((prev) => [...prev, url].slice(0, 10));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImageFile(file, 'hero');
      setSHeroImages((prev) => [...prev, url].slice(0, 6));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImageFile(file, 'gallery');
      setSGalleryImages((prev) => [...prev, url].slice(0, 12));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#26286B]/55 p-2 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      dir="ltr"
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#26286B]/10">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#26286B]/10 px-5 py-4 bg-[#F3F5F8]">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Zoughaib Telecom" className="h-9 w-auto" />
            <div>
              <h2 className="font-display text-base font-bold text-[#26286B]">
                Storefront Manager
              </h2>
              {statusMsg && (
                <p className="text-xs font-semibold text-[#1499D6] flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> {statusMsg}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#26286B] hover:bg-[#26286B]/10 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-[#26286B]/10 px-5 py-2.5 bg-white no-scrollbar">
          {(
            [
              { id: 'products', label: 'Products' },
              { id: 'repairs', label: 'Repairs' },
              { id: 'hero', label: 'Hero & Gallery' },
              { id: 'settings', label: 'Shop Info & Code' },
            ] as { id: AdminTab; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`h-9 shrink-0 rounded-xl px-4 text-xs font-semibold transition-colors cursor-pointer ${
                tab === item.id
                  ? 'bg-[#26286B] text-white'
                  : 'bg-[#F3F5F8] text-[#26286B] hover:bg-[#1499D6]/12'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <form
                onSubmit={handleSaveProduct}
                className="space-y-3.5 rounded-2xl bg-[#F3F5F8] p-4 lg:col-span-5 h-fit"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-[#26286B]">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-xs font-semibold text-[#1499D6] cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Product Name (EN)*"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10 sm:col-span-2"
                  />
                  <input
                    placeholder="Product Name (AR optional)"
                    value={pNameAr}
                    onChange={(e) => setPNameAr(e.target.value)}
                    dir="rtl"
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10 sm:col-span-2"
                  />
                  <select
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value as Brand)}
                    className="h-10 rounded-xl bg-white px-3 text-xs font-medium border border-[#26286B]/10"
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Category (Phones, Audio...)"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="Price USD*"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Old Price USD (optional)"
                    value={pOldPrice}
                    onChange={(e) => setPOldPrice(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                  <select
                    value={pCondition}
                    onChange={(e) => setPCondition(e.target.value as Condition)}
                    className="h-10 rounded-xl bg-white px-3 text-xs font-medium border border-[#26286B]/10"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                  <input
                    placeholder="Battery Health (e.g. 96%)"
                    value={pBattery}
                    onChange={(e) => setPBattery(e.target.value)}
                    disabled={pCondition !== 'Used'}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10 disabled:opacity-50"
                  />
                  <input
                    placeholder="Storage (comma-separated: 128GB, 256GB)"
                    value={pStorageText}
                    onChange={(e) => setPStorageText(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10 sm:col-span-2"
                  />
                  <input
                    placeholder="Colors (comma-separated)"
                    value={pColorsText}
                    onChange={(e) => setPColorsText(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10 sm:col-span-2"
                  />
                  <textarea
                    rows={2}
                    placeholder="Short description"
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="rounded-xl bg-white p-3 text-xs border border-[#26286B]/10 sm:col-span-2"
                  />
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold text-[#26286B]">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pInStock}
                      onChange={(e) => setPInStock(e.target.checked)}
                    />
                    In Stock
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pIsNew}
                      onChange={(e) => setPIsNew(e.target.checked)}
                    />
                    New (Latest Arrivals)
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pIsSale}
                      onChange={(e) => setPIsSale(e.target.checked)}
                    />
                    Sale
                  </label>
                </div>

                {/* Images manager */}
                <div className="space-y-2 border-t border-[#26286B]/10 pt-3">
                  <p className="text-xs font-semibold text-[#26286B]">Images ({pImages.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {pImages.map((img, i) => (
                      <div key={i} className="relative h-14 w-16 overflow-hidden rounded-lg bg-white border border-[#26286B]/10">
                        <DeviceVisual src={img} alt="Preview" aspect="4/3" />
                        <button
                          type="button"
                          onClick={() => setPImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0.5 right-0.5 rounded-full bg-rose-600 p-0.5 text-white cursor-pointer"
                          aria-label="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-[#26286B] border border-[#26286B]/15 hover:border-[#1499D6]">
                      <Upload className="h-3.5 w-3.5 text-[#1499D6]" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleProductFileUpload} className="hidden" />
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setPImages((prev) => [...prev, e.target.value].slice(0, 10));
                        }
                      }}
                      className="h-9 flex-1 rounded-xl bg-white px-2 text-xs border border-[#26286B]/15"
                    >
                      <option value="">+ Add studio preset</option>
                      {STUDIO_PRESETS.map((pr) => (
                        <option key={pr.key} value={pr.key}>
                          {pr.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      placeholder="Or paste image URL..."
                      value={pImageUrlInput}
                      onChange={(e) => setPImageUrlInput(e.target.value)}
                      className="h-9 flex-1 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (pImageUrlInput.trim()) {
                          setPImages((prev) => [...prev, pImageUrlInput.trim()].slice(0, 10));
                          setPImageUrlInput('');
                        }
                      }}
                      className="h-9 rounded-xl bg-[#1499D6] px-3 text-xs font-semibold text-white cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#26286B] text-xs font-semibold text-white hover:bg-[#1c1e57] disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{editingProductId ? 'Update Product' : 'Save Product'}</span>
                </button>
              </form>

              {/* Product List */}
              <div className="lg:col-span-7 space-y-3">
                {isUsingDefaultProducts && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1499D6]/10 p-4 border border-[#1499D6]/25">
                    <p className="text-xs font-medium text-[#26286B]">
                      Showing starter catalog preview. Import it to Firestore to edit or delete starter items.
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleSeedStarterProducts}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1499D6] px-3.5 text-xs font-semibold text-white hover:bg-[#1086bd] cursor-pointer"
                    >
                      <Database className="h-3.5 w-3.5" />
                      <span>Import Starter Catalog</span>
                    </button>
                  </div>
                )}

                <div className="space-y-2.5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-[#F3F5F8] p-3 border border-[#26286B]/6"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                          <DeviceVisual src={p.images?.[0]} alt={p.name} aspect="4/3" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display text-sm font-semibold text-[#26286B] truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs text-[#26286B]/65">
                            {p.brand} · {p.condition} · ${p.price} ·{' '}
                            {p.inStock ? 'Available' : 'Sold out'}
                            {p.isNew ? ' · New' : ''}
                            {p.isSale ? ' · Sale' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEditProduct(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#26286B] hover:text-[#1499D6] cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {!isUsingDefaultProducts && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REPAIRS TAB */}
          {tab === 'repairs' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <form
                onSubmit={handleSaveRepair}
                className="space-y-3 rounded-2xl bg-[#F3F5F8] p-4 lg:col-span-5 h-fit"
              >
                <h3 className="font-display text-sm font-bold text-[#26286B]">
                  {editingRepairId ? 'Edit Repair Service' : 'Add Repair Service'}
                </h3>
                <input
                  required
                  placeholder="Title (EN)*"
                  value={rTitle}
                  onChange={(e) => setRTitle(e.target.value)}
                  className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                />
                <input
                  placeholder="Title (AR optional)"
                  value={rTitleAr}
                  onChange={(e) => setRTitleAr(e.target.value)}
                  dir="rtl"
                  className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={rDesc}
                  onChange={(e) => setRDesc(e.target.value)}
                  className="w-full rounded-xl bg-white p-3 text-xs border border-[#26286B]/10"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="Est. time"
                    value={rTime}
                    onChange={(e) => setRTime(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                  <select
                    value={rIcon}
                    onChange={(e) => setRIcon(e.target.value as RepairIconKey)}
                    className="h-10 rounded-xl bg-white px-2 text-xs border border-[#26286B]/10"
                  >
                    <option value="screen">Screen</option>
                    <option value="battery">Battery</option>
                    <option value="port">Port</option>
                    <option value="software">Software</option>
                    <option value="camera">Camera</option>
                    <option value="speaker">Speaker</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Order"
                    value={rOrder}
                    onChange={(e) => setROrder(e.target.value)}
                    className="h-10 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="h-10 w-full rounded-xl bg-[#26286B] text-xs font-semibold text-white cursor-pointer"
                >
                  Save Repair Service
                </button>
              </form>

              <div className="lg:col-span-7 space-y-3">
                {isUsingDefaultRepairs && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1499D6]/10 p-4 border border-[#1499D6]/25">
                    <p className="text-xs font-medium text-[#26286B]">
                      Import default repair items to Firestore to customize them.
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleSeedStarterRepairs}
                      className="h-9 rounded-xl bg-[#1499D6] px-3.5 text-xs font-semibold text-white cursor-pointer"
                    >
                      Import Default Repairs
                    </button>
                  </div>
                )}

                {repairs.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#F3F5F8] p-3.5"
                  >
                    <div>
                      <h4 className="font-display text-sm font-semibold text-[#26286B]">
                        {r.title}
                      </h4>
                      <p className="text-xs text-[#26286B]/65">
                        {r.estimatedTime} · {r.description}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRepairId(r.id);
                          setRTitle(r.title);
                          setRTitleAr(r.titleAr || '');
                          setRDesc(r.description || '');
                          setRTime(r.estimatedTime || '');
                          setRIcon(r.iconKey);
                          setROrder(String(r.order));
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#26286B] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {!isUsingDefaultRepairs && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRepair(r.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HERO & GALLERY TAB */}
          {tab === 'hero' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 rounded-2xl bg-[#F3F5F8] p-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold">Hero Headline (EN)</label>
                  <input
                    value={sHeroTitle}
                    onChange={(e) => setSHeroTitle(e.target.value)}
                    className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Hero Headline (AR)</label>
                  <input
                    value={sHeroTitleAr}
                    onChange={(e) => setSHeroTitleAr(e.target.value)}
                    dir="rtl"
                    className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Hero Subtitle (EN)</label>
                  <input
                    value={sHeroSub}
                    onChange={(e) => setSHeroSub(e.target.value)}
                    className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Hero Subtitle (AR)</label>
                  <input
                    value={sHeroSubAr}
                    onChange={(e) => setSHeroSubAr(e.target.value)}
                    dir="rtl"
                    className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                </div>
              </div>

              {/* Hero Images */}
              <div className="rounded-2xl bg-[#F3F5F8] p-4 space-y-3">
                <h3 className="font-display text-sm font-bold text-[#26286B]">
                  Hero Showcase Images ({sHeroImages.length}/6)
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {sHeroImages.map((img, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl bg-white border border-[#26286B]/10">
                      <DeviceVisual src={img} alt="Hero slide" aspect="4/3" />
                      <button
                        type="button"
                        onClick={() => setSHeroImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 rounded-full bg-rose-600 p-1 text-white cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-semibold text-[#26286B] border border-[#26286B]/15">
                    <ImagePlus className="h-4 w-4 text-[#1499D6]" />
                    <span>Upload Hero Image</span>
                    <input type="file" accept="image/*" onChange={handleHeroFileUpload} className="hidden" />
                  </label>
                  <input
                    placeholder="Or paste image URL..."
                    value={sHeroUrlInput}
                    onChange={(e) => setSHeroUrlInput(e.target.value)}
                    className="h-10 flex-1 min-w-48 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (sHeroUrlInput.trim()) {
                        setSHeroImages((prev) => [...prev, sHeroUrlInput.trim()].slice(0, 6));
                        setSHeroUrlInput('');
                      }
                    }}
                    className="h-10 rounded-xl bg-[#1499D6] px-4 text-xs font-semibold text-white cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="rounded-2xl bg-[#F3F5F8] p-4 space-y-3">
                <h3 className="font-display text-sm font-bold text-[#26286B]">
                  Shop Gallery Images ({sGalleryImages.length}/12)
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {sGalleryImages.map((img, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl bg-white border border-[#26286B]/10">
                      <DeviceVisual src={img} alt="Gallery" aspect="4/3" />
                      <button
                        type="button"
                        onClick={() => setSGalleryImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 rounded-full bg-rose-600 p-1 text-white cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-semibold text-[#26286B] border border-[#26286B]/15">
                    <ImagePlus className="h-4 w-4 text-[#1499D6]" />
                    <span>Upload Gallery Photo</span>
                    <input type="file" accept="image/*" onChange={handleGalleryFileUpload} className="hidden" />
                  </label>
                  <input
                    placeholder="Or paste gallery image URL..."
                    value={sGalleryUrlInput}
                    onChange={(e) => setSGalleryUrlInput(e.target.value)}
                    className="h-10 flex-1 min-w-48 rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (sGalleryUrlInput.trim()) {
                        setSGalleryImages((prev) => [...prev, sGalleryUrlInput.trim()].slice(0, 12));
                        setSGalleryUrlInput('');
                      }
                    }}
                    className="h-10 rounded-xl bg-[#1499D6] px-4 text-xs font-semibold text-white cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="h-11 rounded-xl bg-[#26286B] px-6 text-xs font-semibold text-white hover:bg-[#1c1e57] cursor-pointer"
              >
                Save Hero & Gallery
              </button>
            </form>
          )}

          {/* SHOP INFO & CHANGE CODE TAB */}
          {tab === 'settings' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <form
                onSubmit={handleSaveSettings}
                className="space-y-3.5 rounded-2xl bg-[#F3F5F8] p-5 lg:col-span-7"
              >
                <h3 className="font-display text-sm font-bold text-[#26286B]">
                  Shop Contact & Location Details
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Display Phone / WhatsApp</label>
                    <input
                      required
                      value={sWhatsapp}
                      onChange={(e) => setSWhatsapp(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">WhatsApp Digits (wa.me)</label>
                    <input
                      required
                      value={sWhatsappNum}
                      onChange={(e) => setSWhatsappNum(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold">Email</label>
                    <input
                      required
                      type="email"
                      value={sEmail}
                      onChange={(e) => setSEmail(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Address (EN)</label>
                    <input
                      required
                      value={sAddress}
                      onChange={(e) => setSAddress(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Address (AR)</label>
                    <input
                      value={sAddressAr}
                      onChange={(e) => setSAddressAr(e.target.value)}
                      dir="rtl"
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Opening Hours (EN)</label>
                    <input
                      required
                      value={sHours}
                      onChange={(e) => setSHours(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Opening Hours (AR)</label>
                    <input
                      value={sHoursAr}
                      onChange={(e) => setSHoursAr(e.target.value)}
                      dir="rtl"
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold">Google Maps Embed URL (iframe src)</label>
                    <input
                      value={sMapsEmbed}
                      onChange={(e) => setSMapsEmbed(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold">Google Maps Direct Link</label>
                    <input
                      value={sMapsLink}
                      onChange={(e) => setSMapsLink(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold">Facebook Page URL</label>
                    <input
                      value={sFacebook}
                      onChange={(e) => setSFacebook(e.target.value)}
                      className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="h-11 rounded-xl bg-[#26286B] px-6 text-xs font-semibold text-white hover:bg-[#1c1e57] cursor-pointer"
                >
                  Save Shop Info
                </button>
              </form>

              {/* Change 4-Digit Code */}
              <form
                onSubmit={handleChangePin}
                className="space-y-3 rounded-2xl bg-[#F3F5F8] p-5 lg:col-span-5 h-fit"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#1499D6]" />
                  <h3 className="font-display text-sm font-bold text-[#26286B]">
                    Change 4-Digit Code
                  </h3>
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Current 4-digit code"
                  value={currPin}
                  onChange={(e) => setCurrPin(e.target.value.replace(/\D/g, ''))}
                  className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="New 4-digit code"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Confirm new 4-digit code"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  className="h-10 w-full rounded-xl bg-white px-3 text-xs border border-[#26286B]/10"
                />
                {pinMsg && (
                  <p className="text-xs font-semibold text-[#1499D6]">{pinMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="h-10 w-full rounded-xl bg-[#1499D6] text-xs font-semibold text-white hover:bg-[#1086bd] cursor-pointer"
                >
                  Update Code
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
