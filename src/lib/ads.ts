import { AdMob, MaxAdContentRating } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const puzzleCompletionCountStorageKey = 'fuascail.ads.puzzleCompletionCount';
const defaultInterstitialFrequency = 3;
const androidTestInterstitialAdId = 'ca-app-pub-3940256099942544/1033173712';
const iosTestInterstitialAdId = 'ca-app-pub-3940256099942544/4411468910';

let initializationPromise: Promise<boolean> | null = null;
let canRequestAds = false;
let personalizedAdsAllowed = false;
let interstitialReady = false;
let interstitialPreparePromise: Promise<void> | null = null;

export async function initializeAds(): Promise<void> {
  await ensureInitialized();
}

export async function recordPuzzleCompletedAndMaybeShowInterstitial(): Promise<void> {
  if (!adsAreEnabled()) {
    return;
  }

  const completionCount = getStoredPuzzleCompletionCount() + 1;
  localStorage.setItem(puzzleCompletionCountStorageKey, String(completionCount));

  const frequency = getInterstitialFrequency();

  if (frequency <= 0 || completionCount % frequency !== 0) {
    return;
  }

  const initialized = await ensureInitialized();

  if (!initialized) {
    return;
  }

  await showInterstitialIfReady();
}

async function ensureInitialized(): Promise<boolean> {
  if (!adsAreEnabled()) {
    return false;
  }

  initializationPromise ??= initializeAdMob();
  return initializationPromise;
}

async function initializeAdMob(): Promise<boolean> {
  try {
    await AdMob.initialize({
      maxAdContentRating: MaxAdContentRating.General
    });

    let consentInfo = await AdMob.requestConsentInfo();

    if (!consentInfo.canRequestAds && consentInfo.isConsentFormAvailable) {
      consentInfo = await AdMob.showConsentForm();
    }

    canRequestAds = consentInfo.canRequestAds;

    if (!canRequestAds) {
      return false;
    }

    personalizedAdsAllowed = await resolvePersonalizedAdsAllowed();

    await prepareInterstitial();
    return true;
  } catch {
    canRequestAds = false;
    personalizedAdsAllowed = false;
    interstitialReady = false;
    return false;
  }
}

async function resolvePersonalizedAdsAllowed(): Promise<boolean> {
  if (!personalizedAdsWanted()) {
    return false;
  }

  const trackingInfo = await AdMob.trackingAuthorizationStatus();

  if (trackingInfo.status === 'notDetermined') {
    await AdMob.requestTrackingAuthorization();
  }

  const authorizationStatus = await AdMob.trackingAuthorizationStatus();
  return authorizationStatus.status === 'authorized';
}

async function showInterstitialIfReady(): Promise<void> {
  if (!canRequestAds) {
    return;
  }

  if (!interstitialReady) {
    await prepareInterstitial();
  }

  if (!interstitialReady) {
    return;
  }

  try {
    interstitialReady = false;
    await AdMob.showInterstitial();
  } catch {
    interstitialReady = false;
  } finally {
    void prepareInterstitial();
  }
}

async function prepareInterstitial(): Promise<void> {
  if (!canRequestAds || interstitialPreparePromise !== null) {
    return interstitialPreparePromise ?? Promise.resolve();
  }

  interstitialPreparePromise = AdMob.prepareInterstitial({
    adId: getInterstitialAdId(),
    isTesting: adMobTestModeEnabled(),
    npa: !personalizedAdsAllowed
  })
    .then(() => {
      interstitialReady = true;
    })
    .catch(() => {
      interstitialReady = false;
    })
    .finally(() => {
      interstitialPreparePromise = null;
    });

  return interstitialPreparePromise;
}

function adsAreEnabled(): boolean {
  return Capacitor.isNativePlatform() && import.meta.env.VITE_ADMOB_ENABLED !== 'false';
}

function personalizedAdsWanted(): boolean {
  return import.meta.env.VITE_ADMOB_PERSONALIZED_ADS === 'true';
}

function adMobTestModeEnabled(): boolean {
  return import.meta.env.VITE_ADMOB_TEST_MODE !== 'false' || getConfiguredInterstitialAdId() === undefined;
}

function getInterstitialFrequency(): number {
  const configuredFrequency = Number(import.meta.env.VITE_ADMOB_INTERSTITIAL_FREQUENCY);

  if (!Number.isFinite(configuredFrequency)) {
    return defaultInterstitialFrequency;
  }

  return Math.trunc(configuredFrequency);
}

function getInterstitialAdId(): string {
  return getConfiguredInterstitialAdId() ?? getPlatformTestInterstitialAdId();
}

function getConfiguredInterstitialAdId(): string | undefined {
  const configuredAdId = import.meta.env.VITE_ADMOB_INTERSTITIAL_AD_ID;
  return typeof configuredAdId === 'string' && configuredAdId.trim().length > 0
    ? configuredAdId.trim()
    : undefined;
}

function getPlatformTestInterstitialAdId(): string {
  return Capacitor.getPlatform() === 'ios' ? iosTestInterstitialAdId : androidTestInterstitialAdId;
}

function getStoredPuzzleCompletionCount(): number {
  const storedValue = Number(localStorage.getItem(puzzleCompletionCountStorageKey));
  return Number.isFinite(storedValue) && storedValue >= 0 ? Math.trunc(storedValue) : 0;
}
