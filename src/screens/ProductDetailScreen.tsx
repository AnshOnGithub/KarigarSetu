import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';
import { Check, Minus, Plus, Trash2 } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { useApp } from '@/store/AppContext';
import type { Channel } from '@/types';
import { Button } from '@/components/Button';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Badge, Card, Divider, Field, SectionLabel } from '@/components/ui';
import { colors } from '@/theme/colors';

const CHANNELS: Channel[] = ['ONDC', 'GeM', 'B2B'];

export function ProductDetailScreen() {
  const { t, products, selectedProductId, updateProduct, deleteProduct, navigate } = useApp();
  const product = products.find((p) => p.id === selectedProductId);
  const [price, setPrice] = useState(product ? String(product.price) : '');

  useEffect(() => {
    if (!product) navigate('products');
  }, [product, navigate]);

  if (!product) return null;

  const commitPrice = () => {
    const value = Number(price);
    if (value > 0) updateProduct(product.id, { price: Math.round(value) });
    else setPrice(String(product.price));
  };

  const toggleChannel = (channel: Channel) => {
    const channels = product.channels.includes(channel) ? product.channels.filter((c) => c !== channel) : [...product.channels, channel];
    if (channels.length > 0) updateProduct(product.id, { channels });
  };

  const confirmDelete = () => {
    Alert.alert(t.deleteProduct, t.deleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => {
          deleteProduct(product.id);
          navigate('products');
        },
      },
    ]);
  };

  const live = product.status === 'published';

  return (
    <Screen header={<Header title={t.productDetails} />}>
      {product.image ? <Image source={{ uri: product.image }} className="w-full aspect-[4/3] rounded-[20px] bg-paper-200" resizeMode="cover" /> : null}

      <Txt variant="title" latin className="mt-5">
        {product.title}
      </Txt>
      {product.category ? (
        <Txt variant="caption" latin className="mt-1">
          {product.category}
        </Txt>
      ) : null}
      {product.syncState && (
        <Badge
          label={product.syncState === 'synced' ? t.syncDone : product.syncState === 'pending' ? t.syncPending : t.syncFailed}
          tone={product.syncState === 'synced' ? 'leaf' : product.syncState === 'pending' ? 'gold' : 'clay'}
          className="mt-2"
        />
      )}

      <View className="flex-row gap-3 mt-5">
        <Field
          className="flex-1"
          label={t.price}
          prefix="₹"
          keyboardType="number-pad"
          value={price}
          onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ''))}
          onEndEditing={commitPrice}
          onBlur={commitPrice}
          latin
        />
        <View className="flex-1">
          <Txt variant="caption" weight="semibold" className="mb-1.5 px-1 text-ink-600">
            {t.stock}
          </Txt>
          <View className="h-14 bg-white border border-paper-300 rounded-[14px] flex-row items-center justify-between px-1.5">
            <Pressable onPress={() => updateProduct(product.id, { stock: Math.max(0, product.stock - 1) })} className="w-11 h-11 rounded-[10px] items-center justify-center active:bg-paper-100">
              <Minus size={18} color={colors.ink900} />
            </Pressable>
            <Txt variant="heading" latin>
              {product.stock}
            </Txt>
            <Pressable onPress={() => updateProduct(product.id, { stock: product.stock + 1 })} className="w-11 h-11 rounded-[10px] items-center justify-center active:bg-paper-100">
              <Plus size={18} color={colors.ink900} />
            </Pressable>
          </View>
        </View>
      </View>

      <SectionLabel className="mt-7">{t.channels}</SectionLabel>
      <Card>
        {CHANNELS.map((channel, index) => {
          const on = product.channels.includes(channel);
          return (
            <View key={channel}>
              {index > 0 && <Divider inset={16} />}
              <Pressable onPress={() => toggleChannel(channel)} className="flex-row items-center px-4 h-14 active:bg-paper-50">
                <Txt variant="body" latin weight="semibold" className="flex-1 text-ink-900">
                  {channel}
                </Txt>
                <View className={twMerge('w-6 h-6 rounded-md items-center justify-center border', on ? 'bg-leaf-500 border-leaf-500' : 'border-paper-300')}>
                  {on && <Check size={15} color={colors.white} strokeWidth={3} />}
                </View>
              </Pressable>
            </View>
          );
        })}
      </Card>

      {product.description ? (
        <>
          <SectionLabel className="mt-7">{t.descriptionLabel}</SectionLabel>
          <Card className="p-4">
            <Txt variant="body" latin>
              {product.description}
            </Txt>
          </Card>
        </>
      ) : null}

      <View className="gap-2 mt-7">
        <Button label={live ? t.moveToDraft : t.makeLive} variant={live ? 'secondary' : 'primary'} onPress={() => updateProduct(product.id, { status: live ? 'draft' : 'published' })} />
        <Button label={t.deleteProduct} variant="danger" icon={Trash2} onPress={confirmDelete} />
      </View>

      <GuideCard guide="productDetail" className="mt-5" />
    </Screen>
  );
}
