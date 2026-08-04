import { PACKAGES } from '../constants/mockData';

// Legacy code map for standard package IDs that might be saved in DB
const LEGACY_PACKAGE_MAP = {
  opt_a: 'Option A: Professional Case Assessment',
  opt_b: 'Option B: Full Processing Package – End-to-End Service',
  opt_c: 'Option C: VIP Relocation & Concierge Package',
  opt_d: 'Option D: Administrative & Settlement Support',
  option_a: 'Option A: Professional Case Assessment',
  option_b: 'Option B: Full Processing Package – End-to-End Service',
  option_c: 'Option C: VIP Relocation & Concierge Package',
  option_d: 'Option D: Administrative & Settlement Support',
  full_process: 'Option B: Full Processing Package – End-to-End Service',
  premium: 'Option C: VIP Relocation & Concierge Package',
  relocation: 'Option D: Administrative & Settlement Support',
  no_show_fee: 'No Show Fee',
  schengen: 'Schengen Visa Processing',
};

/**
 * Utility function to resolve and get the clean display name of a package.
 * Searches dynamic packages from DB, static mockData PACKAGES, and legacy mappings.
 *
 * @param {string} packageId - Package ID, code, or name string
 * @param {Array} dynamicPackages - Optional list of packages fetched from DB API
 * @returns {string} - Human-readable package display name
 */
export const getPackageDisplayName = (packageId, dynamicPackages = []) => {
  if (!packageId) return '-';

  const cleanId = String(packageId).trim();

  // 1. Check in dynamic packages from DB (if available)
  if (Array.isArray(dynamicPackages) && dynamicPackages.length > 0) {
    const foundDb = dynamicPackages.find(
      (p) =>
        p.id === cleanId ||
        p.code === cleanId ||
        (p.code && p.code.toLowerCase() === cleanId.toLowerCase()) ||
        (p.id && p.id.toLowerCase() === cleanId.toLowerCase()) ||
        p.name === cleanId
    );
    if (foundDb && foundDb.name) {
      return foundDb.name;
    }
  }

  // 2. Check in static PACKAGES from mockData
  const foundMock = PACKAGES.find(
    (p) =>
      p.id === cleanId ||
      p.code === cleanId ||
      (p.code && p.code.toLowerCase() === cleanId.toLowerCase()) ||
      (p.id && p.id.toLowerCase() === cleanId.toLowerCase()) ||
      p.name === cleanId
  );
  if (foundMock && foundMock.name) {
    return foundMock.name;
  }

  // 3. Check legacy key mapping
  const lowerKey = cleanId.toLowerCase();
  if (LEGACY_PACKAGE_MAP[lowerKey]) {
    return LEGACY_PACKAGE_MAP[lowerKey];
  }

  // 4. If it already looks like a human-readable package name
  if (
    cleanId.startsWith('Option ') ||
    cleanId.toLowerCase().includes('package') ||
    cleanId.toLowerCase().includes('service') ||
    cleanId.toLowerCase().includes('assessment') ||
    cleanId.toLowerCase().includes('visa')
  ) {
    return cleanId;
  }

  // 5. Fallback for unmapped pkg_ codes or raw IDs
  return cleanId;
};
