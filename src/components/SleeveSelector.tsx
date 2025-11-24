import React, { useState } from 'react';
import type { CardDimensions } from '../types/sleeve';
import { CARD_PRESETS } from '../types/sleeve';
import { JUMPSTART_THEMES, JUMPSTART_SETS } from '../data/themes';
import SleeveSVG from './SleeveSVG';
import './SleeveSelector.css';

type Theme = typeof JUMPSTART_THEMES[number];

const variantGroups = new Map<string, Theme[]>();
JUMPSTART_THEMES.forEach((theme) => {
    const key = `${theme.setId}::${theme.name}`;
    const list = variantGroups.get(key) ?? [];
    list.push(theme);
    variantGroups.set(key, list);
});

/**
 * Themes that have variants (same name & setId, multiple variant values).
 * For each variant we compute cards that are unique to that variant (i.e. appear in
 * no other variant of the same theme group).
 */
const uniqueCardsForThemeVariant = new Map<string, string[]>();
Array.from(variantGroups.values())
    .filter((variants) => variants.length > 1)
    .forEach((variants) => {
        // count occurrences of each card across all variants in this group
        const cardCounts = new Map<string, number>();
        variants.forEach((v) => {
            (v.cardList || []).forEach((card) => {
                cardCounts.set(card.name, (cardCounts.get(card.name) ?? 0) + 1);
            });
        });

        variants.forEach((v) => {
            const uniqueCards = (v.cardList || []).filter((c) => cardCounts.get(c.name) === 1).map((c) => c.name);
            if (uniqueCards.length === 0) {
                console.log(`Theme variant ${v.name} (${v.variant}) has no unique cards.`);
            }
            uniqueCardsForThemeVariant.set(v.id, uniqueCards);
        });
    });


const SleeveSelector: React.FC = () => {
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());
  const [selectedPreset, setSelectedPreset] = useState<string>('unsleeved');
  const [customDimensions, setCustomDimensions] = useState<CardDimensions>(
    CARD_PRESETS.unsleeved
  );
  const [useCustom, setUseCustom] = useState(false);
  const [withImage, setWithImage] = useState(true);
  const [withCardList, setWithCardList] = useState(true);
  const [withCollectorCode, setWithCollectorCode] = useState(true);
  const [activeSetId, setActiveSetId] = useState<string>(JUMPSTART_SETS[0]?.id || '');

  const handleThemeToggle = (themeId: string) => {
    const newSelected = new Set(selectedThemes);
    if (newSelected.has(themeId)) {
      newSelected.delete(themeId);
    } else {
      newSelected.add(themeId);
    }
    setSelectedThemes(newSelected);
  };

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setUseCustom(false);
    setCustomDimensions(CARD_PRESETS[preset as keyof typeof CARD_PRESETS]);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate collector code in format AAA-NN (variant added separately as prop)
  const generateCollectorCode = (theme: Theme): string => {
    // Convert setId to 3-letter code (e.g., "ffdn" -> "FDN")
    // Hardcoded set mappings
    const setMappings: Record<string, string> = {
      'fjmp': 'JMP',
      'fj22': 'J22',
      'fj25': 'J25',
      'ffdn': 'FDN',
      'ftla': 'TLA-B',
      'jtla': 'TLA',
    };    
    const setCode = setMappings[theme.setId] || theme.setId.toUpperCase();
    
    // Pad collector number with zeros
    const paddedNumber = theme.nr.padStart(2, '0');
    
    return `${setCode}-${paddedNumber}`;
  };

  // Get themes for the active set, respecting the withCardList filter
  const activeSetThemes = JUMPSTART_THEMES
    .filter((theme) => theme.setId === activeSetId)
    .filter((theme) => withCardList || !theme.variant || theme.variant === '1');

  // Check if all themes in active set are selected
  const allActiveSetSelected = activeSetThemes.length > 0 && 
    activeSetThemes.every((theme) => selectedThemes.has(theme.id));

  const handleSelectAllToggle = () => {
    const newSelected = new Set(selectedThemes);
    
    if (allActiveSetSelected) {
      // Deselect all themes from active set
      activeSetThemes.forEach((theme) => {
        newSelected.delete(theme.id);
      });
    } else {
      // Select all themes from active set
      activeSetThemes.forEach((theme) => {
        newSelected.add(theme.id);
      });
    }
    
    setSelectedThemes(newSelected);
  };

  const currentDimensions = useCustom ? customDimensions : CARD_PRESETS[selectedPreset as keyof typeof CARD_PRESETS];
  const selectedThemesList = JUMPSTART_THEMES.filter((theme) =>
    selectedThemes.has(theme.id)
  );

  return (
    <div className="sleeve-selector">
      <div className="controls no-print">
        <h1>Jumpstart Sleeve Printer</h1>

        <section className="dimension-selector">
          <h2>Card Dimensions</h2>
          <div className="preset-buttons">
            {Object.keys(CARD_PRESETS).map((preset) => (
              <button
                key={preset}
                className={selectedPreset === preset && !useCustom ? 'active' : ''}
                onClick={() => handlePresetChange(preset)}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
            <button
              className={useCustom ? 'active' : ''}
              onClick={() => setUseCustom(true)}
            >
              Custom
            </button>
          </div>

          {useCustom && (
            <div className="custom-dimensions">
              <label>
                Width (mm):
                <input
                  type="number"
                  step="0.1"
                  value={customDimensions.width}
                  onChange={(e) =>
                    setCustomDimensions({
                      ...customDimensions,
                      width: parseFloat(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Height (mm):
                <input
                  type="number"
                  step="0.1"
                  value={customDimensions.height}
                  onChange={(e) =>
                    setCustomDimensions({
                      ...customDimensions,
                      height: parseFloat(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Card thickness (mm):
                <input
                  type="number"
                  step="0.1"
                  value={customDimensions.thickness}
                  onChange={(e) =>
                    setCustomDimensions({
                      ...customDimensions,
                      thickness: parseFloat(e.target.value),
                    })
                  }
                />
              </label>
            </div>
          )}
        </section>

        <section className="theme-selector">
          <h2>Select Themes</h2>
          <div className="print-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={withImage}
                onChange={(e) => setWithImage(e.target.checked)}
              />
              Include theme images
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={withCardList}
                onChange={(e) => {
                    setWithCardList(e.target.checked);
                    if (!e.target.checked) {
                        const newSelected = new Set(selectedThemes);
                        JUMPSTART_THEMES.forEach((t) => {
                            if (t.variant && t.variant !== '1' && newSelected.has(t.id)) {
                                newSelected.delete(t.id);
                                newSelected.add(t.id.replace(new RegExp(`-${t.variant}$`), '-1'));
                            }
                        });
                        setSelectedThemes(newSelected);
                    }
                }}
              />
              Include card list
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={withCollectorCode}
                onChange={(e) => setWithCollectorCode(e.target.checked)}
              />
              Include collector code
            </label>
          </div>
          
          {/* Set Tabs */}
          <div className="set-tabs">
            {JUMPSTART_SETS.map((set) => (
              <button
                key={set.id}
                className={`set-tab ${activeSetId === set.id ? 'active' : ''}`}
                onClick={() => setActiveSetId(set.id)}
              >
                {set.name}
              </button>
            ))}
          </div>

          {/* Theme Grid - filtered by active set */}
          <div className="theme-grid">
            {JUMPSTART_THEMES.filter((theme) => theme.setId === activeSetId).filter((theme) => withCardList || !theme.variant || theme.variant === '1').map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${
                  selectedThemes.has(theme.id) ? 'selected' : ''
                }`}
                onClick={() => handleThemeToggle(theme.id)}
              >
                <div className="theme-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedThemes.has(theme.id)}
                    readOnly
                  />
                </div>
                <div className="theme-name">
                  {theme.name}
                  {theme.variant && withCardList && (
                    <span
                      className="theme-variant"
                      title={
                        (uniqueCardsForThemeVariant.get(theme.id)?.join('\n')) ||
                        'No unique cards'
                      }
                      aria-label={`Variant ${theme.variant} unique cards`}
                    >
                      {' '}{theme.variant}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Select All checkbox */}
          <div className="select-all-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allActiveSetSelected}
                onChange={handleSelectAllToggle}
              />
              Select All in {JUMPSTART_SETS.find(s => s.id === activeSetId)?.name}
            </label>
          </div>
        </section>

        <div className="print-controls">
          <button
            className="print-button"
            onClick={handlePrint}
            disabled={selectedThemes.size === 0}
          >
            Print {selectedThemes.size} Sleeve{selectedThemes.size !== 1 ? 's' : ''}
          </button>
          <button
            className="clear-button"
            onClick={() => setSelectedThemes(new Set())}
            disabled={selectedThemes.size === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="print-area">
        {selectedThemesList.map((theme, index) => (
          <div
            key={theme.id}
            className={`sleeve-container ${
              (index + 1) % 3 === 0 ? 'page-break' : ''
            }`}
          >
            <SleeveSVG
              themeName={theme.name}
              themeImageUrl={withImage ? theme.imageUrl : undefined}
              cardList={withCardList ? theme.cardList : undefined}
              dimensions={currentDimensions}
              colors={theme.colors}
              collectorCode={withCollectorCode ? generateCollectorCode(theme) : undefined}
              variant={withCardList ? theme.variant : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SleeveSelector;
