import { useState } from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/Button';
import { GenderPicker } from '@/components/GenderPicker';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { LanguagePicker } from '@/components/LanguagePicker';
import { Screen } from '@/components/Screen';
import { TutorialSlides } from '@/components/TutorialSlides';
import { Txt } from '@/components/Txt';
import { Wordmark } from '@/components/Wordmark';
import { HeroBand } from '@/components/HeroBand';
import { Field } from '@/components/ui';
import { ILLUSTRATION_BG, images } from '@/theme/images';

type Step = 'language' | 'profile' | 'tutorial';

export function OnboardingScreen() {
  const { t, profile, updateProfile, completeOnboarding, startNewProduct, navigate } = useApp();
  const [step, setStep] = useState<Step>('language');
  const insets = useSafeAreaInsets();

  const finish = (addProduct: boolean) => {
    completeOnboarding();
    if (addProduct) startNewProduct();
    else navigate('home');
  };

  if (step === 'tutorial') {
    return (
      <View className="flex-1 bg-paper-100" style={{ paddingBottom: insets.bottom }}>
        <TutorialSlides finishLabel={t.tryNow} onFinish={() => finish(true)} onSkip={() => finish(false)} />
      </View>
    );
  }

  if (step === 'profile') {
    return (
      <Screen
        header={<Header onBack={() => setStep('language')} />}
        footer={
          <View className="flex-row gap-3">
            <Button label={t.skip} variant="secondary" className="flex-1" onPress={() => setStep('tutorial')} />
            <Button label={t.continue} className="flex-[2]" onPress={() => setStep('tutorial')} />
          </View>
        }
      >
        <View className="items-center mt-1 mb-4">
          <View className="w-44 h-44 rounded-full overflow-hidden border-4 border-gold-200" style={{ backgroundColor: ILLUSTRATION_BG }}>
            <Image source={images.onboardingProfile} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>
        </View>
        <Txt variant="display" className="mt-2">
          {t.aboutYou}
        </Txt>
        <Txt variant="body" className="mt-2">
          {t.aboutYouHint}
        </Txt>
        <View className="gap-4 mt-8">
          <Field
            label={t.yourName}
            placeholder={t.yourNamePlaceholder}
            value={profile.name}
            onChangeText={(name) => updateProfile({ name })}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Field label={t.yourCraft} placeholder={t.yourCraftPlaceholder} value={profile.craft} onChangeText={(craft) => updateProfile({ craft })} />
          <View>
            <Txt variant="bodySm" weight="semibold" className="mb-2 text-ink-700">
              {t.yourGender}
            </Txt>
            <GenderPicker />
          </View>
        </View>
        <GuideCard guide="profile" forceVoice className="mt-8" />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label={t.continue} onPress={() => setStep('profile')} />} contentClassName="px-0 pt-0">
      <HeroBand>
        <View className="px-6 pt-6 pb-16">
          <Wordmark size={22} inverted />
          <View className="w-10 h-[3px] rounded-full bg-gold-400 mt-7 mb-4" />
          <Txt variant="display" className="text-white text-[36px] leading-[44px]">
            {t.tagline}
          </Txt>
        </View>
      </HeroBand>

      <View className="px-5 -mt-8">
        <View className="rounded-[24px] overflow-hidden border border-gold-100" style={{ backgroundColor: ILLUSTRATION_BG, aspectRatio: 1200 / 896 }}>
          <Image source={images.onboardingHero} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityIgnoresInvertColors />
        </View>
      </View>

      <View className="flex-1 px-5 pt-7">
        <Txt variant="heading">{t.chooseLanguage}</Txt>
        <Txt variant="bodySm" className="mt-1 mb-4">
          {t.chooseLanguageHint}
        </Txt>
        <LanguagePicker />
        <View className="flex-1 min-h-6" />
        <GuideCard guide="welcome" forceVoice className="mt-8" />
      </View>
    </Screen>
  );
}
