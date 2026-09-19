import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkState } from 'expo-network';
import type { Channel, Language, NewProductDraft, Order, OrderStatus, Product, Profile, ScreenName, TabName } from '@/types';
import { STRINGS, type Strings } from '@/i18n/strings';
import { config, services } from '@/config';
import { setDemoMode } from '@/services/demo';
import { clearApiSession, pushProduct, unpublishProduct } from '@/services/api';
import { isSampleOrder, isSampleProduct, sampleOrders, sampleProducts } from './sampleData';

const STORAGE_KEY = 'karigarsetu:v2';

interface PersistedState {
  language: Language;
  onboarded: boolean;
  profile: Profile;
  voiceGuide: boolean;
  /** Sample data + prepared AI results, for demos without a network. */
  demoMode: boolean;
  products: Product[];
  orders: Order[];
}

const DEFAULT_STATE: PersistedState = {
  language: 'english',
  onboarded: false,
  profile: { name: '', craft: '', gender: null },
  voiceGuide: true,
  demoMode: config.demoMode,
  products: [],
  orders: [],
};

const emptyDraft = (): NewProductDraft => ({
  originalPhoto: null,
  photo: null,
  enhancedWith: null,
  voiceAudioUri: null,
  transcript: '',
  title: '',
  description: '',
  titleHi: '',
  descriptionHi: '',
  localDescription: '',
  highlights: [],
  category: '',
  aiPrice: null,
  aiPriceReason: '',
  marketResearch: null,
  price: 0,
  stock: 1,
  costBreakdown: { material: 0, labour: 0, margin: 0 },
});

/** Where the hardware/back button goes from each screen. */
const PARENT: Partial<Record<ScreenName, ScreenName>> = {
  camera: 'home',
  enhance: 'camera',
  voice: 'camera',
  listing: 'voice',
  price: 'listing',
  channels: 'price',
  success: 'home',
  products: 'home',
  productDetail: 'products',
  orders: 'home',
  settings: 'home',
  tutorial: 'settings',
};

const TAB_FOR_SCREEN: Partial<Record<ScreenName, TabName>> = {
  home: 'home',
  products: 'products',
  productDetail: 'products',
  orders: 'orders',
  settings: 'settings',
};

export const NEXT_ORDER_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: 'accepted',
  accepted: 'packed',
  packed: 'shipped',
  shipped: 'delivered',
  delivered: null,
};

interface AppContextValue extends PersistedState {
  hydrated: boolean;
  t: Strings;
  online: boolean;

  screen: ScreenName;
  activeTab: TabName;
  navigate: (screen: ScreenName) => void;
  goBack: () => boolean;

  setLanguage: (language: Language) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  completeOnboarding: () => void;
  setVoiceGuide: (enabled: boolean) => void;
  setDemoData: (enabled: boolean) => void;

  draft: NewProductDraft;
  setDraft: (patch: Partial<NewProductDraft>) => void;
  startNewProduct: () => void;
  selectedChannels: Channel[];
  toggleChannel: (channel: Channel) => void;
  publishDraft: (status: Product['status']) => Product;
  lastPublishedId: string | null;

  selectedProductId: string | null;
  openProduct: (id: string) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  advanceOrder: (id: string) => void;
  loadSampleData: () => void;
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<ScreenName>('onboarding');
  const [draft, setDraftState] = useState<NewProductDraft>(emptyDraft);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['ONDC']);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lastPublishedId, setLastPublishedId] = useState<string | null>(null);
  const network = useNetworkState();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<PersistedState>) };
          setPersisted(stored);
          setScreen(stored.onboarded ? 'home' : 'onboarding');
        }
      } catch {
        // Corrupt storage: start fresh rather than crash.
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    setDemoMode(persisted.demoMode);
  }, [persisted.demoMode]);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    }, 250);
  }, [persisted, hydrated]);

  const patch = useCallback((update: Partial<PersistedState> | ((prev: PersistedState) => Partial<PersistedState>)) => {
    setPersisted((prev) => ({ ...prev, ...(typeof update === 'function' ? update(prev) : update) }));
  }, []);

  // Latest profile/language for background sync without re-creating callbacks.
  const latest = useRef(persisted);
  latest.current = persisted;

  /** Pushes a product to the marketplace API; the result is saved on the product. */
  const syncProduct = useCallback(
    (product: Product) => {
      if (!services.marketplaceApi) return;
      const mark = (update: Partial<Product>) =>
        patch((prev) => ({ products: prev.products.map((p) => (p.id === product.id ? { ...p, ...update } : p)) }));
      mark({ syncState: 'pending' });
      pushProduct(product, latest.current.profile, latest.current.language)
        .then((remoteId) => mark({ remoteId, syncState: 'synced' }))
        .catch(() => mark({ syncState: 'failed' }));
    },
    [patch]
  );

  // Treat "unknown" as online so we never show a false offline banner at launch.
  const online = network.isInternetReachable !== false && network.isConnected !== false;

  // Retry listings that could not be sent (offline at publish time) once we are back online.
  useEffect(() => {
    if (!hydrated || !online) return;
    latest.current.products.filter((p) => p.syncState === 'failed' || p.syncState === 'pending').forEach(syncProduct);
  }, [hydrated, online, syncProduct]);

  const navigate = useCallback((next: ScreenName) => setScreen(next), []);

  const goBack = useCallback(() => {
    const parent = PARENT[screen];
    if (!parent) return false;
    setScreen(parent);
    return true;
  }, [screen]);

  const setDraft = useCallback((d: Partial<NewProductDraft>) => setDraftState((prev) => ({ ...prev, ...d })), []);

  const startNewProduct = useCallback(() => {
    setDraftState(emptyDraft());
    setSelectedChannels(['ONDC']);
    setScreen('camera');
  }, []);

  const toggleChannel = useCallback((channel: Channel) => {
    setSelectedChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
  }, []);

  const publishDraft = useCallback(
    (status: Product['status']) => {
      const product: Product = {
        id: `p-${Date.now()}`,
        title: draft.title.trim() || 'Handmade product',
        description: draft.description.trim(),
        titleHi: draft.titleHi.trim(),
        descriptionHi: draft.descriptionHi.trim(),
        localDescription: draft.localDescription,
        highlights: draft.highlights,
        category: draft.category,
        price: draft.price,
        stock: draft.stock,
        image: draft.photo ?? '',
        channels: selectedChannels,
        status,
        costBreakdown: draft.costBreakdown,
        createdAt: Date.now(),
      };
      patch((prev) => ({ products: [product, ...prev.products] }));
      setLastPublishedId(product.id);
      if (status === 'published') syncProduct(product);
      return product;
    },
    [draft, selectedChannels, patch, syncProduct]
  );

  const openProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    setScreen('productDetail');
  }, []);

  const updateProduct = useCallback(
    (id: string, update: Partial<Product>) => {
      const existing = latest.current.products.find((p) => p.id === id);
      patch((prev) => ({ products: prev.products.map((p) => (p.id === id ? { ...p, ...update } : p)) }));
      // Keep marketplaces in step with price, stock, channel and status changes.
      if (existing && (existing.remoteId || update.status === 'published')) syncProduct({ ...existing, ...update });
    },
    [patch, syncProduct]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const existing = latest.current.products.find((p) => p.id === id);
      patch((prev) => ({ products: prev.products.filter((p) => p.id !== id) }));
      if (existing?.remoteId && services.marketplaceApi) {
        void unpublishProduct(existing.remoteId, latest.current.profile, latest.current.language).catch(() => undefined);
      }
    },
    [patch]
  );

  const advanceOrder = useCallback(
    (id: string) =>
      patch((prev) => ({
        orders: prev.orders.map((o) => {
          const next = NEXT_ORDER_STATUS[o.status];
          return o.id === id && next ? { ...o, status: next } : o;
        }),
      })),
    [patch]
  );

  const loadSampleData = useCallback(() => {
    patch((prev) => {
      const existing = new Set(prev.products.map((p) => p.id));
      const existingOrders = new Set(prev.orders.map((o) => o.id));
      return {
        products: [...prev.products, ...sampleProducts().filter((p) => !existing.has(p.id))],
        orders: [...sampleOrders().filter((o) => !existingOrders.has(o.id)), ...prev.orders],
      };
    });
  }, [patch]);

  const removeSampleData = useCallback(() => {
    patch((prev) => ({
      products: prev.products.filter((p) => !isSampleProduct(p.id)),
      orders: prev.orders.filter((o) => !isSampleOrder(o.id)),
    }));
  }, [patch]);

  // Keep the catalogue in step with the switch, including on a fresh install seeded from .env.
  useEffect(() => {
    if (!hydrated) return;
    if (persisted.demoMode) {
      if (!persisted.products.some((p) => isSampleProduct(p.id))) loadSampleData();
    } else if (persisted.products.some((p) => isSampleProduct(p.id)) || persisted.orders.some((o) => isSampleOrder(o.id))) {
      removeSampleData();
    }
  }, [hydrated, persisted.demoMode, persisted.products, persisted.orders, loadSampleData, removeSampleData]);

  const resetApp = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await clearApiSession();
    setPersisted(DEFAULT_STATE);
    setDraftState(emptyDraft());
    setScreen('onboarding');
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...persisted,
      hydrated,
      t: STRINGS[persisted.language],
      online,
      screen,
      activeTab: TAB_FOR_SCREEN[screen] ?? 'home',
      navigate,
      goBack,
      setLanguage: (language) => patch({ language }),
      updateProfile: (profile) => patch((prev) => ({ profile: { ...prev.profile, ...profile } })),
      completeOnboarding: () => patch({ onboarded: true }),
      setVoiceGuide: (voiceGuide) => patch({ voiceGuide }),
      setDemoData: (demoMode) => {
        setDemoMode(demoMode);
        patch({ demoMode });
        if (demoMode) loadSampleData();
        else removeSampleData();
      },
      draft,
      setDraft,
      startNewProduct,
      selectedChannels,
      toggleChannel,
      publishDraft,
      lastPublishedId,
      selectedProductId,
      openProduct,
      updateProduct,
      deleteProduct,
      advanceOrder,
      loadSampleData,
      resetApp,
    }),
    [persisted, hydrated, online, screen, navigate, goBack, patch, draft, setDraft, startNewProduct, selectedChannels, toggleChannel, publishDraft, lastPublishedId, selectedProductId, openProduct, updateProduct, deleteProduct, advanceOrder, loadSampleData, removeSampleData, resetApp]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
