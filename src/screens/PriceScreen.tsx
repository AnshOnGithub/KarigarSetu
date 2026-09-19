import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, View } from 'react-native';
import { Check, RotateCcw, ScanSearch, Store, Tag } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { useApp } from '@/store/AppContext';
import { services } from '@/config';
import type { StringKey } from '@/i18n/strings';
import { researchPrice, type MarketResearch, type ResearchStage } from '@/services/marketResearch';
import { Button } from '@/components/Button';
import { FlowProgress } from '@/components/FlowProgress';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Field, formatINR } from '@/components/ui';
import { HeroBand } from '@/components/HeroBand';
import { colors } from '@/theme/colors';

const PROFIT_OPTIONS = [20, 30, 40];
const toNumber = (value: string) => Math.max(0, Number(value.replace(/[^0-9.]/g, '')) || 0);
const digits = (value: string) => value.replace(/[^0-9]/g, '');

const STEPS: { stage: ResearchStage; label: StringKey; done: StringKey; icon: typeof ScanSearch }[] = [
  { stage: 'analysis', label: 'researchStep1', done: 'researchStep1Done', icon: ScanSearch },
  { stage: 'market', label: 'researchStep2', done: 'researchStep2Done', icon: Store },
  { stage: 'verdict', label: 'researchStep3', done: 'researchStep3Done', icon: Tag },
];

type Progress = Partial<MarketResearch>;

/** One research step: spinner while it runs, then its findings. */
function ResearchStep({
  index,
  active,
  complete,
  label,
  doneLabel,
  icon: Icon,
  children,
}: {
  index: number;
  active: boolean;
  complete: boolean;
  label: string;
  doneLabel: string;
  icon: typeof ScanSearch;
  children?: React.ReactNode;
}) {
  const fade = useRef(new Animated.Value(complete ? 1 : 0)).current;

  useEffect(() => {
    if (!complete) return;
    Animated.timing(fade, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [complete, fade]);

  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View
          className={twMerge(
            'w-8 h-8 rounded-full items-center justify-center',
            complete ? 'bg-leaf-500' : active ? 'bg-gold-100' : 'bg-paper-200'
          )}
        >
          {complete ? (
            <Check size={16} color={colors.white} strokeWidth={3} />
          ) : active ? (
            <ActivityIndicator size="small" color={colors.gold600} />
          ) : (
            <Icon size={15} color={colors.ink400} />
          )}
        </View>
        {index < STEPS.length - 1 && <View className={twMerge('w-0.5 flex-1 my-1', complete ? 'bg-leaf-300' : 'bg-paper-200')} />}
      </View>

      <View className="flex-1 pb-4">
        <Txt variant="bodySm" weight="semibold" className={complete ? 'text-ink-800' : active ? 'text-gold-700' : 'text-ink-400'}>
          {complete ? doneLabel : label}
        </Txt>
        {complete && children ? <Animated.View style={{ opacity: fade }}>{children}</Animated.View> : null}
      </View>
    </View>
  );
}

export function PriceScreen() {
  const { t, language, profile, draft, setDraft, navigate } = useApp();
  const [material, setMaterial] = useState(draft.costBreakdown.material ? String(draft.costBreakdown.material) : '');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('80');
  const [profitPct, setProfitPct] = useState(30);
  const [customPrice, setCustomPrice] = useState(draft.price ? String(draft.price) : '');
  const [stock, setStock] = useState(String(draft.stock || 1));

  const [progress, setProgress] = useState<Progress>(() => draft.marketResearch ?? {});
  const [researching, setResearching] = useState(false);
  const [researchFailed, setResearchFailed] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const breakdown = useMemo(() => {
    const materialCost = toNumber(material);
    const labour = toNumber(hours) * toNumber(rate);
    const cost = materialCost + labour;
    const margin = cost * (profitPct / 100);
    const suggested = Math.round((cost + margin) / 10) * 10;
    return { material: materialCost, labour, margin: Math.round(margin), suggested };
  }, [material, hours, rate, profitPct]);

  const run = () => {
    if (!services.ai || researching) return;
    setResearchFailed(false);
    setResearching(true);
    setProgress({});
    researchPrice(
      {
        photoUri: draft.photo,
        title: draft.title,
        description: draft.description,
        transcript: draft.transcript,
        language,
        craft: profile.craft,
        costFloor: breakdown.material + breakdown.labour,
      },
      (stage, result) => {
        if (mounted.current) setProgress((prev) => ({ ...prev, [stage]: result }));
      }
    )
      .then((research) => {
        if (!mounted.current) return;
        setDraft({ marketResearch: research, aiPrice: research.verdict.recommended, aiPriceReason: research.verdict.reasonLocal });
        if (!customPrice) setCustomPrice(String(research.verdict.recommended));
      })
      .catch(() => mounted.current && setResearchFailed(true))
      .finally(() => mounted.current && setResearching(false));
  };

  // Start once on entry; results are kept on the draft so going back doesn't re-run it.
  useEffect(() => {
    if (!draft.marketResearch) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verdict = progress.verdict;
  const hasCost = breakdown.suggested > 0;
  const finalPrice = customPrice ? toNumber(customPrice) : breakdown.suggested || verdict?.recommended || draft.aiPrice || 0;
  const total = breakdown.material + breakdown.labour + breakdown.margin || 1;
  const stageIndex = STEPS.findIndex(({ stage }) => !progress[stage]);
  const showResearch = services.ai && (researching || researchFailed || Boolean(progress.analysis));

  const next = () => {
    setDraft({
      price: finalPrice,
      stock: Math.max(1, Math.round(toNumber(stock))),
      costBreakdown: { material: breakdown.material, labour: breakdown.labour, margin: breakdown.margin },
    });
    navigate('channels');
  };

  return (
    <Screen
      header={
        <>
          <Header title={t.addProduct} />
          <FlowProgress step={3} />
        </>
      }
      footer={<Button label={`${t.continue} · ${formatINR(finalPrice)}`} disabled={finalPrice <= 0} onPress={next} />}
    >
      <Txt variant="title" className="mt-1">
        {t.priceTitle}
      </Txt>

      {showResearch && (
        <View className="mt-4 rounded-2xl border border-paper-200 bg-white p-4">
          <Txt variant="heading" className="mb-4">
            {t.researchTitle}
          </Txt>

          {STEPS.map(({ stage, label, done, icon }, index) => (
            <ResearchStep
              key={stage}
              index={index}
              active={researching && index === (stageIndex === -1 ? STEPS.length : stageIndex)}
              complete={Boolean(progress[stage])}
              label={t[label]}
              doneLabel={t[done]}
              icon={icon}
            >
              {stage === 'analysis' && progress.analysis && (
                <View className="mt-1.5 gap-0.5">
                  <Txt variant="bodySm" latin className="text-ink-800">
                    {progress.analysis.product}
                  </Txt>
                  <Txt variant="caption" latin>
                    {[progress.analysis.craft, progress.analysis.material, progress.analysis.size].filter(Boolean).join(' · ')}
                  </Txt>
                </View>
              )}

              {stage === 'market' && progress.market && (
                <View className="mt-2 gap-1.5">
                  {progress.market.comparables.map((item) => (
                    <View key={`${item.description}-${item.price}`} className="flex-row items-center gap-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                      <Txt variant="caption" latin className="flex-1 text-ink-700" numberOfLines={1}>
                        {item.description} · {item.channel}
                      </Txt>
                      <Txt variant="caption" latin weight="semibold" className="text-ink-900">
                        {formatINR(item.price)}
                      </Txt>
                    </View>
                  ))}
                  <Txt variant="caption" className="mt-1 text-ink-600">
                    {t.marketBand} {formatINR(progress.market.low)} – {formatINR(progress.market.high)}
                  </Txt>
                </View>
              )}

              {stage === 'verdict' && progress.verdict && (
                <Txt variant="bodySm" className="mt-1.5 text-ink-700">
                  {progress.verdict.reasonLocal || progress.verdict.reason}
                </Txt>
              )}
            </ResearchStep>
          ))}

          {researchFailed && (
            <View className="flex-row items-center gap-3 rounded-xl bg-clay-50 px-3 py-2.5">
              <Txt variant="bodySm" className="flex-1 text-clay-600">
                {t.researchFailed}
              </Txt>
              <Button label={t.retry} size="sm" variant="secondary" icon={RotateCcw} onPress={run} />
            </View>
          )}
        </View>
      )}

      {verdict && (
        <HeroBand rounded={false} style={{ marginTop: 16, borderRadius: 22 }}>
          <View className="p-5">
            <Txt variant="overline" className="text-gold-200">
              {t.aiRecommended}
            </Txt>
            <View className="flex-row items-baseline gap-2 mt-2">
              <Txt variant="display" latin className="text-[46px] leading-[54px] text-gold-300">
                {formatINR(verdict.recommended)}
              </Txt>
              <Txt variant="bodySm" className="text-leaf-100">
                {t.perPiece}
              </Txt>
            </View>
            <Txt variant="bodySm" className="mt-1 text-leaf-100">
              {t.marketBand} {formatINR(verdict.low)} – {formatINR(verdict.high)}
            </Txt>
            {toNumber(customPrice) !== verdict.recommended && (
              <Pressable
                onPress={() => setCustomPrice(String(verdict.recommended))}
                className="self-start mt-3 h-10 px-4 rounded-full bg-gold-400 items-center justify-center active:bg-gold-500"
              >
                <Txt variant="bodySm" weight="semibold" className="text-leaf-900">
                  {t.useThisPrice}
                </Txt>
              </Pressable>
            )}
          </View>
        </HeroBand>
      )}

      <View className="gap-3 mt-5">
        <Field label={t.materialCost} prefix="₹" keyboardType="number-pad" value={material} onChangeText={(v) => setMaterial(digits(v))} placeholder="0" latin />
        <View className="flex-row gap-3">
          <Field className="flex-1" label={t.hoursWorked} keyboardType="decimal-pad" value={hours} onChangeText={setHours} placeholder="0" latin />
          <Field className="flex-1" label={t.hourlyRate} prefix="₹" keyboardType="number-pad" value={rate} onChangeText={(v) => setRate(digits(v))} latin />
        </View>
        <View>
          <Txt variant="caption" weight="semibold" className="mb-1.5 px-1 text-ink-600">
            {t.profit}
          </Txt>
          <View className="flex-row gap-2">
            {PROFIT_OPTIONS.map((pct) => (
              <Pressable
                key={pct}
                onPress={() => setProfitPct(pct)}
                className={twMerge('flex-1 h-12 rounded-[12px] items-center justify-center border', pct === profitPct ? 'bg-gold-400 border-gold-400' : 'bg-white border-paper-300')}
              >
                <Txt variant="body" latin weight="semibold" className={pct === profitPct ? 'text-leaf-900' : 'text-ink-700'}>
                  {pct}%
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {hasCost && (
        <View className="mt-5 rounded-2xl border border-paper-200 bg-white p-4">
          <View className="flex-row items-baseline justify-between">
            <Txt variant="caption" weight="semibold" className="text-ink-600">
              {t.suggestedPrice}
            </Txt>
            <Txt variant="heading" latin className="text-leaf-700">
              {formatINR(breakdown.suggested)}
            </Txt>
          </View>
          <View className="flex-row h-2 rounded-full overflow-hidden mt-3 bg-paper-200">
            <View className="bg-gold-400" style={{ flex: breakdown.material / total }} />
            <View className="bg-leaf-500" style={{ flex: breakdown.labour / total }} />
            <View className="bg-clay-500" style={{ flex: breakdown.margin / total }} />
          </View>
          <View className="mt-3 gap-1.5">
            {[
              { label: t.material, value: breakdown.material, dot: 'bg-gold-400' },
              { label: t.labour, value: breakdown.labour, dot: 'bg-leaf-500' },
              { label: t.margin, value: breakdown.margin, dot: 'bg-clay-500' },
            ].map((row) => (
              <View key={row.label} className="flex-row items-center gap-2">
                <View className={twMerge('w-2 h-2 rounded-full', row.dot)} />
                <Txt variant="bodySm" className="flex-1 text-ink-600">
                  {row.label}
                </Txt>
                <Txt variant="bodySm" latin weight="semibold" className="text-ink-900">
                  {formatINR(row.value)}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="flex-row gap-3 mt-5">
        <Field
          className="flex-[1.4]"
          label={t.yourPrice}
          prefix="₹"
          keyboardType="number-pad"
          value={customPrice}
          placeholder={String(breakdown.suggested || verdict?.recommended || '')}
          onChangeText={(v) => setCustomPrice(digits(v))}
          latin
        />
        <Field className="flex-1" label={t.stockLabel} keyboardType="number-pad" value={stock} onChangeText={(v) => setStock(digits(v))} latin />
      </View>

      <GuideCard guide="price" className="mt-5" />
    </Screen>
  );
}
