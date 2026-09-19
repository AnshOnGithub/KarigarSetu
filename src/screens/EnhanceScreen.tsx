import { useEffect, useRef, useState, type ComponentType } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Pressable, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Canvas, ColorMatrix, Image as SkiaImage, useImage } from '@shopify/react-native-skia';
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Gift,
  LayoutGrid,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Sofa,
  Square,
  Undo2,
  WandSparkles,
  ZoomIn,
} from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { useApp } from '@/store/AppContext';
import { providers, services } from '@/config';
import { isDemoMode } from '@/services/demo';
import type { StringKey } from '@/i18n/strings';
import { createStudioShot, type StudioStyle } from '@/services/image';
import {
  applyGeometry,
  colorEditingSupported,
  colorMatrix,
  exportEdited,
  hasColorEdits,
  hasGeometryEdits,
  NO_EDITS,
  type CropRatio,
  type PhotoEdits,
} from '@/services/photoEdit';
import { GeminiError } from '@/services/gemini';
import { Button } from '@/components/Button';
import { FlowProgress } from '@/components/FlowProgress';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Field } from '@/components/ui';
import { colors } from '@/theme/colors';

type Icon = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
type PresetStyle = Exclude<StudioStyle, 'custom'>;

const STYLES: { key: PresetStyle; label: StringKey; desc: StringKey; icon: Icon }[] = [
  { key: 'white', label: 'styleWhite', desc: 'styleWhiteDesc', icon: Square },
  { key: 'home', label: 'styleHome', desc: 'styleHomeDesc', icon: Sofa },
  { key: 'flatlay', label: 'styleFlatlay', desc: 'styleFlatlayDesc', icon: LayoutGrid },
  { key: 'closeup', label: 'styleCloseup', desc: 'styleCloseupDesc', icon: ZoomIn },
  { key: 'festive', label: 'styleFestive', desc: 'styleFestiveDesc', icon: Gift },
];

const CROPS: { key: CropRatio; label: StringKey }[] = [
  { key: 'free', label: 'cropFree' },
  { key: '1:1', label: 'cropSquare' },
  { key: '4:5', label: 'cropPortrait' },
  { key: '4:3', label: 'cropWide' },
];

const SLIDERS: { key: 'brightness' | 'contrast' | 'saturation' | 'warmth'; label: StringKey }[] = [
  { key: 'brightness', label: 'brightness' },
  { key: 'contrast', label: 'contrast' },
  { key: 'saturation', label: 'saturation' },
  { key: 'warmth', label: 'warmth' },
];

type ShotState = { status: 'working' } | { status: 'done'; uri: string } | { status: 'failed'; needsBilling: boolean };

/** Results survive leaving and re-entering the screen for the same original photo. */
const shotCache = new Map<string, string>();
const cacheKey = (photo: string, style: StudioStyle, prompt = '') => `${photo}|${style}|${prompt}`;

/** Live colour preview; the sliders are only baked into a file when the photo is used. */
function ColorPreview({ uri, edits }: { uri: string; edits: PhotoEdits }) {
  const image = useImage(uri);
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View pointerEvents="none" style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {image && size.width > 0 && (
        <Canvas style={{ flex: 1 }}>
          <SkiaImage image={image} x={0} y={0} width={size.width} height={size.height} fit="contain">
            <ColorMatrix matrix={colorMatrix(edits)} />
          </SkiaImage>
        </Canvas>
      )}
    </View>
  );
}

export function EnhanceScreen() {
  const { t, draft, setDraft, navigate } = useApp();
  const original = draft.originalPhoto;
  // remove.bg can only produce a white background; every other provider offers all looks.
  const styles = providers.studio === 'remove.bg' ? STYLES.slice(0, 1) : STYLES;
  const [style, setStyle] = useState<StudioStyle>('white');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customUsed, setCustomUsed] = useState('');
  const [shots, setShots] = useState<Partial<Record<StudioStyle, ShotState>>>(() => {
    if (!original) return {};
    const cached: Partial<Record<StudioStyle, ShotState>> = {};
    STYLES.forEach(({ key }) => {
      const uri = shotCache.get(cacheKey(original, key));
      if (uri) cached[key] = { status: 'done', uri };
    });
    return cached;
  });
  const [comparing, setComparing] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [edits, setEdits] = useState<PhotoEdits>(NO_EDITS);
  const [shaped, setShaped] = useState<{ from: string; uri: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const shimmer = useRef(new Animated.Value(0)).current;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const generate = (key: StudioStyle, prompt = '') => {
    if (!original || !(services.studio || isDemoMode())) return;
    setShots((prev) => ({ ...prev, [key]: { status: 'working' } }));
    createStudioShot(original, key, prompt)
      .then((uri) => {
        shotCache.set(cacheKey(original, key, prompt), uri);
        if (mounted.current) setShots((prev) => ({ ...prev, [key]: { status: 'done', uri } }));
      })
      .catch((error: unknown) => {
        const needsBilling = error instanceof GeminiError && error.needsBilling;
        if (mounted.current) setShots((prev) => ({ ...prev, [key]: { status: 'failed', needsBilling } }));
      });
  };

  const selectStyle = (key: PresetStyle) => {
    setStyle(key);
    const existing = shots[key];
    if (!existing || existing.status === 'failed') generate(key);
  };

  const createCustom = () => {
    const prompt = customPrompt.trim();
    if (!prompt) return;
    setStyle('custom');
    setCustomUsed(prompt);
    generate('custom', prompt);
  };

  useEffect(() => {
    if (!original) {
      navigate('camera');
      return;
    }
    if (!shots.white) generate('white');
    // Start the first render once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = shots[style];
  const working = current?.status === 'working';
  const studioUri = current?.status === 'done' ? current.uri : null;
  const base = studioUri ?? original;

  // Rotate / flip / crop are cheap, so the preview is rebuilt whenever they change.
  useEffect(() => {
    if (!base) return;
    if (!hasGeometryEdits(edits)) {
      setShaped(null);
      return;
    }
    let cancelled = false;
    applyGeometry(base, edits)
      .then((uri) => !cancelled && setShaped({ from: base, uri }))
      .catch(() => !cancelled && setShaped(null));
    return () => {
      cancelled = true;
    };
  }, [base, edits.rotate, edits.flip, edits.crop]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!working) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [working, shimmer]);

  if (!original || !base) return null;

  const edited = hasGeometryEdits(edits) || hasColorEdits(edits);
  const previewUri = shaped && shaped.from === base ? shaped.uri : base;
  const showColorPreview = !comparing && colorEditingSupported && hasColorEdits(edits);

  const finish = async (uri: string, enhancedWith: 'studio' | 'original') => {
    let photo = uri;
    if (edited) {
      setSaving(true);
      try {
        photo = await exportEdited(uri, edits);
      } catch {
        // Keep the unedited photo rather than block the artisan.
      } finally {
        if (mounted.current) setSaving(false);
      }
    }
    setDraft({ photo, enhancedWith });
    navigate('voice');
  };

  const setEdit = (patch: Partial<PhotoEdits>) => setEdits((prev) => ({ ...prev, ...patch }));
  const turn = (delta: 90 | -90) => setEdit({ rotate: (((edits.rotate + delta) % 360) + 360) % 360 as PhotoEdits['rotate'] });

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
            <Button label={saving ? t.savingPhoto : t.usePhoto} loading={saving} disabled={saving} onPress={() => void finish(studioUri, 'studio')} />
          ) : (
            <Button label={t.useOriginal} variant={working ? 'secondary' : 'primary'} disabled={saving} onPress={() => void finish(original, 'original')} />
          )}
          {studioUri ? (
            <Button label={t.useOriginal} variant="ghost" disabled={saving} onPress={() => void finish(original, 'original')} />
          ) : (
            <Button label={t.retake} variant="ghost" onPress={() => navigate('camera')} />
          )}
        </View>
      }
    >
      <Txt variant="title" className="mt-1">
        {t.studioTitle}
      </Txt>
      <Txt variant="bodySm" className="mt-1.5">
        {services.studio || isDemoMode() ? t.studioHint : t.studioOff}
      </Txt>

      <Pressable
        onPressIn={() => setComparing(true)}
        onPressOut={() => setComparing(false)}
        className="mt-5 w-full aspect-square rounded-[20px] overflow-hidden bg-paper-200"
      >
        {showColorPreview ? (
          <ColorPreview uri={previewUri} edits={edits} />
        ) : (
          <Image source={{ uri: comparing ? original : previewUri }} className="w-full h-full" resizeMode={edited ? 'contain' : 'cover'} />
        )}

        {working && (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <Animated.View style={{ opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }}>
              <ActivityIndicator color={colors.white} size="large" />
            </Animated.View>
            <Txt variant="heading" className="text-white mt-4 text-center px-8">
              {t.creatingStudio}
            </Txt>
            <Txt variant="caption" className="text-white/85 mt-1 text-center px-10">
              {t.creatingStudioHint}
            </Txt>
          </View>
        )}

        {(studioUri || edited) && (
          <View className="absolute top-3 left-3 rounded-full bg-gold-400 px-3 py-1">
            <Txt variant="caption" weight="semibold" className="text-leaf-900">
              {comparing ? t.original : studioUri ? t.studioTitle : t.editPhoto}
            </Txt>
          </View>
        )}
      </Pressable>

      {(studioUri || edited) && (
        <Txt variant="caption" className="mt-2 text-center">
          {t.holdToCompare}
        </Txt>
      )}

      {(services.studio || isDemoMode()) && (
        <View className="flex-row flex-wrap justify-between gap-y-2.5 mt-5">
          {styles.map(({ key, label, desc, icon: StyleIcon }) => {
            const selected = key === style;
            const state = shots[key];
            return (
              <Pressable
                key={key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${t[label]}. ${t[desc]}`}
                onPress={() => selectStyle(key)}
                className={twMerge(
                  'w-[48.5%] flex-row items-center gap-2.5 rounded-2xl border px-3 py-3',
                  selected ? 'border-gold-400 bg-gold-50' : 'border-paper-200 bg-white'
                )}
                style={selected ? { borderWidth: 1.5 } : undefined}
              >
                <View className={twMerge('w-11 h-11 rounded-xl items-center justify-center overflow-hidden', selected ? 'bg-gold-100' : 'bg-paper-100')}>
                  {state?.status === 'done' ? (
                    <Image source={{ uri: state.uri }} className="w-full h-full" />
                  ) : state?.status === 'working' ? (
                    <ActivityIndicator size="small" color={colors.leaf600} />
                  ) : (
                    <StyleIcon size={20} color={selected ? colors.gold700 : colors.ink500} />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1">
                    <Txt variant="bodySm" weight="semibold" numberOfLines={1} className={twMerge('shrink', selected ? 'text-gold-700' : 'text-ink-800')}>
                      {t[label]}
                    </Txt>
                    {selected && state?.status === 'done' && <Check size={13} color={colors.gold700} strokeWidth={3} />}
                  </View>
                  <Txt variant="caption" numberOfLines={2} className="text-[11px] leading-[14px]">
                    {key === 'white' ? `★ ${t.recommended} · ` : ''}
                    {t[desc]}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
          {style === 'custom' && (
            <View className="w-[48.5%] flex-row items-center gap-2.5 rounded-2xl border border-gold-400 bg-gold-50 px-3 py-3" style={{ borderWidth: 1.5 }}>
              <View className="w-11 h-11 rounded-xl items-center justify-center bg-gold-100">
                {working ? <ActivityIndicator size="small" color={colors.leaf600} /> : <WandSparkles size={20} color={colors.gold700} />}
              </View>
              <Txt variant="bodySm" weight="semibold" className="flex-1 text-gold-700">
                {t.styleCustom}
              </Txt>
            </View>
          )}
        </View>
      )}

      {current?.status === 'failed' && (
        <View className="mt-4 rounded-2xl bg-clay-50 px-4 py-3 flex-row items-center gap-3">
          <Txt variant="bodySm" className="flex-1 text-clay-600">
            {current.needsBilling ? t.studioNeedsBilling : t.studioFailed}
          </Txt>
          {!current.needsBilling && (
            <Button label={t.regenerate} size="sm" variant="secondary" icon={RotateCcw} onPress={() => generate(style, style === 'custom' ? customUsed : '')} />
          )}
        </View>
      )}

      {studioUri && (
        <Pressable
          onPress={() => generate(style, style === 'custom' ? customUsed : '')}
          className="self-center mt-3 flex-row items-center gap-1.5 h-10 px-3 rounded-full active:bg-paper-200"
        >
          <RotateCcw size={15} color={colors.leaf600} />
          <Txt variant="bodySm" weight="semibold" className="text-leaf-700">
            {t.regenerate}
          </Txt>
        </Pressable>
      )}

      <GuideCard guide="enhance" className="mt-5" />

      {/* Advanced: hidden by default so first-time artisans only see the simple choices above. */}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: advancedOpen }}
        onPress={() => setAdvancedOpen((open) => !open)}
        className="mt-5 flex-row items-center gap-3 rounded-2xl border border-paper-200 bg-white px-4 py-3.5 active:bg-paper-100"
      >
        <SlidersHorizontal size={18} color={colors.ink700} />
        <View className="flex-1">
          <Txt variant="body" weight="semibold" className="text-ink-800">
            {t.advanced}
          </Txt>
          <Txt variant="caption">{t.advancedHint}</Txt>
        </View>
        <View style={{ transform: [{ rotate: advancedOpen ? '180deg' : '0deg' }] }}>
          <ChevronDown size={20} color={colors.ink500} />
        </View>
      </Pressable>

      {advancedOpen && (
        <View className="mt-3 gap-3">
          {services.studio && providers.studio === 'gemini' && (
            <View className="rounded-2xl border border-paper-200 bg-white p-4">
              <View className="flex-row items-center gap-2">
                <WandSparkles size={16} color={colors.gold600} />
                <Txt variant="heading">{t.customPromptTitle}</Txt>
              </View>
              <Txt variant="caption" className="mt-1 mb-3">
                {t.customPromptHint}
              </Txt>
              <Field multiline value={customPrompt} onChangeText={setCustomPrompt} placeholder={t.customPromptPlaceholder} maxLength={400} />
              <Button
                label={t.createPhoto}
                size="md"
                variant="secondary"
                icon={WandSparkles}
                className="mt-3"
                disabled={!customPrompt.trim() || (style === 'custom' && working)}
                onPress={createCustom}
              />
            </View>
          )}

          <View className="rounded-2xl border border-paper-200 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Txt variant="heading">{t.editPhoto}</Txt>
              {edited && (
                <Pressable onPress={() => setEdits(NO_EDITS)} className="flex-row items-center gap-1 h-9 px-2.5 rounded-full active:bg-paper-200">
                  <Undo2 size={14} color={colors.clay500} />
                  <Txt variant="caption" weight="semibold" className="text-clay-600">
                    {t.resetEdits}
                  </Txt>
                </Pressable>
              )}
            </View>

            <View className="flex-row gap-2 mt-3">
              <ToolButton icon={RotateCcw} label={t.rotate} onPress={() => turn(-90)} />
              <ToolButton icon={RotateCw} label={t.rotate} onPress={() => turn(90)} />
              <ToolButton icon={ArrowLeftRight} label={t.flip} active={edits.flip} onPress={() => setEdit({ flip: !edits.flip })} />
            </View>

            <Txt variant="caption" weight="semibold" className="mt-4 mb-1.5 text-ink-600">
              {t.crop}
            </Txt>
            <View className="flex-row gap-2">
              {CROPS.map(({ key, label }) => {
                const selected = edits.crop === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setEdit({ crop: key })}
                    className={twMerge('flex-1 h-10 rounded-xl items-center justify-center border', selected ? 'bg-leaf-500 border-leaf-500' : 'bg-white border-paper-300')}
                  >
                    <Txt variant="caption" weight="semibold" numberOfLines={1} className={selected ? 'text-white' : 'text-ink-700'}>
                      {t[label]}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>

            {colorEditingSupported &&
              SLIDERS.map(({ key, label }) => (
                <View key={key} className="mt-3">
                  <View className="flex-row justify-between">
                    <Txt variant="caption" weight="semibold" className="text-ink-600">
                      {t[label]}
                    </Txt>
                    <Txt variant="caption" latin className="text-ink-500">
                      {edits[key] > 0 ? '+' : ''}
                      {Math.round(edits[key] * 100)}
                    </Txt>
                  </View>
                  <Slider
                    minimumValue={-1}
                    maximumValue={1}
                    step={0.05}
                    value={edits[key]}
                    onValueChange={(value) => setEdit({ [key]: value })}
                    minimumTrackTintColor={colors.leaf500}
                    maximumTrackTintColor={colors.paper300}
                    thumbTintColor={colors.gold400}
                    accessibilityLabel={t[label]}
                  />
                </View>
              ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

function ToolButton({ icon: ToolIcon, label, onPress, active }: { icon: Icon; label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={twMerge('flex-1 h-14 rounded-xl items-center justify-center border gap-0.5', active ? 'bg-leaf-50 border-leaf-500' : 'bg-white border-paper-300 active:bg-paper-100')}
    >
      <ToolIcon size={18} color={active ? colors.leaf600 : colors.ink700} />
      <Txt variant="caption" className="text-[11px] leading-[13px]">
        {label}
      </Txt>
    </Pressable>
  );
}
