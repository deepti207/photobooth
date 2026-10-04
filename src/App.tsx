/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Mode,
  PhotoSlot,
  Template,
  CustomTextConfig,
  LogoConfig,
  StallSettings,
  PrintHistoryItem,
  BorderStyle,
  ColorTheme,
  CustomColors,
  DigicamSettings,
  EmojiBorderSettings,
  DEFAULT_EMOJI_BORDER,
} from './types/photobooth';
import { VERTICAL_TEMPLATES, HORIZONTAL_TEMPLATES } from './data/templates';
import {
  loadSettings,
  saveSettings,
  loadPrintHistory,
  savePrintRecord,
  deletePrintHistoryItem,
  clearAllPrintHistory,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './components/HomeScreen';
import { PhotoUploadSlots } from './components/PhotoUploadSlots';
import { TemplateSelector } from './components/TemplateSelector';
import { CustomizationPanel } from './components/CustomizationPanel';
import { StripPreview } from './components/StripPreview';
import { A4PrintView } from './components/A4PrintView';
import { CropAdjustModal } from './components/CropAdjustModal';
import { PrintCompleteModal } from './components/PrintCompleteModal';
import { PrintHistoryModal } from './components/PrintHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { Layers, Sliders, ArrowRight } from 'lucide-react';
import { generateSampleHorizontalPhotos, generateSampleVerticalPhotos } from './utils/samplePhotos';

export default function App() {
  // Navigation & Step state
  const [currentStep, setCurrentStep] = useState<'home' | 'editor' | 'a4print'>('home');
  const [mode, setMode] = useState<Mode | null>(null);
  const [editorTab, setEditorTab] = useState<'photos' | 'templates' | 'customize'>('photos');

  // Modals state
  const [cropModalPhoto, setCropModalPhoto] = useState<PhotoSlot | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [printCompleteData, setPrintCompleteData] = useState<{
    copies: number;
    templateNames: string[];
    thumbnailUrl: string;
  } | null>(null);

  // Settings & History state
  const [settings, setSettings] = useState<StallSettings>(loadSettings);
  const [history, setHistory] = useState<PrintHistoryItem[]>(loadPrintHistory);

  // Active Project State
  const [photos, setPhotos] = useState<PhotoSlot[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(VERTICAL_TEMPLATES[0]);
  const [customText, setCustomText] = useState<CustomTextConfig>({
    eventName: 'PHOTOBOOTH MEMORIES',
    subText: 'Stall Edition • 2026',
    venue: '',
    hashtag: '#PhotoboothStudio',
    customMessage: 'Made with love & laughter',
    placement: 'bottom',
    fontFamily: 'sans-serif',
  });
  const [logo, setLogo] = useState<LogoConfig>({
    url: null,
    placement: 'top',
    scale: 1,
    opacity: 0.9,
  });

  // Sync settings changes
  const handleUpdateSettings = (newSettings: StallSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleToggleFastMode = () => {
    const updated = { ...settings, fastMode: !settings.fastMode };
    handleUpdateSettings(updated);
  };

  const handleToggleCuttingGuides = () => {
    const updated = { ...settings, cuttingGuides: !settings.cuttingGuides };
    handleUpdateSettings(updated);
  };

  const handleUpdateFavorites = (updatedFavs: string[]) => {
    const updated = { ...settings, favoriteTemplateIds: updatedFavs };
    handleUpdateSettings(updated);
  };

  // Start Mode from Home
  const handleSelectMode = (selectedMode: Mode) => {
    setMode(selectedMode);
    if (selectedMode === 'vertical') {
      setSelectedTemplate(VERTICAL_TEMPLATES[0]);
    } else {
      setSelectedTemplate(HORIZONTAL_TEMPLATES[0]);
    }
    setPhotos([]);
    setEditorTab('photos');
    setCurrentStep('editor');
  };

  // Reset / New Customer
  const handleNewCustomer = () => {
    setPhotos([]);
    setPrintCompleteData(null);
    if (mode === 'vertical') {
      setSelectedTemplate(VERTICAL_TEMPLATES[0]);
    } else if (mode === 'horizontal') {
      setSelectedTemplate(HORIZONTAL_TEMPLATES[0]);
    }
    setEditorTab('photos');
    setCurrentStep('editor');
  };

  const handleGoHome = () => {
    setCurrentStep('home');
    setPrintCompleteData(null);
  };

  // Crop adjustments
  const handleSaveCrop = (updatedCrop: PhotoSlot['crop']) => {
    if (!cropModalPhoto) return;
    const updated = photos.map((p) =>
      p.slotIndex === cropModalPhoto.slotIndex ? { ...p, crop: updatedCrop } : p
    );
    setPhotos(updated);
    setCropModalPhoto(null);
  };

  // Frame border override
  const handleUpdateFrameBorder = (borderStyle: BorderStyle) => {
    setSelectedTemplate((prev) => ({
      ...prev,
      frame: {
        ...prev.frame,
        borderStyle,
      },
    }));
  };

  // Color Theme switch
  const handleUpdateColorTheme = (theme: ColorTheme, custom?: CustomColors) => {
    setSelectedTemplate((prev) => ({
      ...prev,
      colorTheme: theme,
      customColors: custom || prev.customColors,
    }));
  };

  // Digicam settings switch
  const handleUpdateDigicamSettings = (dSettings: DigicamSettings) => {
    setSelectedTemplate((prev) => ({
      ...prev,
      digicamEffect: dSettings,
    }));
  };

  // Emoji border settings switch
  const handleUpdateEmojiBorder = (eSettings: EmojiBorderSettings) => {
    setSelectedTemplate((prev) => ({
      ...prev,
      emojiBorder: eSettings,
    }));
  };

  // Print completed handler
  const handlePrintSuccess = (thumbnailUrl: string, copies: number, templateNames: string[]) => {
    if (!mode) return;
    savePrintRecord({
      timestamp: Date.now(),
      mode,
      templateNames,
      thumbnailUrl,
      photoCount: photos.length,
      copies,
      a4DesignMode: 'same_design',
      a4PhotoMode: 'same_photos',
    });
    setHistory(loadPrintHistory());
    setPrintCompleteData({
      copies,
      templateNames,
      thumbnailUrl,
    });
  };

  // History Actions
  const handleReprintFromHistory = (item: PrintHistoryItem) => {
    setShowHistoryModal(false);
    setMode(item.mode);
    const tmplList = item.mode === 'vertical' ? VERTICAL_TEMPLATES : HORIZONTAL_TEMPLATES;
    const foundTmpl = tmplList.find((t) => t.name === item.templateNames[0]) || tmplList[0];
    setSelectedTemplate(foundTmpl);
    if (photos.length !== 6) {
      setPhotos(item.mode === 'vertical' ? generateSampleVerticalPhotos() : generateSampleHorizontalPhotos());
    }
    setCurrentStep('a4print');
  };

  const handleDeleteHistory = (id: string) => {
    deletePrintHistoryItem(id);
    setHistory(loadPrintHistory());
  };

  const handleClearHistory = () => {
    clearAllPrintHistory();
    setHistory([]);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* 1. Windows Application Header */}
      <TopBar
        currentMode={mode}
        currentStep={currentStep}
        fastMode={settings.fastMode}
        onToggleFastMode={handleToggleFastMode}
        onGoHome={handleGoHome}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onNewCustomer={handleNewCustomer}
        photoCount={photos.length}
      />

      {/* 2. Main Workspace View Router */}
      {currentStep === 'home' && (
        <HomeScreen
          onSelectMode={handleSelectMode}
          onOpenHistory={() => setShowHistoryModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          fastMode={settings.fastMode}
          onToggleFastMode={handleToggleFastMode}
          historyCount={history.length}
        />
      )}

      {currentStep === 'editor' && mode && (
        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
          {/* Left Panel: Editor Tabs and Controls */}
          <div className="flex-1 flex flex-col bg-zinc-900 border-r border-zinc-800 overflow-hidden">
            {/* Editor Sub-header Tabs */}
            <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditorTab('photos')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    editorTab === 'photos'
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span>1. Photos ({photos.length}/6)</span>
                </button>

                <button
                  onClick={() => setEditorTab('templates')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    editorTab === 'templates'
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Templates</span>
                </button>

                <button
                  onClick={() => setEditorTab('customize')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    editorTab === 'customize'
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>3. Customization & Digicam</span>
                </button>
              </div>

              {/* Mode indicator badge */}
              <div className="text-xs font-mono font-medium text-zinc-400 hidden sm:flex items-center gap-2">
                <span>{mode === 'vertical' ? '📱 Vertical Frames' : '🖼️ Horizontal Frames'}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-amber-400 font-bold">{selectedTemplate.name}</span>
              </div>
            </div>

            {/* Tab Contents Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {editorTab === 'photos' && (
                <div className="space-y-4">
                  <PhotoUploadSlots
                    mode={mode}
                    photos={photos}
                    onPhotosChange={setPhotos}
                    onOpenCropModal={setCropModalPhoto}
                  />

                  {photos.length === 6 && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-300">
                        ✓ All 6 photos ready! Choose a template or proceed to A4 print.
                      </span>
                      <button
                        onClick={() => setEditorTab('templates')}
                        className="px-3 py-1 bg-emerald-500 text-zinc-950 font-bold rounded text-xs hover:bg-emerald-400 transition-colors"
                      >
                        Next: Templates →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {editorTab === 'templates' && (
                <div className="space-y-4">
                  <TemplateSelector
                    mode={mode}
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={setSelectedTemplate}
                    favoriteTemplateIds={settings.favoriteTemplateIds || []}
                    recentTemplateIds={settings.recentTemplateIds || []}
                    onUpdateFavorites={handleUpdateFavorites}
                    onUpdateColorTheme={handleUpdateColorTheme}
                  />
                </div>
              )}

              {editorTab === 'customize' && (
                <div className="space-y-4">
                  <CustomizationPanel
                    customText={customText}
                    onCustomTextChange={setCustomText}
                    logo={logo}
                    onLogoChange={setLogo}
                    currentTemplate={selectedTemplate}
                    onUpdateFrameBorder={handleUpdateFrameBorder}
                    onUpdateDigicamSettings={handleUpdateDigicamSettings}
                    onUpdateEmojiBorder={handleUpdateEmojiBorder}
                  />
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
              <div className="text-xs text-zinc-400">
                <span>Strip: </span>
                <span className="font-semibold text-zinc-200">
                  {photos.length} of 6 photos placed
                </span>
              </div>

              <button
                onClick={() => setCurrentStep('a4print')}
                disabled={photos.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs md:text-sm text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>PROCEED TO A4 PRINT (4 STRIPS)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Right Panel: Dedicated Strip Live Preview */}
          <div className="w-full lg:w-[380px] xl:w-[440px] bg-zinc-950 border-l border-zinc-800 p-4 flex flex-col justify-center overflow-y-auto shrink-0">
            <StripPreview
              mode={mode}
              photos={photos}
              template={selectedTemplate}
              customText={customText}
              logo={logo}
              onOpenCropModal={setCropModalPhoto}
              onToggleEmojiBorder={() =>
                handleUpdateEmojiBorder({
                  ...(selectedTemplate.emojiBorder || DEFAULT_EMOJI_BORDER),
                  enabled: !(selectedTemplate.emojiBorder?.enabled),
                })
              }
            />
          </div>
        </div>
      )}

      {currentStep === 'a4print' && mode && (
        <A4PrintView
          mode={mode}
          basePhotos={photos}
          baseTemplate={selectedTemplate}
          baseCustomText={customText}
          baseLogo={logo}
          cuttingGuides={settings.cuttingGuides}
          onToggleCuttingGuides={handleToggleCuttingGuides}
          onBackToEdit={() => setCurrentStep('editor')}
          onNewCustomer={handleNewCustomer}
          onPrintSuccess={handlePrintSuccess}
        />
      )}

      {/* 3. Global Modals */}
      {cropModalPhoto && mode && (
        <CropAdjustModal
          photo={cropModalPhoto}
          mode={mode}
          onSave={handleSaveCrop}
          onClose={() => setCropModalPhoto(null)}
        />
      )}

      {printCompleteData && (
        <PrintCompleteModal
          copies={printCompleteData.copies}
          templateNames={printCompleteData.templateNames}
          thumbnailUrl={printCompleteData.thumbnailUrl}
          onNewCustomer={handleNewCustomer}
          onReprint={() => {
            window.print();
          }}
          onGoHome={handleGoHome}
        />
      )}

      {showHistoryModal && (
        <PrintHistoryModal
          history={history}
          onClose={() => setShowHistoryModal(false)}
          onReprintItem={handleReprintFromHistory}
          onDeleteItem={handleDeleteHistory}
          onClearAll={handleClearHistory}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
