import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, RotateCcw, X } from 'lucide-react-native';
import { useApp } from '@/store/AppContext';
import { preparePhoto } from '@/services/image';
import { Button } from '@/components/Button';
import { FlowProgress } from '@/components/FlowProgress';
import { GuideCard } from '@/components/GuideCard';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { colors } from '@/theme/colors';
import { ILLUSTRATION_BG, images } from '@/theme/images';

export function CameraScreen() {
  const { t, draft, setDraft, navigate } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The picker's own file, used if the prepared copy cannot be displayed. */
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);
  const [boxWidth, setBoxWidth] = useState(0);
  /** Bumped once a photo lands, to remount the screen so the preview is laid out fresh. */
  const [refreshKey, setRefreshKey] = useState(0);

  const pick = async (source: 'camera' | 'gallery') => {
    setError(null);
    const permission =
      source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(source === 'camera' ? t.cameraPermission : t.galleryPermission);
      return;
    }

    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9, allowsEditing: true, aspect: [1, 1] };
    const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;

    setBusy(true);
    setPreviewBroken(false);
    setPickedUri(asset.uri);
    // Show the picker's own file straight away so the preview is never blank while we normalise.
    setDraft({ originalPhoto: asset.uri, photo: asset.uri, enhancedWith: null });
    try {
      const uri = await preparePhoto(asset.uri);
      setDraft({ originalPhoto: uri, photo: uri, enhancedWith: null });
    } catch {
      // Fall back to the picker's file if normalising fails; it still works for this session.
      setDraft({ originalPhoto: asset.uri, photo: asset.uri, enhancedWith: null });
    } finally {
      setBusy(false);
      setRefreshKey((n) => n + 1);
    }
  };

  const photo = previewBroken && pickedUri ? pickedUri : draft.originalPhoto;

  return (
    <Screen
      key={refreshKey}
      header={
        <>
          <Header
            title={t.addProduct}
            right={
              <Pressable accessibilityLabel={t.cancel} onPress={() => navigate('home')} hitSlop={8} className="w-11 h-11 rounded-full items-center justify-center active:bg-paper-200">
                <X size={22} color={colors.ink900} />
              </Pressable>
            }
            showBack={false}
          />
          <FlowProgress step={0} />
        </>
      }
      footer={
        photo ? (
          <View className="flex-row gap-3">
            <Button label={t.retake} variant="secondary" icon={RotateCcw} className="flex-1" onPress={() => void pick('camera')} />
            <Button label={t.usePhoto} className="flex-[1.6]" onPress={() => navigate('enhance')} />
          </View>
        ) : (
          <View className="flex-row gap-3">
            <Button label={t.gallery} variant="secondary" icon={ImagePlus} className="flex-1" onPress={() => void pick('gallery')} />
            <Button label={t.takePhoto} icon={Camera} className="flex-[1.6]" onPress={() => void pick('camera')} />
          </View>
        )
      }
    >
      <Txt variant="title" className="mt-1">
        {t.photoTitle}
      </Txt>
      <Txt variant="bodySm" className="mt-1.5">
        {t.photoHint}
      </Txt>

      <Pressable
        disabled={busy}
        onPress={() => void pick('camera')}
        onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}
        // The height is measured, not derived from aspect-ratio: children here are absolutely
        // positioned, and a box with no resolved height renders them invisible.
        style={{ height: boxWidth || undefined, aspectRatio: boxWidth ? undefined : 1, backgroundColor: photo ? undefined : ILLUSTRATION_BG }}
        className={`mt-5 w-full rounded-[20px] overflow-hidden ${photo ? 'bg-paper-200' : 'border border-gold-200'}`}
      >
        {photo ? (
          <Image
            key={photo}
            source={{ uri: photo }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => {
              // A prepared file that cannot be read: fall back to the picker's file.
              if (!previewBroken && pickedUri) {
                setPreviewBroken(true);
                setDraft({ originalPhoto: pickedUri, photo: pickedUri });
              }
            }}
          />
        ) : (
          <>
            <Image source={images.cameraTip} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            <View className="absolute bottom-4 left-0 right-0 items-center">
              <View className="flex-row items-center gap-2 rounded-full bg-leaf-500 px-4 py-2.5">
                <Camera size={18} color={colors.gold300} strokeWidth={2} />
                <Txt variant="bodySm" weight="semibold" className="text-white">
                  {t.takePhoto}
                </Txt>
              </View>
            </View>
          </>
        )}

        {/* Overlay, so a slow render never replaces a photo that is already there. */}
        {busy && (
          <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-black/25">
            <ActivityIndicator color={colors.paper100} size="large" />
          </View>
        )}
      </Pressable>

      {error && (
        <Pressable onPress={() => void Linking.openSettings()} className="mt-4 rounded-2xl bg-clay-50 px-4 py-3">
          <Txt variant="bodySm" className="text-clay-600">
            {error}
          </Txt>
        </Pressable>
      )}

      <GuideCard guide="camera" className="mt-5" />
    </Screen>
  );
}
