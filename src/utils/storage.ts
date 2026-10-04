import { PrintHistoryItem, StallSettings } from '../types/photobooth';

const HISTORY_STORAGE_KEY = 'photobooth_studio_print_history_v1';
const SETTINGS_STORAGE_KEY = 'photobooth_studio_settings_v1';

export const DEFAULT_SETTINGS: StallSettings = {
  fastMode: false,
  cuttingGuides: true,
  defaultCopies: 1,
  printDpi: 300,
  stallName: 'Photobooth Studio Stall',
  storageFolderPath: 'C:/PhotoBooth Studio/Prints/',
  borderlessPrint: true,
  favoriteTemplateIds: [],
  recentTemplateIds: [],
};

export function loadSettings(): StallSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: StallSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function addRecentTemplateId(templateId: string): string[] {
  const current = loadSettings();
  const filtered = (current.recentTemplateIds || []).filter((id) => id !== templateId);
  const updated = [templateId, ...filtered].slice(0, 10);
  saveSettings({ ...current, recentTemplateIds: updated });
  return updated;
}

export function toggleFavoriteTemplateId(templateId: string): string[] {
  const current = loadSettings();
  const favs = current.favoriteTemplateIds || [];
  const exists = favs.includes(templateId);
  const updated = exists ? favs.filter((id) => id !== templateId) : [...favs, templateId];
  saveSettings({ ...current, favoriteTemplateIds: updated });
  return updated;
}

export function loadPrintHistory(): PrintHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load print history:', err);
  }
  return [];
}

export function savePrintRecord(record: Omit<PrintHistoryItem, 'id'>): PrintHistoryItem {
  const item: PrintHistoryItem = {
    ...record,
    id: `print_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };

  try {
    const existing = loadPrintHistory();
    // Keep last 40 history items to maintain storage quota
    const updated = [item, ...existing].slice(0, 40);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save print history item:', err);
  }

  return item;
}

export function deletePrintHistoryItem(id: string): void {
  try {
    const existing = loadPrintHistory();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete print history item:', err);
  }
}

export function clearAllPrintHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear print history:', err);
  }
}
