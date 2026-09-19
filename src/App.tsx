import '../global.css';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, View } from 'react-native';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// Per-weight imports so only the faces we use are bundled.
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { NotoSans_400Regular } from '@expo-google-fonts/noto-sans/400Regular';
import { NotoSans_500Medium } from '@expo-google-fonts/noto-sans/500Medium';
import { NotoSans_600SemiBold } from '@expo-google-fonts/noto-sans/600SemiBold';
import { NotoSans_700Bold } from '@expo-google-fonts/noto-sans/700Bold';
import { NotoSansDevanagari_400Regular } from '@expo-google-fonts/noto-sans-devanagari/400Regular';
import { NotoSansDevanagari_500Medium } from '@expo-google-fonts/noto-sans-devanagari/500Medium';
import { NotoSansDevanagari_600SemiBold } from '@expo-google-fonts/noto-sans-devanagari/600SemiBold';
import { NotoSansDevanagari_700Bold } from '@expo-google-fonts/noto-sans-devanagari/700Bold';
import { NotoSansOriya_400Regular } from '@expo-google-fonts/noto-sans-oriya/400Regular';
import { NotoSansOriya_500Medium } from '@expo-google-fonts/noto-sans-oriya/500Medium';
import { NotoSansOriya_600SemiBold } from '@expo-google-fonts/noto-sans-oriya/600SemiBold';
import { NotoSansOriya_700Bold } from '@expo-google-fonts/noto-sans-oriya/700Bold';
import { AppProvider, useApp } from '@/store/AppContext';
import { STATUS_BAR_COLOR } from '@/theme/colors';
import { allImages } from '@/theme/images';
import type { ScreenName } from '@/types';
import { TabBar } from '@/components/TabBar';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { TutorialScreen } from '@/screens/TutorialScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { CameraScreen } from '@/screens/CameraScreen';
import { EnhanceScreen } from '@/screens/EnhanceScreen';
import { VoiceScreen } from '@/screens/VoiceScreen';
import { ListingScreen } from '@/screens/ListingScreen';
import { PriceScreen } from '@/screens/PriceScreen';
import { ChannelsScreen } from '@/screens/ChannelsScreen';
import { SuccessScreen } from '@/screens/SuccessScreen';
import { ProductsScreen } from '@/screens/ProductsScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

void SplashScreen.preventAutoHideAsync();

const SCREENS: Record<ScreenName, () => React.ReactElement | null> = {
  onboarding: OnboardingScreen,
  tutorial: TutorialScreen,
  home: HomeScreen,
  camera: CameraScreen,
  enhance: EnhanceScreen,
  voice: VoiceScreen,
  listing: ListingScreen,
  price: PriceScreen,
  channels: ChannelsScreen,
  success: SuccessScreen,
  products: ProductsScreen,
  productDetail: ProductDetailScreen,
  orders: OrdersScreen,
  settings: SettingsScreen,
};

const TAB_SCREENS: ScreenName[] = ['home', 'products', 'orders', 'settings'];

function Router() {
  const { screen, goBack, hydrated } = useApp();
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync();
  }, [hydrated]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => sub.remove();
  }, [goBack]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [screen, fade]);

  if (!hydrated) return <View className="flex-1 bg-leaf-500" />;

  const Active = SCREENS[screen];

  return (
    <View className="flex-1 bg-paper-100">
      {/* Painted status-bar area: Android draws edge-to-edge, so the bar colour comes from this view on every screen. */}
      <View style={{ height: insets.top, backgroundColor: STATUS_BAR_COLOR }} />
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <Active key={screen} />
      </Animated.View>
      {TAB_SCREENS.includes(screen) && <TabBar />}
      <StatusBar style="light" />
    </View>
  );
}

/** Decoded once at startup so illustrations appear instantly on every screen. */
function usePreloadedImages() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    Asset.loadAsync(allImages)
      .catch(() => undefined)
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

export default function App() {
  usePreloadedImages();
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_600SemiBold,
    NotoSansDevanagari_700Bold,
    NotoSansOriya_400Regular,
    NotoSansOriya_500Medium,
    NotoSansOriya_600SemiBold,
    NotoSansOriya_700Bold,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: STATUS_BAR_COLOR }} />;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </SafeAreaProvider>
  );
}
