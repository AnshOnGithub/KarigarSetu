import type { Language } from '@/types';

const en = {
  // Navigation
  home: 'Home',
  products: 'Products',
  orders: 'Orders',
  settings: 'Settings',

  // Common actions
  continue: 'Continue',
  back: 'Back',
  skip: 'Skip',
  done: 'Done',
  cancel: 'Cancel',
  save: 'Save',
  retry: 'Try again',
  listen: 'Listen',
  stop: 'Stop',
  next: 'Next',

  // Onboarding
  tagline: 'Your craft, on every marketplace.',
  chooseLanguage: 'Choose your language',
  chooseLanguageHint: 'The app will speak and show text in this language.',
  language: 'Language',
  aboutYou: 'Tell us about you',
  aboutYouHint: 'Buyers will see your name with your products.',
  yourName: 'Your name',
  yourNamePlaceholder: 'e.g. Ramesh Behera',
  yourGender: 'You are',
  male: 'Male artisan',
  female: 'Female artisan',
  yourCraft: 'Your craft',
  yourCraftPlaceholder: 'e.g. Pattachitra painting',
  howItWorks: 'How it works',
  startSelling: 'Start selling',
  stepOf: 'Step {n} of {total}',

  // Home
  greeting: 'Namaste',
  addProduct: 'Add a product',
  addProductHint: 'Photo, voice, price — ready in 3 minutes',
  liveProducts: 'Live',
  newOrders: 'New orders',
  earnings: 'Earnings',
  recentProducts: 'Recent products',
  seeAll: 'See all',
  noProductsYet: 'No products yet',
  noProductsHint: 'Add your first product. We will guide you at every step.',
  offline: 'You are offline. Changes are saved on this phone.',

  // Flow step names
  stepPhoto: 'Photo',
  stepVoice: 'Describe',
  stepListing: 'Listing',
  stepPrice: 'Price',
  stepPublish: 'Publish',

  // Camera
  photoTitle: 'Photograph your product',
  photoHint: 'Use daylight and a plain background. Keep the whole product in frame.',
  takePhoto: 'Take photo',
  gallery: 'Gallery',
  retake: 'Retake',
  usePhoto: 'Use this photo',
  cameraPermission: 'Allow camera access in your phone settings to take a photo.',
  galleryPermission: 'Allow photo access in your phone settings to choose a picture.',

  // Enhance
  enhancing: 'Preparing your photo',
  enhancingHint: 'Straightening, framing and cleaning up the background.',
  photoReady: 'Your photo is ready',
  original: 'Original',
  enhanced: 'Enhanced',
  bgRemoved: 'Background cleaned',
  framed: 'Framed and resized for marketplaces',
  enhanceFailed: 'We could not improve this photo. You can still use the original.',
  useOriginal: 'Use original',

  // Photo studio
  studioTitle: 'Photo studio',
  studioHint: 'We remove the background and fix the light. Pick how buyers should see your product.',
  styleWhite: 'Plain white',
  styleWhiteDesc: 'Best for ONDC, GeM, Amazon',
  styleHome: 'In a home',
  styleHomeDesc: 'Shown in a nice room',
  styleFlatlay: 'Top view',
  styleFlatlayDesc: 'Laid flat. Good for sarees, stoles',
  styleCloseup: 'Close-up',
  styleCloseupDesc: 'Shows weave and fine detail',
  styleFestive: 'Festive gift',
  styleFestiveDesc: 'Warm festival look',
  styleCustom: 'My own idea',
  recommended: 'Best',
  advanced: 'Advanced options',
  advancedHint: 'Write your own studio idea or edit the photo',
  customPromptTitle: 'Describe your own studio',
  customPromptHint: 'Write or say how the photo should look. The product will not be changed.',
  customPromptPlaceholder: 'e.g. on a dark wooden table with soft evening light',
  createPhoto: 'Create photo',
  editPhoto: 'Edit photo',
  rotate: 'Rotate',
  flip: 'Flip',
  crop: 'Crop',
  cropFree: 'Original',
  cropSquare: 'Square',
  cropPortrait: 'Tall 4:5',
  cropWide: 'Wide 4:3',
  brightness: 'Brightness',
  contrast: 'Contrast',
  saturation: 'Colour',
  warmth: 'Warmth',
  resetEdits: 'Reset edits',
  savingPhoto: 'Saving photo…',
  creatingStudio: 'Creating studio photo',
  creatingStudioHint: 'Removing the background and adding studio light. About 15–30 seconds.',
  holdToCompare: 'Press and hold the photo to see the original',
  studioOff: 'Studio is off. Add EXPO_PUBLIC_GEMINI_API_KEY to .env to create studio photos.',
  studioFailed: 'The studio could not finish this photo. Try again or use the original.',
  regenerate: 'Try again',
  studioNeedsBilling: 'Studio photos need billing turned on for your Gemini API key (the free tier has no image quota). Use the original photo for now.',

  // Voice
  voiceTitle: 'Describe your product',
  voiceHint: 'Speak naturally: what it is, what it is made of, and how long it took.',
  tapToSpeak: 'Tap to speak',
  tapToStop: 'Tap when finished',
  listening: 'Listening',
  transcribing: 'Understanding your words',
  youSaid: 'Your description',
  typeInstead: 'Or type it here',
  typePlaceholder: 'Handmade terracotta pot painted with natural colours…',
  recordAgain: 'Record again',
  playRecording: 'Play',
  micPermission: 'Allow microphone access in your phone settings to record.',
  needDescription: 'Speak or type a short description to continue.',

  // Listing
  listingTitle: 'Your listing',
  writingListing: 'Writing your listing',
  writingListingHint: 'Turning your photo and words into a buyer-ready listing. This can take up to a minute.',
  titleLabel: 'Title',
  descriptionLabel: 'Description',
  titleHiLabel: 'Title in Hindi',
  descriptionHiLabel: 'Description in Hindi',
  syncPending: 'Sending to marketplaces…',
  syncFailed: 'Not sent yet. Will retry when online.',
  syncDone: 'Sent to marketplaces',
  highlights: 'Highlights',
  listingEditHint: 'Tap any text to edit it.',
  looksGood: 'Looks good',
  writtenFromWords: 'Written from your words. Connect AI in settings for automatic writing.',

  // Price
  priceTitle: 'Set your price',
  materialCost: 'Material cost',
  hoursWorked: 'Hours of work',
  hourlyRate: 'Your rate per hour',
  profit: 'Profit',
  researchTitle: 'AI is checking the market',
  researchStep1: 'Looking at your photo',
  researchStep2: 'Comparing market prices',
  researchStep3: 'Deciding your price',
  researchStep1Done: 'Product identified',
  researchStep2Done: 'Similar products found',
  researchStep3Done: 'Price ready',
  researchFailed: 'Could not check the market. You can still set your own price.',
  marketBand: 'Similar products sell for',
  aiRecommended: 'AI suggested price',
  useThisPrice: 'Use this price',
  yourCost: 'Your cost',
  suggestedPrice: 'Suggested price',
  perPiece: 'per piece',
  marketNote: 'Market insight',
  stockLabel: 'Pieces available',
  material: 'Material',
  labour: 'Labour',
  margin: 'Profit',
  yourPrice: 'Your price',

  // Channels
  channelsTitle: 'Where to sell',
  channelsHint: 'You can choose more than one.',
  ondcDesc: 'Reach buyers on Paytm, Magicpin and other ONDC apps',
  gemDesc: 'Government bulk orders through GeM',
  b2bDesc: 'Shops and wholesalers across India',
  publish: 'Publish',
  saveDraft: 'Save as draft',
  publishing: 'Publishing',

  // Success
  liveTitle: 'Your product is live',
  liveHint: 'Buyers can now find it on {channels}.',
  viewProducts: 'View my products',
  addAnother: 'Add another',

  // Products
  all: 'All',
  published: 'Live',
  draft: 'Draft',
  inStock: '{n} in stock',
  productDetails: 'Product details',
  price: 'Price',
  stock: 'Stock',
  status: 'Status',
  channels: 'Channels',
  makeLive: 'Publish now',
  moveToDraft: 'Move to draft',
  deleteProduct: 'Delete product',
  deleteConfirm: 'Delete this product? This cannot be undone.',
  delete: 'Delete',

  // Orders
  noOrders: 'No orders yet',
  noOrdersHint: 'When a buyer orders from ONDC, GeM or B2B, it will appear here.',
  orderNew: 'New',
  orderAccepted: 'Accepted',
  orderPacked: 'Packed',
  orderShipped: 'Shipped',
  orderDelivered: 'Delivered',
  acceptOrder: 'Accept',
  markPacked: 'Mark packed',
  markShipped: 'Mark shipped',
  markDelivered: 'Mark delivered',
  qty: 'Qty',

  // Settings
  profile: 'Profile',
  preferences: 'Preferences',
  voiceGuide: 'Voice guide',
  voiceGuideHint: 'Speak instructions on every screen',
  tutorial: 'Tutorial',
  tutorialHint: 'Learn how to use KarigarSetu',
  services: 'Connected services',
  connected: 'Connected',
  notConnected: 'Demo mode',
  aiListing: 'AI listing writer',
  speechToText: 'Speech to text',
  photoCleanup: 'Photo studio',
  data: 'Data',
  loadSample: 'Sample data',
  loadSampleHint: 'Example products and orders, and an example studio photo instead of the paid one',
  resetApp: 'Reset app',
  resetAppHint: 'Clears everything and restarts onboarding',
  resetConfirm: 'This removes all products, orders and settings from this phone.',
  version: 'Version',
  selectLanguage: 'Select language',
  tutorialDone: 'You are ready',
  tryNow: 'Add my first product',
};

export type StringKey = keyof typeof en;
export type Strings = Record<StringKey, string>;

const hi: Partial<Strings> = {
  home: 'होम', products: 'प्रोडक्ट', orders: 'ऑर्डर', settings: 'सेटिंग्स',
  continue: 'आगे बढ़ें', back: 'पीछे', skip: 'छोड़ें', done: 'हो गया', cancel: 'रद्द करें', save: 'सेव करें', retry: 'फिर कोशिश करें', listen: 'सुनें', stop: 'रोकें', next: 'आगे',
  tagline: 'आपकी कला, हर बाज़ार तक।', chooseLanguage: 'अपनी भाषा चुनें', chooseLanguageHint: 'ऐप इसी भाषा में बोलेगा और लिखेगा।', language: 'भाषा',
  aboutYou: 'अपने बारे में बताइए', aboutYouHint: 'खरीदार आपके प्रोडक्ट के साथ आपका नाम देखेंगे।', yourName: 'आपका नाम', yourNamePlaceholder: 'जैसे रमेश बेहेरा', yourGender: 'आप हैं', male: 'पुरुष कारीगर', female: 'महिला कारीगर', yourCraft: 'आपकी कला', yourCraftPlaceholder: 'जैसे पट्टचित्र पेंटिंग',
  howItWorks: 'यह कैसे काम करता है', startSelling: 'बेचना शुरू करें', stepOf: 'चरण {n} / {total}',
  greeting: 'नमस्ते', addProduct: 'प्रोडक्ट जोड़ें', addProductHint: 'फोटो, आवाज़, कीमत — 3 मिनट में तैयार', liveProducts: 'लाइव', newOrders: 'नए ऑर्डर', earnings: 'कमाई', recentProducts: 'हाल के प्रोडक्ट', seeAll: 'सभी देखें', noProductsYet: 'अभी कोई प्रोडक्ट नहीं', noProductsHint: 'अपना पहला प्रोडक्ट जोड़ें। हर कदम पर हम मदद करेंगे।', offline: 'इंटरनेट नहीं है। बदलाव फ़ोन में सेव हैं।',
  stepPhoto: 'फोटो', stepVoice: 'विवरण', stepListing: 'लिस्टिंग', stepPrice: 'कीमत', stepPublish: 'प्रकाशित',
  studioTitle: 'फोटो स्टूडियो', studioHint: 'हम बैकग्राउंड हटाकर रोशनी ठीक करते हैं। चुनें कि खरीदार आपका प्रोडक्ट कैसे देखें।', styleWhite: 'सादा सफ़ेद', styleWhiteDesc: 'ONDC, GeM, Amazon के लिए सबसे अच्छा', styleHome: 'घर में', styleHomeDesc: 'सुंदर कमरे में दिखाएं', styleFlatlay: 'ऊपर से', styleFlatlayDesc: 'फैलाकर। साड़ी, दुपट्टे के लिए', styleCloseup: 'पास से', styleCloseupDesc: 'बुनाई और बारीकी दिखाएं', styleFestive: 'त्योहार / उपहार', styleFestiveDesc: 'त्योहार जैसा गर्म रूप', styleCustom: 'मेरा अपना आइडिया', recommended: 'सबसे अच्छा', advanced: 'एडवांस विकल्प', advancedHint: 'अपना स्टूडियो आइडिया लिखें या फोटो एडिट करें', customPromptTitle: 'अपना स्टूडियो बताइए', customPromptHint: 'लिखें कि फोटो कैसी दिखे। प्रोडक्ट नहीं बदलेगा।', customPromptPlaceholder: 'जैसे गहरे लकड़ी की मेज़ पर, शाम की हल्की रोशनी', createPhoto: 'फोटो बनाएं', editPhoto: 'फोटो एडिट करें', rotate: 'घुमाएं', flip: 'पलटें', crop: 'काटें', cropFree: 'असली', cropSquare: 'चौकोर', cropPortrait: 'लंबा 4:5', cropWide: 'चौड़ा 4:3', brightness: 'रोशनी', contrast: 'कंट्रास्ट', saturation: 'रंग', warmth: 'गर्माहट', resetEdits: 'एडिट हटाएं', savingPhoto: 'फोटो सेव हो रही है…', creatingStudio: 'स्टूडियो फोटो बन रही है', creatingStudioHint: 'बैकग्राउंड हटाकर स्टूडियो रोशनी दी जा रही है। लगभग 15–30 सेकंड।', holdToCompare: 'असली फोटो देखने के लिए फोटो को दबाकर रखें', studioFailed: 'स्टूडियो यह फोटो पूरी नहीं कर पाया। फिर कोशिश करें या असली फोटो रखें।', regenerate: 'फिर से बनाएं', photoCleanup: 'फोटो स्टूडियो',
  photoTitle: 'अपने प्रोडक्ट की फोटो लें', photoHint: 'दिन की रोशनी और सादा बैकग्राउंड रखें। पूरा प्रोडक्ट फ्रेम में हो।', takePhoto: 'फोटो लें', gallery: 'गैलरी', retake: 'फिर से लें', usePhoto: 'यह फोटो इस्तेमाल करें', cameraPermission: 'फोटो लेने के लिए फ़ोन सेटिंग्स में कैमरा की अनुमति दें।', galleryPermission: 'फोटो चुनने के लिए फ़ोन सेटिंग्स में अनुमति दें।',
  enhancing: 'फोटो तैयार हो रही है', enhancingHint: 'फ्रेम और बैकग्राउंड साफ़ किया जा रहा है।', photoReady: 'आपकी फोटो तैयार है', original: 'असली', enhanced: 'बेहतर', bgRemoved: 'बैकग्राउंड साफ़ किया', framed: 'मार्केटप्लेस के लिए फ्रेम किया', enhanceFailed: 'फोटो बेहतर नहीं हो पाई। आप असली फोटो इस्तेमाल कर सकते हैं।', useOriginal: 'असली फोटो रखें',
  voiceTitle: 'अपने प्रोडक्ट के बारे में बताइए', voiceHint: 'आराम से बोलिए: यह क्या है, किससे बना है, और बनाने में कितना समय लगा।', tapToSpeak: 'बोलने के लिए दबाएं', tapToStop: 'पूरा होने पर दबाएं', listening: 'सुन रहे हैं', transcribing: 'आपकी बात समझ रहे हैं', youSaid: 'आपका विवरण', typeInstead: 'या यहां लिखें', recordAgain: 'फिर से बोलें', playRecording: 'सुनें', micPermission: 'रिकॉर्ड करने के लिए फ़ोन सेटिंग्स में माइक की अनुमति दें।', needDescription: 'आगे बढ़ने के लिए छोटा विवरण बोलें या लिखें।',
  listingTitle: 'आपकी लिस्टिंग', titleHiLabel: 'हिंदी में शीर्षक', descriptionHiLabel: 'हिंदी में विवरण', syncPending: 'मार्केटप्लेस पर भेजा जा रहा है…', syncFailed: 'अभी नहीं भेजा गया। इंटरनेट आने पर फिर भेजेंगे।', syncDone: 'मार्केटप्लेस पर भेज दिया', writingListing: 'लिस्टिंग लिखी जा रही है', writingListingHint: 'आपकी फोटो और बातों से खरीदार के लिए लिस्टिंग बन रही है।', titleLabel: 'शीर्षक', descriptionLabel: 'विवरण', highlights: 'खास बातें', listingEditHint: 'बदलने के लिए किसी भी लिखावट पर दबाएं।', looksGood: 'ठीक है', writtenFromWords: 'आपके शब्दों से लिखा गया। अपने-आप लिखने के लिए सेटिंग्स में AI जोड़ें।',
  priceTitle: 'कीमत तय करें', researchTitle: 'AI बाज़ार देख रहा है', researchStep1: 'आपकी फोटो देख रहे हैं', researchStep2: 'बाज़ार की कीमतें मिला रहे हैं', researchStep3: 'आपकी कीमत तय कर रहे हैं', researchStep1Done: 'प्रोडक्ट पहचान लिया', researchStep2Done: 'मिलते-जुलते प्रोडक्ट मिले', researchStep3Done: 'कीमत तैयार है', researchFailed: 'बाज़ार नहीं देख पाए। आप अपनी कीमत खुद रख सकते हैं।', marketBand: 'ऐसे प्रोडक्ट इतने में बिकते हैं', aiRecommended: 'AI की सुझाई कीमत', useThisPrice: 'यही कीमत रखें', yourCost: 'आपका खर्च', materialCost: 'सामग्री का खर्च', hoursWorked: 'काम के घंटे', hourlyRate: 'प्रति घंटा मज़दूरी', profit: 'मुनाफा', suggestedPrice: 'सुझाई गई कीमत', perPiece: 'प्रति पीस', marketNote: 'बाज़ार की जानकारी', stockLabel: 'कितने पीस उपलब्ध हैं', material: 'सामग्री', labour: 'मज़दूरी', margin: 'मुनाफा', yourPrice: 'आपकी कीमत',
  channelsTitle: 'कहां बेचना है', channelsHint: 'आप एक से ज़्यादा चुन सकते हैं।', ondcDesc: 'Paytm, Magicpin और दूसरे ONDC ऐप्स के खरीदार', gemDesc: 'GeM से सरकारी थोक ऑर्डर', b2bDesc: 'पूरे भारत की दुकानें और थोक व्यापारी', publish: 'प्रकाशित करें', saveDraft: 'ड्राफ्ट सेव करें', publishing: 'प्रकाशित हो रहा है',
  liveTitle: 'आपका प्रोडक्ट लाइव है', liveHint: 'अब खरीदार इसे {channels} पर देख सकते हैं।', viewProducts: 'मेरे प्रोडक्ट देखें', addAnother: 'एक और जोड़ें',
  all: 'सभी', published: 'लाइव', draft: 'ड्राफ्ट', inStock: '{n} स्टॉक में', productDetails: 'प्रोडक्ट जानकारी', price: 'कीमत', stock: 'स्टॉक', status: 'स्थिति', channels: 'चैनल', makeLive: 'अभी प्रकाशित करें', moveToDraft: 'ड्राफ्ट में डालें', deleteProduct: 'प्रोडक्ट हटाएं', deleteConfirm: 'यह प्रोडक्ट हटाएं? इसे वापस नहीं लाया जा सकता।', delete: 'हटाएं',
  noOrders: 'अभी कोई ऑर्डर नहीं', noOrdersHint: 'ONDC, GeM या B2B से ऑर्डर आने पर यहां दिखेगा।', orderNew: 'नया', orderAccepted: 'स्वीकार', orderPacked: 'पैक', orderShipped: 'भेजा गया', orderDelivered: 'पहुंच गया', acceptOrder: 'स्वीकार करें', markPacked: 'पैक हो गया', markShipped: 'भेज दिया', markDelivered: 'पहुंच गया', qty: 'मात्रा',
  profile: 'प्रोफ़ाइल', preferences: 'पसंद', voiceGuide: 'आवाज़ गाइड', voiceGuideHint: 'हर स्क्रीन पर निर्देश बोलकर बताए', tutorial: 'ट्यूटोरियल', tutorialHint: 'KarigarSetu इस्तेमाल करना सीखें', services: 'जुड़ी सेवाएं', connected: 'जुड़ा है', notConnected: 'डेमो मोड', aiListing: 'AI लिस्टिंग लेखक', speechToText: 'आवाज़ से लिखावट', data: 'डेटा', loadSample: 'सैंपल डेटा जोड़ें', loadSampleHint: 'उदाहरण प्रोडक्ट, ऑर्डर और स्टूडियो फोटो दिखाता है', resetApp: 'ऐप रीसेट करें', resetAppHint: 'सब कुछ मिटाकर शुरुआत से', resetConfirm: 'इससे इस फ़ोन से सभी प्रोडक्ट, ऑर्डर और सेटिंग्स हट जाएंगी।', version: 'वर्ज़न', selectLanguage: 'भाषा चुनें', tutorialDone: 'आप तैयार हैं', tryNow: 'पहला प्रोडक्ट जोड़ें',
};

const od: Partial<Strings> = {
  home: 'ହୋମ', products: 'ଉତ୍ପାଦ', orders: 'ଅର୍ଡର', settings: 'ସେଟିଂସ',
  continue: 'ଆଗକୁ', back: 'ପଛକୁ', skip: 'ଛାଡନ୍ତୁ', done: 'ହୋଇଗଲା', cancel: 'ବାତିଲ', save: 'ସେଭ କରନ୍ତୁ', retry: 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ', listen: 'ଶୁଣନ୍ତୁ', stop: 'ବନ୍ଦ କରନ୍ତୁ', next: 'ପରବର୍ତ୍ତୀ',
  tagline: 'ଆପଣଙ୍କ କଳା, ପ୍ରତ୍ୟେକ ବଜାରରେ।', chooseLanguage: 'ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ', chooseLanguageHint: 'ଆପ୍ ଏହି ଭାଷାରେ କହିବ ଓ ଲେଖିବ।', language: 'ଭାଷା',
  aboutYou: 'ନିଜ ବିଷୟରେ କୁହନ୍ତୁ', aboutYouHint: 'କ୍ରେତା ଆପଣଙ୍କ ଉତ୍ପାଦ ସହ ଆପଣଙ୍କ ନାମ ଦେଖିବେ।', yourName: 'ଆପଣଙ୍କ ନାମ', yourNamePlaceholder: 'ଯେପରି ରମେଶ ବେହେରା', yourGender: 'ଆପଣ', male: 'ପୁରୁଷ କାରିଗର', female: 'ମହିଳା କାରିଗର', yourCraft: 'ଆପଣଙ୍କ କଳା', yourCraftPlaceholder: 'ଯେପରି ପଟ୍ଟଚିତ୍ର',
  howItWorks: 'ଏହା କିପରି କାମ କରେ', startSelling: 'ବିକ୍ରି ଆରମ୍ଭ କରନ୍ତୁ', stepOf: 'ପର୍ଯ୍ୟାୟ {n} / {total}',
  greeting: 'ନମସ୍କାର', addProduct: 'ଉତ୍ପାଦ ଯୋଗ କରନ୍ତୁ', addProductHint: 'ଫଟୋ, ସ୍ୱର, ଦାମ — 3 ମିନିଟରେ ପ୍ରସ୍ତୁତ', liveProducts: 'ଲାଇଭ', newOrders: 'ନୂଆ ଅର୍ଡର', earnings: 'ରୋଜଗାର', recentProducts: 'ସାମ୍ପ୍ରତିକ ଉତ୍ପାଦ', seeAll: 'ସବୁ ଦେଖନ୍ତୁ', noProductsYet: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଉତ୍ପାଦ ନାହିଁ', noProductsHint: 'ଆପଣଙ୍କ ପ୍ରଥମ ଉତ୍ପାଦ ଯୋଗ କରନ୍ତୁ। ପ୍ରତି ପଦକ୍ଷେପରେ ଆମେ ସାହାଯ୍ୟ କରିବୁ।', offline: 'ଇଣ୍ଟରନେଟ ନାହିଁ। ପରିବର୍ତ୍ତନ ଫୋନରେ ସେଭ ଅଛି।',
  stepPhoto: 'ଫଟୋ', stepVoice: 'ବର୍ଣ୍ଣନା', stepListing: 'ଲିଷ୍ଟିଂ', stepPrice: 'ଦାମ', stepPublish: 'ପ୍ରକାଶ',
  studioTitle: 'ଫଟୋ ଷ୍ଟୁଡିଓ', studioHint: 'ଆମେ ପୃଷ୍ଠଭୂମି ହଟାଇ ଆଲୋକ ଠିକ କରୁ। କ୍ରେତା ଆପଣଙ୍କ ଉତ୍ପାଦ କିପରି ଦେଖିବେ ବାଛନ୍ତୁ।', styleWhite: 'ସାଦା ଧଳା', styleWhiteDesc: 'ONDC, GeM, Amazon ପାଇଁ ସର୍ବୋତ୍ତମ', styleHome: 'ଘରେ', styleHomeDesc: 'ସୁନ୍ଦର ଘରେ ଦେଖାନ୍ତୁ', styleFlatlay: 'ଉପରୁ', styleFlatlayDesc: 'ବିଛାଇ। ଶାଢ଼ୀ, ଓଢ଼ଣୀ ପାଇଁ', styleCloseup: 'ପାଖରୁ', styleCloseupDesc: 'ବୁଣା ଓ ସୂକ୍ଷ୍ମ କାମ ଦେଖାନ୍ତୁ', styleFestive: 'ପର୍ବ / ଉପହାର', styleFestiveDesc: 'ପର୍ବର ଉଷ୍ମ ରୂପ', styleCustom: 'ମୋ ନିଜ ଆଇଡିଆ', recommended: 'ସର୍ବୋତ୍ତମ', advanced: 'ଉନ୍ନତ ବିକଳ୍ପ', advancedHint: 'ନିଜ ଷ୍ଟୁଡିଓ ଆଇଡିଆ ଲେଖନ୍ତୁ ବା ଫଟୋ ଏଡିଟ କରନ୍ତୁ', customPromptTitle: 'ନିଜ ଷ୍ଟୁଡିଓ ବର୍ଣ୍ଣନା କରନ୍ତୁ', customPromptHint: 'ଫଟୋ କିପରି ଦେଖାଯିବ ଲେଖନ୍ତୁ। ଉତ୍ପାଦ ବଦଳିବ ନାହିଁ।', customPromptPlaceholder: 'ଯେପରି ଗାଢ଼ କାଠ ଟେବୁଲ ଉପରେ, ସନ୍ଧ୍ୟାର ନରମ ଆଲୋକ', createPhoto: 'ଫଟୋ ତିଆରି କରନ୍ତୁ', editPhoto: 'ଫଟୋ ଏଡିଟ', rotate: 'ଘୁରାନ୍ତୁ', flip: 'ଓଲଟାନ୍ତୁ', crop: 'କାଟନ୍ତୁ', cropFree: 'ମୂଳ', cropSquare: 'ଚାରିକୋଣିଆ', cropPortrait: 'ଲମ୍ବା 4:5', cropWide: 'ଚଉଡା 4:3', brightness: 'ଆଲୋକ', contrast: 'କଣ୍ଟ୍ରାଷ୍ଟ', saturation: 'ରଙ୍ଗ', warmth: 'ଉଷ୍ମତା', resetEdits: 'ଏଡିଟ ହଟାନ୍ତୁ', savingPhoto: 'ଫଟୋ ସେଭ ହେଉଛି…', creatingStudio: 'ଷ୍ଟୁଡିଓ ଫଟୋ ତିଆରି ହେଉଛି', creatingStudioHint: 'ପୃଷ୍ଠଭୂମି ହଟାଇ ଷ୍ଟୁଡିଓ ଆଲୋକ ଦିଆଯାଉଛି। ପ୍ରାୟ 15–30 ସେକେଣ୍ଡ।', holdToCompare: 'ମୂଳ ଫଟୋ ଦେଖିବା ପାଇଁ ଫଟୋକୁ ଦବାଇ ରଖନ୍ତୁ', studioFailed: 'ଷ୍ଟୁଡିଓ ଏହି ଫଟୋ ସାରିପାରିଲା ନାହିଁ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ ବା ମୂଳ ଫଟୋ ରଖନ୍ତୁ।', regenerate: 'ପୁଣି ତିଆରି କରନ୍ତୁ', photoCleanup: 'ଫଟୋ ଷ୍ଟୁଡିଓ',
  photoTitle: 'ଉତ୍ପାଦର ଫଟୋ ନିଅନ୍ତୁ', photoHint: 'ଦିନ ଆଲୋକ ଓ ସାଦା ପୃଷ୍ଠଭୂମି ରଖନ୍ତୁ। ପୂରା ଉତ୍ପାଦ ଫ୍ରେମରେ ରହୁ।', takePhoto: 'ଫଟୋ ନିଅନ୍ତୁ', gallery: 'ଗ୍ୟାଲେରୀ', retake: 'ପୁଣି ନିଅନ୍ତୁ', usePhoto: 'ଏହି ଫଟୋ ବ୍ୟବହାର କରନ୍ତୁ', cameraPermission: 'ଫଟୋ ନେବା ପାଇଁ ଫୋନ ସେଟିଂସରେ କ୍ୟାମେରା ଅନୁମତି ଦିଅନ୍ତୁ।', galleryPermission: 'ଫଟୋ ବାଛିବା ପାଇଁ ଫୋନ ସେଟିଂସରେ ଅନୁମତି ଦିଅନ୍ତୁ।',
  enhancing: 'ଫଟୋ ପ୍ରସ୍ତୁତ ହେଉଛି', enhancingHint: 'ଫ୍ରେମ ଓ ପୃଷ୍ଠଭୂମି ସଫା କରାଯାଉଛି।', photoReady: 'ଆପଣଙ୍କ ଫଟୋ ପ୍ରସ୍ତୁତ', original: 'ମୂଳ', enhanced: 'ଉନ୍ନତ', bgRemoved: 'ପୃଷ୍ଠଭୂମି ସଫା ହେଲା', framed: 'ବଜାର ପାଇଁ ଫ୍ରେମ କରାଗଲା', enhanceFailed: 'ଫଟୋ ଉନ୍ନତ ହୋଇପାରିଲା ନାହିଁ। ମୂଳ ଫଟୋ ବ୍ୟବହାର କରିପାରିବେ।', useOriginal: 'ମୂଳ ଫଟୋ ରଖନ୍ତୁ',
  voiceTitle: 'ଉତ୍ପାଦ ବିଷୟରେ କୁହନ୍ତୁ', voiceHint: 'ସହଜରେ କୁହନ୍ତୁ: ଏହା କ’ଣ, କେଉଁଥିରେ ତିଆରି, ଓ ତିଆରିରେ କେତେ ସମୟ ଲାଗିଲା।', tapToSpeak: 'କହିବା ପାଇଁ ଦବାନ୍ତୁ', tapToStop: 'ଶେଷ ହେଲେ ଦବାନ୍ତୁ', listening: 'ଶୁଣୁଛୁ', transcribing: 'ଆପଣଙ୍କ କଥା ବୁଝୁଛୁ', youSaid: 'ଆପଣଙ୍କ ବର୍ଣ୍ଣନା', typeInstead: 'କିମ୍ବା ଏଠାରେ ଲେଖନ୍ତୁ', recordAgain: 'ପୁଣି କୁହନ୍ତୁ', playRecording: 'ଶୁଣନ୍ତୁ', micPermission: 'ରେକର୍ଡ କରିବା ପାଇଁ ଫୋନ ସେଟିଂସରେ ମାଇକ ଅନୁମତି ଦିଅନ୍ତୁ।', needDescription: 'ଆଗକୁ ଯିବା ପାଇଁ ଛୋଟ ବର୍ଣ୍ଣନା କୁହନ୍ତୁ ବା ଲେଖନ୍ତୁ।',
  listingTitle: 'ଆପଣଙ୍କ ଲିଷ୍ଟିଂ', titleHiLabel: 'ହିନ୍ଦୀରେ ଶିରୋନାମା', descriptionHiLabel: 'ହିନ୍ଦୀରେ ବର୍ଣ୍ଣନା', syncPending: 'ବଜାରକୁ ପଠାଯାଉଛି…', syncFailed: 'ଏପର୍ଯ୍ୟନ୍ତ ପଠାଯାଇନି। ଇଣ୍ଟରନେଟ ଆସିଲେ ପୁଣି ପଠାଯିବ।', syncDone: 'ବଜାରକୁ ପଠାଗଲା', writingListing: 'ଲିଷ୍ଟିଂ ଲେଖାଯାଉଛି', writingListingHint: 'ଆପଣଙ୍କ ଫଟୋ ଓ କଥାରୁ କ୍ରେତା ପାଇଁ ଲିଷ୍ଟିଂ ତିଆରି ହେଉଛି।', titleLabel: 'ଶିରୋନାମା', descriptionLabel: 'ବର୍ଣ୍ଣନା', highlights: 'ବିଶେଷତା', listingEditHint: 'ବଦଳାଇବା ପାଇଁ ଯେକୌଣସି ଲେଖା ଉପରେ ଦବାନ୍ତୁ।', looksGood: 'ଠିକ ଅଛି', writtenFromWords: 'ଆପଣଙ୍କ କଥାରୁ ଲେଖାଗଲା। ସ୍ୱୟଂଚାଳିତ ଲେଖା ପାଇଁ ସେଟିଂସରେ AI ଯୋଡନ୍ତୁ।',
  priceTitle: 'ଦାମ ସ୍ଥିର କରନ୍ତୁ', researchTitle: 'AI ବଜାର ଦେଖୁଛି', researchStep1: 'ଆପଣଙ୍କ ଫଟୋ ଦେଖାଯାଉଛି', researchStep2: 'ବଜାର ଦାମ ମିଳାଯାଉଛି', researchStep3: 'ଆପଣଙ୍କ ଦାମ ସ୍ଥିର ହେଉଛି', researchStep1Done: 'ଉତ୍ପାଦ ଚିହ୍ନଟ ହେଲା', researchStep2Done: 'ସମାନ ଉତ୍ପାଦ ମିଳିଲା', researchStep3Done: 'ଦାମ ପ୍ରସ୍ତୁତ', researchFailed: 'ବଜାର ଦେଖିପାରିଲୁ ନାହିଁ। ଆପଣ ନିଜ ଦାମ ରଖିପାରିବେ।', marketBand: 'ସମାନ ଉତ୍ପାଦ ଏତିକିରେ ବିକ୍ରି ହୁଏ', aiRecommended: 'AI ପରାମର୍ଶିତ ଦାମ', useThisPrice: 'ଏହି ଦାମ ରଖନ୍ତୁ', yourCost: 'ଆପଣଙ୍କ ଖର୍ଚ୍ଚ', materialCost: 'ସାମଗ୍ରୀ ଖର୍ଚ୍ଚ', hoursWorked: 'କାମ ଘଣ୍ଟା', hourlyRate: 'ଘଣ୍ଟା ପିଛା ମଜୁରୀ', profit: 'ଲାଭ', suggestedPrice: 'ପରାମର୍ଶିତ ଦାମ', perPiece: 'ପ୍ରତି ଖଣ୍ଡ', marketNote: 'ବଜାର ସୂଚନା', stockLabel: 'କେତେ ଖଣ୍ଡ ଉପଲବ୍ଧ', material: 'ସାମଗ୍ରୀ', labour: 'ମଜୁରୀ', margin: 'ଲାଭ', yourPrice: 'ଆପଣଙ୍କ ଦାମ',
  channelsTitle: 'କେଉଁଠି ବିକ୍ରି କରିବେ', channelsHint: 'ଆପଣ ଏକାଧିକ ବାଛିପାରିବେ।', ondcDesc: 'Paytm, Magicpin ଓ ଅନ୍ୟ ONDC ଆପର କ୍ରେତା', gemDesc: 'GeM ମାଧ୍ୟମରେ ସରକାରୀ ଥୋକ ଅର୍ଡର', b2bDesc: 'ସାରା ଭାରତର ଦୋକାନ ଓ ଥୋକ ବ୍ୟବସାୟୀ', publish: 'ପ୍ରକାଶ କରନ୍ତୁ', saveDraft: 'ଡ୍ରାଫ୍ଟ ସେଭ କରନ୍ତୁ', publishing: 'ପ୍ରକାଶ ହେଉଛି',
  liveTitle: 'ଆପଣଙ୍କ ଉତ୍ପାଦ ଲାଇଭ', liveHint: 'ଏବେ କ୍ରେତା ଏହାକୁ {channels} ରେ ଦେଖିପାରିବେ।', viewProducts: 'ମୋ ଉତ୍ପାଦ ଦେଖନ୍ତୁ', addAnother: 'ଆଉ ଗୋଟିଏ ଯୋଗ କରନ୍ତୁ',
  all: 'ସବୁ', published: 'ଲାଇଭ', draft: 'ଡ୍ରାଫ୍ଟ', inStock: '{n} ଷ୍ଟକରେ', productDetails: 'ଉତ୍ପାଦ ବିବରଣୀ', price: 'ଦାମ', stock: 'ଷ୍ଟକ', status: 'ସ୍ଥିତି', channels: 'ଚ୍ୟାନେଲ', makeLive: 'ଏବେ ପ୍ରକାଶ କରନ୍ତୁ', moveToDraft: 'ଡ୍ରାଫ୍ଟକୁ ନିଅନ୍ତୁ', deleteProduct: 'ଉତ୍ପାଦ ହଟାନ୍ତୁ', deleteConfirm: 'ଏହି ଉତ୍ପାଦ ହଟାଇବେ? ଏହା ଫେରାଇ ହେବ ନାହିଁ।', delete: 'ହଟାନ୍ତୁ',
  noOrders: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅର୍ଡର ନାହିଁ', noOrdersHint: 'ONDC, GeM ବା B2B ରୁ ଅର୍ଡର ଆସିଲେ ଏଠାରେ ଦେଖାଯିବ।', orderNew: 'ନୂଆ', orderAccepted: 'ଗ୍ରହଣ', orderPacked: 'ପ୍ୟାକ', orderShipped: 'ପଠାଗଲା', orderDelivered: 'ପହଞ୍ଚିଲା', acceptOrder: 'ଗ୍ରହଣ କରନ୍ତୁ', markPacked: 'ପ୍ୟାକ ହେଲା', markShipped: 'ପଠାଗଲା', markDelivered: 'ପହଞ୍ଚିଲା', qty: 'ପରିମାଣ',
  profile: 'ପ୍ରୋଫାଇଲ', preferences: 'ପସନ୍ଦ', voiceGuide: 'ସ୍ୱର ଗାଇଡ', voiceGuideHint: 'ପ୍ରତି ସ୍କ୍ରିନରେ ନିର୍ଦ୍ଦେଶ କହିବ', tutorial: 'ଟ୍ୟୁଟୋରିଆଲ', tutorialHint: 'KarigarSetu ବ୍ୟବହାର ଶିଖନ୍ତୁ', services: 'ସଂଯୁକ୍ତ ସେବା', connected: 'ସଂଯୁକ୍ତ', notConnected: 'ଡେମୋ ମୋଡ', aiListing: 'AI ଲିଷ୍ଟିଂ ଲେଖକ', speechToText: 'ସ୍ୱରରୁ ଲେଖା', data: 'ଡାଟା', loadSample: 'ନମୁନା ଡାଟା ଯୋଡନ୍ତୁ', loadSampleHint: 'ଉଦାହରଣ ଉତ୍ପାଦ, ଅର୍ଡର ଓ ଷ୍ଟୁଡିଓ ଫଟୋ ଦେଖାଏ', resetApp: 'ଆପ ରିସେଟ କରନ୍ତୁ', resetAppHint: 'ସବୁକିଛି ହଟାଇ ପୁଣି ଆରମ୍ଭ', resetConfirm: 'ଏହା ଫୋନରୁ ସମସ୍ତ ଉତ୍ପାଦ, ଅର୍ଡର ଓ ସେଟିଂସ ହଟାଇବ।', version: 'ସଂସ୍କରଣ', selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ', tutorialDone: 'ଆପଣ ପ୍ରସ୍ତୁତ', tryNow: 'ପ୍ରଥମ ଉତ୍ପାଦ ଯୋଗ କରନ୍ତୁ',
};

// The remaining languages translate the most-seen labels; the rest falls back to English.
const bn: Partial<Strings> = {
  home: 'হোম', products: 'পণ্য', orders: 'অর্ডার', settings: 'সেটিংস', continue: 'এগিয়ে যান', back: 'পিছনে', skip: 'বাদ দিন', done: 'হয়ে গেছে', cancel: 'বাতিল', save: 'সেভ করুন', listen: 'শুনুন', next: 'পরবর্তী',
  tagline: 'আপনার শিল্প, প্রতিটি বাজারে।', chooseLanguage: 'আপনার ভাষা বেছে নিন', chooseLanguageHint: 'অ্যাপ এই ভাষায় কথা বলবে ও লিখবে।', language: 'ভাষা', aboutYou: 'আপনার সম্পর্কে বলুন', yourName: 'আপনার নাম', yourCraft: 'আপনার শিল্প', howItWorks: 'কীভাবে কাজ করে', startSelling: 'বিক্রি শুরু করুন',
  greeting: 'নমস্কার', addProduct: 'পণ্য যোগ করুন', addProductHint: 'ছবি, কণ্ঠ, দাম — ৩ মিনিটে তৈরি', liveProducts: 'লাইভ', newOrders: 'নতুন অর্ডার', earnings: 'আয়', recentProducts: 'সাম্প্রতিক পণ্য', seeAll: 'সব দেখুন', noProductsYet: 'এখনও কোনো পণ্য নেই',
  takePhoto: 'ছবি তুলুন', gallery: 'গ্যালারি', retake: 'আবার তুলুন', usePhoto: 'এই ছবি ব্যবহার করুন', voiceTitle: 'পণ্যের বর্ণনা দিন', tapToSpeak: 'বলতে চাপুন', tapToStop: 'শেষ হলে চাপুন', recordAgain: 'আবার বলুন', listingTitle: 'আপনার লিস্টিং', looksGood: 'ঠিক আছে', priceTitle: 'দাম ঠিক করুন', suggestedPrice: 'প্রস্তাবিত দাম', channelsTitle: 'কোথায় বিক্রি করবেন', publish: 'প্রকাশ করুন', liveTitle: 'আপনার পণ্য লাইভ', viewProducts: 'আমার পণ্য দেখুন',
  all: 'সব', published: 'লাইভ', draft: 'খসড়া', noOrders: 'এখনও কোনো অর্ডার নেই', voiceGuide: 'কণ্ঠ গাইড', tutorial: 'টিউটোরিয়াল', selectLanguage: 'ভাষা বেছে নিন', tutorialDone: 'আপনি প্রস্তুত', tryNow: 'প্রথম পণ্য যোগ করুন',
};

const ta: Partial<Strings> = {
  home: 'முகப்பு', products: 'பொருட்கள்', orders: 'ஆர்டர்கள்', settings: 'அமைப்புகள்', continue: 'தொடரவும்', back: 'பின்', skip: 'தவிர்', done: 'முடிந்தது', cancel: 'ரத்து', save: 'சேமி', listen: 'கேளுங்கள்', next: 'அடுத்து',
  tagline: 'உங்கள் கைவினை, எல்லா சந்தைகளிலும்.', chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', chooseLanguageHint: 'ஆப் இந்த மொழியில் பேசும், காட்டும்.', language: 'மொழி', aboutYou: 'உங்களைப் பற்றி', yourName: 'உங்கள் பெயர்', yourCraft: 'உங்கள் கைவினை', howItWorks: 'இது எப்படி வேலை செய்கிறது', startSelling: 'விற்பனையைத் தொடங்கு',
  greeting: 'வணக்கம்', addProduct: 'பொருளைச் சேர்', addProductHint: 'புகைப்படம், குரல், விலை — 3 நிமிடத்தில்', liveProducts: 'நேரலை', newOrders: 'புதிய ஆர்டர்கள்', earnings: 'வருமானம்', recentProducts: 'சமீபத்திய பொருட்கள்', seeAll: 'அனைத்தும்', noProductsYet: 'இன்னும் பொருட்கள் இல்லை',
  takePhoto: 'புகைப்படம் எடு', gallery: 'கேலரி', retake: 'மீண்டும் எடு', usePhoto: 'இந்தப் புகைப்படம்', voiceTitle: 'உங்கள் பொருளை விவரிக்கவும்', tapToSpeak: 'பேச அழுத்தவும்', tapToStop: 'முடிந்ததும் அழுத்தவும்', recordAgain: 'மீண்டும் பேசு', listingTitle: 'உங்கள் பட்டியல்', looksGood: 'சரி', priceTitle: 'விலையை அமைக்கவும்', suggestedPrice: 'பரிந்துரைக்கப்பட்ட விலை', channelsTitle: 'எங்கே விற்பது', publish: 'வெளியிடு', liveTitle: 'உங்கள் பொருள் நேரலையில்', viewProducts: 'என் பொருட்கள்',
  all: 'அனைத்தும்', published: 'நேரலை', draft: 'வரைவு', noOrders: 'இன்னும் ஆர்டர்கள் இல்லை', voiceGuide: 'குரல் வழிகாட்டி', tutorial: 'பயிற்சி', selectLanguage: 'மொழியைத் தேர்ந்தெடு', tutorialDone: 'நீங்கள் தயார்', tryNow: 'முதல் பொருளைச் சேர்',
};

const te: Partial<Strings> = {
  home: 'హోమ్', products: 'ఉత్పత్తులు', orders: 'ఆర్డర్లు', settings: 'సెట్టింగ్‌లు', continue: 'కొనసాగించండి', back: 'వెనుకకు', skip: 'దాటవేయి', done: 'పూర్తయింది', cancel: 'రద్దు', save: 'సేవ్ చేయి', listen: 'వినండి', next: 'తర్వాత',
  tagline: 'మీ కళ, ప్రతి మార్కెట్‌లో.', chooseLanguage: 'మీ భాషను ఎంచుకోండి', chooseLanguageHint: 'యాప్ ఈ భాషలో మాట్లాడుతుంది, చూపిస్తుంది.', language: 'భాష', aboutYou: 'మీ గురించి చెప్పండి', yourName: 'మీ పేరు', yourCraft: 'మీ కళ', howItWorks: 'ఇది ఎలా పనిచేస్తుంది', startSelling: 'అమ్మడం ప్రారంభించండి',
  greeting: 'నమస్కారం', addProduct: 'ఉత్పత్తి జోడించండి', addProductHint: 'ఫోటో, వాయిస్, ధర — 3 నిమిషాల్లో', liveProducts: 'లైవ్', newOrders: 'కొత్త ఆర్డర్లు', earnings: 'ఆదాయం', recentProducts: 'ఇటీవలి ఉత్పత్తులు', seeAll: 'అన్నీ చూడండి', noProductsYet: 'ఇంకా ఉత్పత్తులు లేవు',
  takePhoto: 'ఫోటో తీయండి', gallery: 'గ్యాలరీ', retake: 'మళ్లీ తీయండి', usePhoto: 'ఈ ఫోటో వాడండి', voiceTitle: 'మీ ఉత్పత్తిని వివరించండి', tapToSpeak: 'మాట్లాడటానికి నొక్కండి', tapToStop: 'పూర్తయ్యాక నొక్కండి', recordAgain: 'మళ్లీ చెప్పండి', listingTitle: 'మీ లిస్టింగ్', looksGood: 'బాగుంది', priceTitle: 'ధర నిర్ణయించండి', suggestedPrice: 'సూచించిన ధర', channelsTitle: 'ఎక్కడ అమ్మాలి', publish: 'ప్రచురించండి', liveTitle: 'మీ ఉత్పత్తి లైవ్‌లో ఉంది', viewProducts: 'నా ఉత్పత్తులు',
  all: 'అన్నీ', published: 'లైవ్', draft: 'డ్రాఫ్ట్', noOrders: 'ఇంకా ఆర్డర్లు లేవు', voiceGuide: 'వాయిస్ గైడ్', tutorial: 'ట్యుటోరియల్', selectLanguage: 'భాషను ఎంచుకోండి', tutorialDone: 'మీరు సిద్ధంగా ఉన్నారు', tryNow: 'మొదటి ఉత్పత్తి జోడించండి',
};

const mr: Partial<Strings> = {
  home: 'होम', products: 'उत्पादने', orders: 'ऑर्डर', settings: 'सेटिंग्ज', continue: 'पुढे जा', back: 'मागे', skip: 'वगळा', done: 'झाले', cancel: 'रद्द करा', save: 'सेव्ह करा', listen: 'ऐका', next: 'पुढे',
  tagline: 'तुमची कला, प्रत्येक बाजारात.', chooseLanguage: 'तुमची भाषा निवडा', chooseLanguageHint: 'ॲप याच भाषेत बोलेल आणि दाखवेल.', language: 'भाषा', aboutYou: 'तुमच्याबद्दल सांगा', yourName: 'तुमचे नाव', yourCraft: 'तुमची कला', howItWorks: 'हे कसे काम करते', startSelling: 'विक्री सुरू करा',
  greeting: 'नमस्कार', addProduct: 'उत्पादन जोडा', addProductHint: 'फोटो, आवाज, किंमत — 3 मिनिटांत', liveProducts: 'लाइव्ह', newOrders: 'नवीन ऑर्डर', earnings: 'कमाई', recentProducts: 'अलीकडील उत्पादने', seeAll: 'सर्व पहा', noProductsYet: 'अजून उत्पादन नाही',
  takePhoto: 'फोटो घ्या', gallery: 'गॅलरी', retake: 'पुन्हा घ्या', usePhoto: 'हा फोटो वापरा', voiceTitle: 'उत्पादनाचे वर्णन करा', tapToSpeak: 'बोलण्यासाठी दाबा', tapToStop: 'झाल्यावर दाबा', recordAgain: 'पुन्हा बोला', listingTitle: 'तुमची लिस्टिंग', looksGood: 'ठीक आहे', priceTitle: 'किंमत ठरवा', suggestedPrice: 'सुचवलेली किंमत', channelsTitle: 'कुठे विकायचे', publish: 'प्रकाशित करा', liveTitle: 'तुमचे उत्पादन लाइव्ह आहे', viewProducts: 'माझी उत्पादने',
  all: 'सर्व', published: 'लाइव्ह', draft: 'ड्राफ्ट', noOrders: 'अजून ऑर्डर नाही', voiceGuide: 'आवाज मार्गदर्शक', tutorial: 'ट्युटोरियल', selectLanguage: 'भाषा निवडा', tutorialDone: 'तुम्ही तयार आहात', tryNow: 'पहिले उत्पादन जोडा',
};

const gu: Partial<Strings> = {
  home: 'હોમ', products: 'ઉત્પાદનો', orders: 'ઓર્ડર', settings: 'સેટિંગ્સ', continue: 'આગળ વધો', back: 'પાછળ', skip: 'છોડો', done: 'થઈ ગયું', cancel: 'રદ કરો', save: 'સેવ કરો', listen: 'સાંભળો', next: 'આગળ',
  tagline: 'તમારી કલા, દરેક બજારમાં.', chooseLanguage: 'તમારી ભાષા પસંદ કરો', chooseLanguageHint: 'એપ આ ભાષામાં બોલશે અને બતાવશે.', language: 'ભાષા', aboutYou: 'તમારા વિશે જણાવો', yourName: 'તમારું નામ', yourCraft: 'તમારી કલા', howItWorks: 'આ કેવી રીતે કામ કરે છે', startSelling: 'વેચાણ શરૂ કરો',
  greeting: 'નમસ્તે', addProduct: 'ઉત્પાદન ઉમેરો', addProductHint: 'ફોટો, અવાજ, કિંમત — 3 મિનિટમાં', liveProducts: 'લાઇવ', newOrders: 'નવા ઓર્ડર', earnings: 'કમાણી', recentProducts: 'તાજેતરના ઉત્પાદનો', seeAll: 'બધું જુઓ', noProductsYet: 'હજી કોઈ ઉત્પાદન નથી',
  takePhoto: 'ફોટો લો', gallery: 'ગેલેરી', retake: 'ફરી લો', usePhoto: 'આ ફોટો વાપરો', voiceTitle: 'ઉત્પાદનનું વર્ણન કરો', tapToSpeak: 'બોલવા માટે દબાવો', tapToStop: 'પૂરું થાય ત્યારે દબાવો', recordAgain: 'ફરી બોલો', listingTitle: 'તમારી લિસ્ટિંગ', looksGood: 'બરાબર છે', priceTitle: 'કિંમત નક્કી કરો', suggestedPrice: 'સૂચવેલી કિંમત', channelsTitle: 'ક્યાં વેચવું', publish: 'પ્રકાશિત કરો', liveTitle: 'તમારું ઉત્પાદન લાઇવ છે', viewProducts: 'મારા ઉત્પાદનો',
  all: 'બધા', published: 'લાઇવ', draft: 'ડ્રાફ્ટ', noOrders: 'હજી કોઈ ઓર્ડર નથી', voiceGuide: 'અવાજ માર્ગદર્શક', tutorial: 'ટ્યુટોરિયલ', selectLanguage: 'ભાષા પસંદ કરો', tutorialDone: 'તમે તૈયાર છો', tryNow: 'પહેલું ઉત્પાદન ઉમેરો',
};

const OVERRIDES: Record<Language, Partial<Strings>> = {
  english: {},
  hindi: hi,
  odia: od,
  bengali: bn,
  tamil: ta,
  telugu: te,
  marathi: mr,
  gujarati: gu,
};

export const STRINGS: Record<Language, Strings> = Object.fromEntries(
  (Object.keys(OVERRIDES) as Language[]).map((lang) => [lang, { ...en, ...OVERRIDES[lang] }])
) as Record<Language, Strings>;

/** Replaces `{name}` placeholders in a translated string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
