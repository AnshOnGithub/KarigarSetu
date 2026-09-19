import { Image, Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { useApp } from '@/store/AppContext';
import type { Gender } from '@/types';
import { images } from '@/theme/images';
import { Txt } from './Txt';

const OPTIONS: { key: Gender; label: 'male' | 'female'; art: 'artisanMale' | 'artisanFemale' }[] = [
  { key: 'male', label: 'male', art: 'artisanMale' },
  { key: 'female', label: 'female', art: 'artisanFemale' },
];

/** Chooses which artisan illustration greets the user on the home screen. */
export function GenderPicker({ className }: { className?: string }) {
  const { t, profile, updateProfile } = useApp();

  return (
    <View className={twMerge('flex-row gap-3', className)}>
      {OPTIONS.map(({ key, label, art }) => {
        const selected = profile.gender === key;
        return (
          <Pressable
            key={key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t[label]}
            onPress={() => updateProfile({ gender: selected ? null : key })}
            className={twMerge(
              'flex-1 flex-row items-center gap-3 rounded-2xl border px-3 py-2.5 active:bg-paper-50',
              selected ? 'border-gold-400 bg-gold-50' : 'border-paper-200 bg-white'
            )}
          >
            <View className="w-10 h-10 rounded-full overflow-hidden bg-paper-100 items-center justify-center">
              <Image source={images[art]} style={{ width: 36, height: 36 }} resizeMode="contain" />
            </View>
            <Txt variant="bodySm" weight="semibold" numberOfLines={1} className={selected ? 'text-gold-700' : 'text-ink-700'}>
              {t[label]}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
