/**
 * Illustrations (Pattachitra-inspired, green + gold). Optimised copies live in
 * assets/images/app; the full-size originals stay in assets/images.
 */
import onboardingHeroImg from '../../assets/images/app/onboarding-hero.jpg';
import onboardingProfileImg from '../../assets/images/app/onboarding-profile.jpg';
import tutorial1PhotoImg from '../../assets/images/app/tutorial-1-photo.jpg';
import tutorial2StudioImg from '../../assets/images/app/tutorial-2-studio.jpg';
import tutorial3VoiceImg from '../../assets/images/app/tutorial-3-voice.jpg';
import tutorial4PriceImg from '../../assets/images/app/tutorial-4-price.jpg';
import tutorial5SellImg from '../../assets/images/app/tutorial-5-sell.jpg';
import tutorialDoneImg from '../../assets/images/app/tutorial-done.jpg';
import emptyProductsImg from '../../assets/images/app/empty-products.jpg';
import emptyOrdersImg from '../../assets/images/app/empty-orders.jpg';
import cameraTipImg from '../../assets/images/app/camera-tip.jpg';
import successCelebrationImg from '../../assets/images/app/success-celebration.jpg';
import artisanMaleImg from '../../assets/images/app/artisan-male.png';
import artisanFemaleImg from '../../assets/images/app/artisan-female.png';
// Demo mode only: stands in for the studio result when the image model is off.
import demoStudioImg from '../../assets/images/demo/studio-result.jpg';

export const images = {
  onboardingHero: onboardingHeroImg,
  onboardingProfile: onboardingProfileImg,
  tutorial: [
    tutorial1PhotoImg,
    tutorial2StudioImg,
    tutorial3VoiceImg,
    tutorial4PriceImg,
    tutorial5SellImg,
  ],
  tutorialDone: tutorialDoneImg,
  emptyProducts: emptyProductsImg,
  emptyOrders: emptyOrdersImg,
  cameraTip: cameraTipImg,
  successCelebration: successCelebrationImg,
  artisanMale: artisanMaleImg,
  artisanFemale: artisanFemaleImg,
  demoStudio: demoStudioImg,
} as const;

/** Every bundled illustration, for preloading at startup so screens never show a blank frame. */
export const allImages = [
  images.onboardingHero,
  images.onboardingProfile,
  ...images.tutorial,
  images.tutorialDone,
  images.emptyProducts,
  images.emptyOrders,
  images.cameraTip,
  images.successCelebration,
  images.artisanMale,
  images.artisanFemale,
  images.demoStudio,
];

/** Background colour baked into the illustrations, so frames around them blend in. */
export const ILLUSTRATION_BG = '#F2EFE0';
/** Green used in the success illustration. */
export const CELEBRATION_BG = '#134E32';
