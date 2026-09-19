import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { useApp } from '@/store/AppContext';
import { GUIDES, type GuideKey } from '@/i18n/guides';
import { speak, stopSpeaking } from '@/services/speech';
import { colors } from '@/theme/colors';
import { Txt } from './Txt';

interface GuideCardProps {
  guide: GuideKey;
  className?: string;
  /** Speak on mount even when the voice guide setting is off (onboarding, tutorial). */
  forceVoice?: boolean;
}

/** On-screen instruction that is also read aloud in the artisan's language. */
export function GuideCard({ guide, className, forceVoice }: GuideCardProps) {
  const { language, voiceGuide, t } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const text = GUIDES[language].screens[guide];

  const play = () => {
    setSpeaking(true);
    void speak(text, language, {
      fallbackText: GUIDES.english.screens[guide],
      onDone: () => setSpeaking(false),
    });
  };

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      play();
    }
  };

  useEffect(() => {
    if (!(voiceGuide || forceVoice)) return;
    const timer = setTimeout(play, 350);
    return () => clearTimeout(timer);
    // Re-speak when the screen or language changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide, language]);

  // Always silence this card when the screen changes, even if it was started by a tap.
  useEffect(() => () => stopSpeaking(), [guide, language]);

  // Turning the voice guide off mutes whatever is playing right away.
  useEffect(() => {
    if (!voiceGuide && !forceVoice) stopSpeaking();
  }, [voiceGuide, forceVoice]);

  useEffect(() => {
    if (!speaking) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [speaking, pulse]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={speaking ? t.stop : t.listen}
      accessibilityState={{ selected: speaking }}
      onPress={toggle}
      className={twMerge('flex-row items-center gap-3 rounded-2xl bg-gold-50 border border-gold-100 pl-3 pr-4 py-3 active:bg-gold-100', className)}
    >
      <View className="w-9 h-9 items-center justify-center">
        <Animated.View
          style={{
            position: 'absolute',
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.gold200,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.25] }) }],
          }}
        />
        <View className="w-9 h-9 rounded-full bg-gold-400 items-center justify-center">
          {speaking ? <Volume2 size={17} color={colors.leaf900} /> : <VolumeX size={17} color={colors.leaf900} />}
        </View>
      </View>
      <Txt variant="bodySm" className="flex-1 text-ink-800">
        {text}
      </Txt>
    </Pressable>
  );
}
