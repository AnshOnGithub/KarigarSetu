import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useApp } from '@/store/AppContext';
import { format } from '@/i18n/strings';
import { Button } from '@/components/Button';
import { GuideCard } from '@/components/GuideCard';
import { HeroBand } from '@/components/HeroBand';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Badge, CHANNEL_TONE, Card, formatINR } from '@/components/ui';
import { colors } from '@/theme/colors';

export function SuccessScreen() {
  const { t, products, lastPublishedId, navigate, startNewProduct } = useApp();
  const product = products.find((p) => p.id === lastPublishedId);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  if (!product) {
    return null;
  }

  return (
    <Screen
      contentClassName="px-0 pt-0"
      footer={
        <View className="gap-2">
          <Button label={t.viewProducts} variant="gold" onPress={() => navigate('products')} />
          <Button label={t.addAnother} variant="ghost" onPress={startNewProduct} />
        </View>
      }
    >
      <HeroBand>
        <View className="items-center px-6 pt-24 pb-12">
          <Animated.View
            style={{
              transform: [{ scale }],
              opacity,
              width: 108,
              height: 108,
              borderRadius: 54,
              backgroundColor: colors.gold400,
              borderWidth: 6,
              borderColor: 'rgba(246,217,138,0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={50} color={colors.leaf900} strokeWidth={2.6} />
          </Animated.View>
          <Txt variant="display" className="mt-6 text-center text-white">
            {t.liveTitle}
          </Txt>
          <Txt variant="body" className="mt-2 text-center max-w-[300px] text-leaf-100">
            {format(t.liveHint, { channels: product.channels.join(', ') })}
          </Txt>
        </View>
      </HeroBand>

      <View className="px-5">
      <Card className="-mt-6 overflow-hidden">
        {product.image ? <Image source={{ uri: product.image }} className="w-full h-48" resizeMode="cover" /> : null}
        <View className="p-4">
          <Txt variant="heading" latin numberOfLines={2}>
            {product.title}
          </Txt>
          <Txt variant="title" latin className="mt-1 text-gold-600">
            {formatINR(product.price)}
          </Txt>
          <View className="flex-row gap-2 mt-3">
            {product.channels.map((c) => (
              <Badge key={c} label={c} tone={CHANNEL_TONE[c]} latin />
            ))}
          </View>
        </View>
      </Card>

      <GuideCard guide="success" className="mt-5" />
      </View>
    </Screen>
  );
}
