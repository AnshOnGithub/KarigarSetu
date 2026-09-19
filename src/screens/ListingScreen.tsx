import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useApp } from '@/store/AppContext';
import { generateListing, localListing, type GeneratedListing } from '@/services/listing';
import { speak, stopSpeaking } from '@/services/speech';
import { Button } from '@/components/Button';
import { FlowProgress } from '@/components/FlowProgress';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Badge, Field } from '@/components/ui';
import { colors } from '@/theme/colors';

/** Transcript the current draft listing was generated from, so going back and forth doesn't regenerate. */
let generatedFor: string | null = null;

export function ListingScreen() {
  const { t, language, profile, draft, setDraft, navigate } = useApp();
  const needsGeneration = generatedFor !== draft.transcript || !draft.title;
  const [loading, setLoading] = useState(needsGeneration);
  const [source, setSource] = useState<GeneratedListing['source'] | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!needsGeneration) return;
    let cancelled = false;
    const apply = (listing: GeneratedListing) => {
      if (cancelled) return;
      generatedFor = draft.transcript;
      setSource(listing.source);
      setDraft({
        title: listing.title,
        description: listing.description,
        titleHi: listing.titleHi,
        descriptionHi: listing.descriptionHi,
        localDescription: listing.localDescription,
        highlights: listing.highlights,
        category: listing.category,
        aiPrice: listing.suggestedPrice,
        aiPriceReason: listing.priceReason,
      });
      setLoading(false);
    };
    generateListing({ photoUri: draft.photo, transcript: draft.transcript, language, craft: profile.craft })
      .then(apply)
      .catch(() => apply(localListing(draft.transcript)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const listen = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const localText = draft.localDescription || draft.description;
    void speak(`${draft.title}. ${localText}`, language, {
      fallbackText: `${draft.title}. ${draft.description}`,
      onDone: () => setSpeaking(false),
    });
  };

  return (
    <Screen
      header={
        <>
          <Header title={t.addProduct} />
          <FlowProgress step={2} />
        </>
      }
      footer={loading ? null : <Button label={t.looksGood} disabled={!draft.title.trim()} onPress={() => navigate('price')} />}
    >
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          {draft.photo && <Image source={{ uri: draft.photo }} className="w-32 h-32 rounded-2xl" />}
          <ActivityIndicator color={colors.leaf500} className="mt-8" />
          <Txt variant="title" className="mt-4 text-center">
            {t.writingListing}
          </Txt>
          <Txt variant="bodySm" className="mt-1.5 text-center max-w-[280px]">
            {t.writingListingHint}
          </Txt>
        </View>
      ) : (
        <>
          <View className="flex-row items-end justify-between mt-1">
            <Txt variant="title">{t.listingTitle}</Txt>
            <Pressable onPress={listen} className="h-10 px-3.5 rounded-full bg-gold-50 border border-gold-200 flex-row items-center gap-2 active:bg-gold-100">
              {speaking ? <VolumeX size={16} color={colors.gold700} /> : <Volume2 size={16} color={colors.gold700} />}
              <Txt variant="bodySm" weight="semibold" className="text-gold-700">
                {speaking ? t.stop : t.listen}
              </Txt>
            </Pressable>
          </View>
          <Txt variant="caption" className="mt-1">
            {t.listingEditHint}
          </Txt>

          {draft.photo && <Image source={{ uri: draft.photo }} className="w-full h-56 rounded-[20px] mt-4 bg-paper-200" resizeMode="cover" />}

          <View className="gap-4 mt-5">
            <Field label={t.titleLabel} latin value={draft.title} onChangeText={(title) => setDraft({ title })} />
            <Field label={t.descriptionLabel} latin multiline value={draft.description} onChangeText={(description) => setDraft({ description })} />
            <Field label={t.titleHiLabel} value={draft.titleHi} onChangeText={(titleHi) => setDraft({ titleHi })} />
            <Field label={t.descriptionHiLabel} multiline value={draft.descriptionHi} onChangeText={(descriptionHi) => setDraft({ descriptionHi })} />
          </View>

          {draft.highlights.length > 0 && (
            <View className="mt-5">
              <Txt variant="caption" weight="semibold" className="mb-2 px-1 text-ink-600">
                {t.highlights}
              </Txt>
              <View className="flex-row flex-wrap gap-2">
                {draft.highlights.map((h) => (
                  <Badge key={h} label={h} tone="gold" latin className="px-3 py-1.5" />
                ))}
              </View>
            </View>
          )}

          {source === 'local' && (
            <View className="mt-5 rounded-2xl bg-saffron-50 px-4 py-3">
              <Txt variant="bodySm" className="text-ink-700">
                {t.writtenFromWords}
              </Txt>
            </View>
          )}

          <GuideCard guide="listing" className="mt-5" />
        </>
      )}
    </Screen>
  );
}
