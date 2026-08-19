import { Capacitor } from '@capacitor/core';
import { browser } from '$app/environment';
import {
  PRODUCT_CATEGORY,
  Purchases,
  type CustomerInfo,
  type PurchasesPackage
} from '@revenuecat/purchases-capacitor';
import { writable } from 'svelte/store';

export const removeAdsStorageKey = 'fuascail.purchases.removeAds';

type PurchaseAvailability = 'checking' | 'ready' | 'unavailable' | 'purchased' | 'error';

export interface PurchaseState {
  available: PurchaseAvailability;
  removeAds: boolean;
  price: string | null;
  busy: boolean;
  message: string | null;
}

export const purchaseState = writable<PurchaseState>({
  available: 'checking',
  removeAds: getCachedRemoveAds(),
  price: null,
  busy: false,
  message: null
});

let configurationPromise: Promise<boolean> | null = null;
let removeAdsPackage: PurchasesPackage | null = null;

export async function initializePurchases(): Promise<void> {
  if (!purchasesAreEnabled()) {
    updateUnavailable('Ceannacháin ar fáil san aip dhúchasach amháin.');
    return;
  }

  const configured = await ensureConfigured();

  if (!configured) {
    updateUnavailable('Cumraigh RevenueCat chun fógraí a bhaint.');
    return;
  }

  try {
    const [{ customerInfo }] = await Promise.all([Purchases.getCustomerInfo(), loadRemoveAdsPackage()]);
    updateFromCustomerInfo(customerInfo);
  } catch {
    purchaseState.update((state) => ({
      ...state,
      available: state.removeAds ? 'purchased' : 'error',
      message: 'Níorbh fhéidir stádas ceannacháin a sheiceáil.'
    }));
  }
}

export async function purchaseRemoveAds(): Promise<void> {
  const configured = await ensureConfigured();

  if (!configured) {
    updateUnavailable('Cumraigh RevenueCat chun fógraí a bhaint.');
    return;
  }

  purchaseState.update((state) => ({ ...state, busy: true, message: null }));

  try {
    const aPackage = removeAdsPackage ?? (await loadRemoveAdsPackage());

    if (aPackage !== null) {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage });
      updateFromCustomerInfo(customerInfo, 'Fógraí bainte.');
      return;
    }

    const productId = getRemoveAdsProductId();
    const { products } = await Purchases.getProducts({
      productIdentifiers: [productId],
      type: PRODUCT_CATEGORY.NON_SUBSCRIPTION
    });
    const product = products[0];

    if (product === undefined) {
      purchaseState.update((state) => ({
        ...state,
        available: state.removeAds ? 'purchased' : 'unavailable',
        busy: false,
        message: 'Níor aimsíodh an táirge bain-fógraí.'
      }));
      return;
    }

    const { customerInfo } = await Purchases.purchaseStoreProduct({ product });
    updateFromCustomerInfo(customerInfo, 'Fógraí bainte.');
  } catch (error) {
    purchaseState.update((state) => ({
      ...state,
      busy: false,
      message: purchaseWasCancelled(error) ? null : 'Theip ar an gceannachán.'
    }));
  }
}

export async function restorePurchases(): Promise<void> {
  const configured = await ensureConfigured();

  if (!configured) {
    updateUnavailable('Cumraigh RevenueCat chun ceannacháin a athchóiriú.');
    return;
  }

  purchaseState.update((state) => ({ ...state, busy: true, message: null }));

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    updateFromCustomerInfo(
      customerInfo,
      customerHasRemoveAds(customerInfo) ? 'Ceannachán athchóirithe.' : 'Níor aimsíodh ceannachán.'
    );
  } catch {
    purchaseState.update((state) => ({
      ...state,
      busy: false,
      message: 'Theip ar athchóiriú ceannacháin.'
    }));
  }
}

export function adsRemoved(): boolean {
  return getCachedRemoveAds();
}

async function ensureConfigured(): Promise<boolean> {
  if (!purchasesAreEnabled()) {
    return false;
  }

  configurationPromise ??= configurePurchases();
  return configurationPromise;
}

async function configurePurchases(): Promise<boolean> {
  const apiKey = getRevenueCatApiKey();

  if (apiKey === undefined) {
    setCachedRemoveAds(false);
    return false;
  }

  try {
    await Purchases.configure({
      apiKey,
      automaticDeviceIdentifierCollectionEnabled: false
    });
    await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      updateFromCustomerInfo(customerInfo);
    });
    return true;
  } catch {
    return false;
  }
}

async function loadRemoveAdsPackage(): Promise<PurchasesPackage | null> {
  const offerings = await Purchases.getOfferings();
  const currentOffering = offerings.current;
  const packageIdentifier = import.meta.env.VITE_REVENUECAT_REMOVE_ADS_PACKAGE_ID;

  removeAdsPackage =
    currentOffering?.lifetime ??
    currentOffering?.availablePackages.find((aPackage) => aPackage.identifier === packageIdentifier) ??
    currentOffering?.availablePackages.find((aPackage) => aPackage.product.identifier === getRemoveAdsProductId()) ??
    null;

  purchaseState.update((state) => ({
    ...state,
    available: state.removeAds ? 'purchased' : removeAdsPackage === null ? state.available : 'ready',
    price: removeAdsPackage?.product.priceString ?? state.price
  }));

  return removeAdsPackage;
}

function updateFromCustomerInfo(customerInfo: CustomerInfo, message: string | null = null): void {
  const removeAds = customerHasRemoveAds(customerInfo);
  setCachedRemoveAds(removeAds);
  purchaseState.update((state) => ({
    ...state,
    available: removeAds ? 'purchased' : 'ready',
    removeAds,
    busy: false,
    message
  }));
}

function customerHasRemoveAds(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[getRemoveAdsEntitlementId()] !== undefined;
}

function purchasesAreEnabled(): boolean {
  return Capacitor.isNativePlatform() && import.meta.env.VITE_REVENUECAT_ENABLED !== 'false';
}

function getRevenueCatApiKey(): string | undefined {
  const platformKey =
    Capacitor.getPlatform() === 'ios'
      ? import.meta.env.VITE_REVENUECAT_IOS_API_KEY
      : import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY;

  return typeof platformKey === 'string' && platformKey.trim().length > 0
    ? platformKey.trim()
    : undefined;
}

function getRemoveAdsEntitlementId(): string {
  return import.meta.env.VITE_REVENUECAT_REMOVE_ADS_ENTITLEMENT_ID || 'remove_ads';
}

function getRemoveAdsProductId(): string {
  return import.meta.env.VITE_REVENUECAT_REMOVE_ADS_PRODUCT_ID || 'remove_ads';
}

function updateUnavailable(message: string): void {
  purchaseState.update((state) => ({
    ...state,
    available: state.removeAds ? 'purchased' : 'unavailable',
    busy: false,
    message
  }));
}

function purchaseWasCancelled(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled === true;
}

function getCachedRemoveAds(): boolean {
  if (!browser) {
    return false;
  }

  return localStorage.getItem(removeAdsStorageKey) === 'true';
}

function setCachedRemoveAds(removeAds: boolean): void {
  if (!browser) {
    return;
  }

  localStorage.setItem(removeAdsStorageKey, String(removeAds));
}
