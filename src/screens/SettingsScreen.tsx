import type { ComponentType, ReactNode } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { ChevronRight, Database, GraduationCap, RotateCcw, Volume2 } from 'lucide-react-native';
import { useApp } from '@/store/AppContext';
import { services } from '@/config';
import { GenderPicker } from '@/components/GenderPicker';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { LanguagePicker } from '@/components/LanguagePicker';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card, Divider, Field, SectionLabel } from '@/components/ui';
import { colors } from '@/theme/colors';

type Icon = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function Row({ icon: Icon, title, hint, right, onPress, danger }: { icon: Icon; title: string; hint?: string; right?: ReactNode; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} className="flex-row items-center gap-3.5 px-4 min-h-[64px] py-3 active:bg-paper-50">
      <Icon size={20} color={danger ? colors.clay500 : colors.ink700} strokeWidth={1.8} />
      <View className="flex-1">
        <Txt variant="body" weight="semibold" className={danger ? 'text-clay-600' : 'text-ink-900'}>
          {title}
        </Txt>
        {hint ? <Txt variant="caption" className="mt-0.5">{hint}</Txt> : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={colors.ink400} /> : null)}
    </Pressable>
  );
}

function ServiceRow({ label, on }: { label: string; on: boolean }) {
  const { t } = useApp();
  return (
    <View className="flex-row items-center px-4 h-12">
      <Txt variant="bodySm" weight="medium" className="flex-1 text-ink-800">
        {label}
      </Txt>
      <View className={`w-2 h-2 rounded-full mr-2 ${on ? 'bg-leaf-500' : 'bg-saffron-500'}`} />
      <Txt variant="caption">{on ? t.connected : t.notConnected}</Txt>
    </View>
  );
}

export function SettingsScreen() {
  const { t, profile, updateProfile, voiceGuide, setVoiceGuide, demoMode, setDemoData, navigate, resetApp } = useApp();

  const confirmReset = () => {
    Alert.alert(t.resetApp, t.resetConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.resetApp, style: 'destructive', onPress: () => void resetApp() },
    ]);
  };

  return (
    <Screen withTabBar header={<Header large title={t.settings} />}>
      <GuideCard guide="settings" />

      <SectionLabel className="mt-7">{t.profile}</SectionLabel>
      <View className="gap-3">
        <Field placeholder={t.yourNamePlaceholder} value={profile.name} onChangeText={(name) => updateProfile({ name })} autoCapitalize="words" />
        <Field placeholder={t.yourCraftPlaceholder} value={profile.craft} onChangeText={(craft) => updateProfile({ craft })} />
        <GenderPicker />
      </View>

      <SectionLabel className="mt-7">{t.language}</SectionLabel>
      <LanguagePicker />

      <SectionLabel className="mt-7">{t.preferences}</SectionLabel>
      <Card>
        <Row
          icon={Volume2}
          title={t.voiceGuide}
          hint={t.voiceGuideHint}
          right={
            <Switch
              value={voiceGuide}
              onValueChange={setVoiceGuide}
              trackColor={{ false: colors.paper300, true: colors.leaf500 }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.paper300}
            />
          }
        />
        <Divider inset={50} />
        <Row icon={GraduationCap} title={t.tutorial} hint={t.tutorialHint} onPress={() => navigate('tutorial')} />
      </Card>

      <SectionLabel className="mt-7">{t.services}</SectionLabel>
      <Card>
        <ServiceRow label={t.aiListing} on={services.ai} />
        <Divider inset={16} />
        <ServiceRow label={t.speechToText} on={services.speechToText} />
        <Divider inset={16} />
        <ServiceRow label={t.photoCleanup} on={services.studio || demoMode} />
      </Card>

      <SectionLabel className="mt-7">{t.data}</SectionLabel>
      <Card>
        <Row
          icon={Database}
          title={t.loadSample}
          hint={t.loadSampleHint}
          right={
            <Switch
              value={demoMode}
              onValueChange={setDemoData}
              trackColor={{ false: colors.paper300, true: colors.leaf500 }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.paper300}
            />
          }
        />
        <Divider inset={50} />
        <Row icon={RotateCcw} title={t.resetApp} hint={t.resetAppHint} onPress={confirmReset} danger />
      </Card>

      <Txt variant="caption" latin className="text-center mt-8">
        KarigarSetu · {t.version} {Constants.expoConfig?.version ?? '1.0.0'}
      </Txt>
    </Screen>
  );
}
