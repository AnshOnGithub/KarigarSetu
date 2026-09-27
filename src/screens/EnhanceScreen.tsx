import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { useApp } from '@/store/AppContext';
import { services } from '@/config';
import { isDemoMode } from '@/services/demo';
import { createStudioShot } from '@/services/image';
import { GeminiError } from '@/services/gemini';
import { Button } from '@/components/Button';
import { FlowProgress } from '@/components/FlowProgress';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { colors } from '@/theme/colors';

type Shot = { status: 'working' } | { status: 'done'; uri: string } | { status: 'failed'; needsBilling: boolean };

/** Results survive leaving and re-entering the screen for the same original photo. */
const shotCache = new Map<string, string>();

/**
 * One-tap photo studio: the artisan sees a clean white-background photo made
 * automatically, and either keeps it or keeps their original. No styles, sliders or prompts.
 */
export function EnhanceScreen() {
  const { t, draft, setDraft, navigate } = useApp();
  const original = draft.originalPhoto;
  const available = services.studio || isDemoMode();
  const [shot, setShot] = useState<Shot | null>(() => {
    const cached = original ? shotCache.get(original) : undefined;
    return cached ? { status: 'done', uri: cached } : null;
  });
  const [comparing, setComparing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const generate = () => {
    if (!original || !available) return;
    setShot({ status: 'working' });
    createStudioShot(original, 'white', '')
      .then((uri) => {
        shotCache.set(original, uri);
        if (mounted.current) setShot({ status: 'done', uri });
      })
      .catch((error: unknown) => {
        if (mounted.current) setShot({ status: 'failed', needsBilling: error instanceof GeminiError && error.needsBilling });
      });
  };

  useEffect(() => {
    if (!original) {
      navigate('camera');
      return;
    }
    if (!shot) generate();
    // Start the render once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!original) return null;

  const working = shot?.status === 'working';
  const studioUri = shot?.status === 'done' ? shot.uri : null;

  const finish = (photo: string, enhancedWith: 'studio' | 'original') => {
    setDraft({ photo, enhancedWith });
    navigate('voice');
  };

  return (
    <Screen
      header={
        <>
          <Header title={t.addProduct} />
          <FlowProgress step={0} />
        </>
      }
      footer={
        <View className="gap-2">
          {studioUri ? (
            <Button label={t.usePhoto} onPress={() => finish(studioUri, 'studio')} />
          ) : (
            <Button label={t.useOriginal} variant={working ? 'secondary' : 'primary'} onPress={() => finish(original, 'original')} />
          )}
          {studioUri ? (
            <Button label={t.useOriginal} variant="ghost" onPress={() => finish(original, 'original')} />
          ) : (
            <Button label={t.retake} variant="ghost" onPress={() => navigate('camera')} />
          )}
        </View>
      }
    >
      <Txt variant="title" className="mt-1">
        {t.studioTitle}
      </Txt>

      <Pressable
        onPressIn={() => setComparing(true)}
        onPressOut={() => setComparing(false)}
        className="mt-5 w-full aspect-square rounded-[20px] overflow-hidden bg-paper-200"
      >
        <Image source={{ uri: comparing || !studioUri ? original : studioUri }} className="w-full h-full" resizeMode="cover" />
        {working && (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <ActivityIndicator color={colors.white} size="large" />
            <Txt variant="heading" className="text-white mt-4 text-center px-8">
              {t.creatingStudio}
            </Txt>
          </View>
        )}
      </Pressable>

      {studioUri && (
        <Txt variant="caption" className="mt-2 text-center">
          {t.holdToCompare}
        </Txt>
      )}

      {shot?.status === 'failed' && (
        <View className="mt-4 rounded-2xl bg-clay-50 px-4 py-3 flex-row items-center gap-3">
          <Txt variant="bodySm" className="flex-1 text-clay-600">
            {shot.needsBilling ? t.studioNeedsBilling : t.studioFailed}
          </Txt>
          {!shot.needsBilling && <Button label={t.regenerate} size="sm" variant="secondary" icon={RotateCcw} onPress={generate} />}
        </View>
      )}

      {studioUri && (
        <Pressable onPress={generate} className="self-center mt-3 flex-row items-center gap-1.5 h-10 px-3 rounded-full active:bg-paper-200">
          <RotateCcw size={15} color={colors.leaf600} />
          <Txt variant="bodySm" weight="semibold" className="text-leaf-700">
            {t.regenerate}
          </Txt>
        </Pressable>
      )}

      <GuideCard guide="enhance" className="mt-5" />
    </Screen>
  );
}
