export type Language = 'en' | 'ar';

export type Brand = 'iPhone' | 'Samsung' | 'Xiaomi' | 'Huawei' | 'Other' | 'Accessories';

export type Condition = 'New' | 'Used';

export type RepairIconKey = 'screen' | 'battery' | 'port' | 'software' | 'camera' | 'speaker';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  brand: Brand;
  category: string;
  price: number;
  oldPrice?: number | null;
  storageOptions: string[];
  colors: string[];
  condition: Condition;
  batteryHealth?: string;
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  description?: string;
  descriptionAr?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RepairService {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  estimatedTime?: string;
  estimatedTimeAr?: string;
  startingPrice?: string;
  iconKey: RepairIconKey;
  order: number;
  updatedAt?: unknown;
}

export interface ShopSettings {
  heroImages: string[];
  heroTitle?: string;
  heroTitleAr?: string;
  heroSubtitle?: string;
  heroSubtitleAr?: string;
  whatsapp: string;
  whatsappNumber: string;
  email: string;
  address: string;
  addressAr?: string;
  mapsEmbedUrl?: string;
  mapsLink?: string;
  hours: string;
  hoursAr?: string;
  facebookUrl?: string;
  galleryImages: string[];
  adminInitialized?: boolean;
  updatedAt?: unknown;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  nameAr?: string;
  price: number;
  condition: Condition;
  storage: string;
  color: string;
  image: string;
  quantity: number;
}
