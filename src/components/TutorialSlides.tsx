import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, View } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { useApp } from '@/store/AppContext';
import { GUIDES } from '@/i18n/guides';
import { speak, stopSpeaking } from '@/services/speech';
import { colors } from '@/theme/colors';
import { ILLUSTRATION_BG, images } from '@/theme/images';
import { Button } from './Button';
import { Txt } from './Txt';

function SlideArt({ index, finished }: { index: number; finished: boolean }) {
  return (
    <View className="rounded-[28px] overflow-hidden border border-gold-100" style={{ backgroundColor: ILLUSTRATION_BG, height: '100%', maxHeight: 340, aspectRatio: 1 }}>
      <Image source={finished ? images.tutorialDone : images.tutorial[index]} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
  );
}

interface TutorialSlidesProps {
  onFinish: () => void;
  onSkip?: () => void;
  finishLabel: string;
}

/** Five narrated steps explaining the product flow, ending in a call to action. */
export function TutorialSlides({ onFinish, onSkip, finishLabel }: TutorialSlidesProps) {
  const { language, t } = useApp();
  const guide = GUIDES[language];
  const slides = guide.slides;
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const finished = index >= slides.length;

  const narrate = (i: number) => {
    const slide = slides[i];
    const english = GUIDES.english.slides[i];
    const text = slide ? `${slide.title}. ${slide.body}` : guide.finish;
    const fallbackText = english ? `${english.title}. ${english.body}` : GUIDES.english.finish;
    setSpeaking(true);
    void speak(text, language, { fallbackText, onDone: () => setSpeaking(false) });
  };

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const timer = setTimeout(() => narrate(index), 250);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, language]);

  const toggleVoice = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      narrate(index);
    }
  };

  const slide = slides[index];

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-5 h-14">
        <View className="flex-row gap-1.5">
          {[...slides, null].map((_, i) => (
            <View key={i} className={twMerge('h-1.5 rounded-full', i === index ? 'w-6 bg-gold-400' : i < index ? 'w-1.5 bg-leaf-500' : 'w-1.5 bg-paper-300')} />
          ))}
        </View>
        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={speaking ? t.stop : t.listen}
            onPress={toggleVoice}
            className={twMerge('w-11 h-11 rounded-full items-center justify-center', speaking ? 'bg-gold-100' : 'active:bg-paper-200')}
          >
            {speaking ? <Volume2 size={20} color={colors.gold700} /> : <VolumeX size={20} color={colors.ink500} />}
          </Pressable>
          {onSkip && !finished && (
            <Pressable onPress={onSkip} className="h-11 px-3 rounded-full items-center justify-center active:bg-paper-200">
              <Txt variant="bodySm" weight="semibold" className="text-ink-600">
                {t.skip}
              </Txt>
            </Pressable>
          )}
        </View>
      </View>

      <Animated.View
        style={{ flex: 1, paddingHorizontal: 24, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}
      >
        <View className="flex-1 items-center justify-center py-3">
          <SlideArt index={index} finished={finished} />
        </View>
        <View className="pb-4">
          {!finished && (
            <Txt variant="overline" latin className="text-gold-600 mb-3">
              {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </Txt>
          )}
          <Txt variant="display">{finished ? t.tutorialDone : slide.title}</Txt>
          <Txt variant="body" className="mt-3 text-[16px] leading-[25px]">
            {finished ? guide.finish : slide.body}
          </Txt>
        </View>
      </Animated.View>

      <View className="px-5 pt-3 pb-2 gap-2">
        {finished ? (
          <>
            <Button label={finishLabel} variant="gold" onPress={onFinish} />
            {onSkip && <Button label={t.done} variant="ghost" onPress={onSkip} />}
          </>
        ) : (
          <View className="flex-row gap-3">
            {index > 0 && <Button label={t.back} variant="secondary" className="flex-1" onPress={() => setIndex((i) => i - 1)} />}
            <Button label={t.next} className="flex-[2]" onPress={() => setIndex((i) => i + 1)} />
          </View>
        )}
      </View>
    </View>
  );
}
