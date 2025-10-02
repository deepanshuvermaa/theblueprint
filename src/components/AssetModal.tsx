import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { YouTubeEmbed } from './YouTubeEmbed';
import ProteinCalculator from './ProteinCalculator';
import HydrationCalculator from './HydrationCalculator';
import BreathingTimer from './BreathingTimer';
import StretchingTimer from './StretchingTimer';
import MeditationTimer from './MeditationTimer';
import ReadingTracker from './ReadingTracker';
import CompoundInterestCalculator from './CompoundInterestCalculator';
import AITutorialSystem from './AITutorialSystem';
import { useStore } from '../store/useStore';
import assetsData from '../data/assets.json';
import habitAssetMap from '../data/habit-asset-map.json';
import './AssetModal.css';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitKey: string;
  habitName: string;
  habitId: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  affiliateLink: string;
  platform: string;
  badge?: string | null;
}

interface FreeResource {
  id: string;
  type: 'youtube' | 'guide';
  name: string;
  videoId?: string;
  url?: string;
  description: string;
}

interface HabitAssets {
  premium: Product[];
  mid_range: Product[];
  budget: Product[];
  free_resources: FreeResource[];
}

type AssetTier = 'premium' | 'mid_range' | 'budget' | 'free' | 'my_links';

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  habitKey,
  habitName,
  habitId,
}) => {
  const [activeTier, setActiveTier] = useState<AssetTier>('premium');
  const [assets, setAssets] = useState<HabitAssets | null>(null);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');

  const { addSavedLink, removeSavedLink, getSavedLinksByHabit } = useStore();
  const savedLinks = getSavedLinksByHabit(habitId);

  useEffect(() => {
    if (isOpen) {
      // Map habit title to asset key using mapping
      const assetKey = (habitAssetMap as Record<string, string>)[habitName] || 'default';
      const habitAssets = (assetsData as Record<string, HabitAssets>)[assetKey] || assetsData.default;
      setAssets(habitAssets);

      // Set initial tier based on available content
      if (habitAssets.premium.length > 0) {
        setActiveTier('premium');
      } else if (habitAssets.mid_range.length > 0) {
        setActiveTier('mid_range');
      } else if (habitAssets.budget.length > 0) {
        setActiveTier('budget');
      } else {
        setActiveTier('free');
      }

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, habitKey]);

  const handleProductClick = (productId: string, affiliateLink: string) => {
    // Analytics tracking can be added here
    console.log('Product clicked:', { productId, affiliateLink, habitKey });
  };

  const handleGuideClick = (url: string, resourceId: string) => {
    console.log('Guide clicked:', { resourceId, url, habitKey });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen || !assets) return null;

  const handleAddLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    await addSavedLink({
      habitId,
      url: newLinkUrl.trim(),
      title: newLinkTitle.trim(),
      description: newLinkDescription.trim() || undefined,
    });

    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkDescription('');
    setShowAddLinkForm(false);
  };

  const handleDeleteLink = async (linkId: string) => {
    await removeSavedLink(linkId);
  };

  const getTierLabel = (tier: AssetTier): string => {
    switch (tier) {
      case 'premium':
        return 'Premium';
      case 'mid_range':
        return 'Mid-Range';
      case 'budget':
        return 'Budget';
      case 'free':
        return 'Free Resources';
      case 'my_links':
        return 'My Saved Links';
      default:
        return '';
    }
  };

  const getTierCount = (tier: AssetTier): number => {
    if (tier === 'free') return assets.free_resources.length;
    if (tier === 'my_links') return savedLinks.length;
    return assets[tier].length;
  };

  return (
    <div className="asset-modal-overlay" onClick={onClose}>
      <div className="asset-modal" onClick={(e) => e.stopPropagation()}>
        <div className="asset-modal__header">
          <div>
            <h2 className="asset-modal__title">Assets for {habitName}</h2>
            <p className="asset-modal__subtitle">Curated tools and resources to master your habit</p>
          </div>
          <button className="asset-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="asset-modal__tabs">
          {(['premium', 'mid_range', 'budget', 'free', 'my_links'] as AssetTier[]).map((tier) => {
            const count = getTierCount(tier);
            if (count === 0 && tier !== 'my_links') return null;

            return (
              <button
                key={tier}
                className={`asset-modal__tab ${activeTier === tier ? 'asset-modal__tab--active' : ''}`}
                onClick={() => setActiveTier(tier)}
              >
                {getTierLabel(tier)}
                <span className="asset-modal__tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="asset-modal__content">
          {/* Show Protein Calculator for protein habit */}
          {habitName === 'Consume 1g protein per bodyweight (kg)' && (
            <ProteinCalculator />
          )}

          {/* Show Hydration Calculator for water habit */}
          {habitName === 'Drink 3-4L water daily' && (
            <HydrationCalculator />
          )}

          {/* Show Breathing Timer for breath workout habit */}
          {habitName === 'Do a breath workout' && (
            <BreathingTimer />
          )}

          {/* Show Stretching Timer for stretching habit */}
          {habitName === 'Stretch 15 minutes daily' && (
            <StretchingTimer />
          )}

          {/* Show Meditation Timer for meditation habit */}
          {habitName === 'Do 10 minutes meditation' && (
            <MeditationTimer />
          )}

          {/* Show Reading Tracker for reading habit */}
          {habitName === 'Read at least 10 pages' && (
            <ReadingTracker habitId={habitId} />
          )}

          {/* Show Compound Interest Calculator for investment/savings habits */}
          {(habitName === 'Invest, even a dollar' || habitName === 'Save 20% of income') && (
            <CompoundInterestCalculator />
          )}

          {/* Show AI Tutorial System for tutorial/learning habits */}
          {(habitName === '1 tutorial a day' || habitName === 'Learn something new daily' || habitName === 'Build high-income skills') && (
            <AITutorialSystem />
          )}

          {activeTier === 'my_links' ? (
            <div className="asset-modal__free-resources">
              {!showAddLinkForm && (
                <button
                  className="add-link-button"
                  onClick={() => setShowAddLinkForm(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Custom Link
                </button>
              )}

              {showAddLinkForm && (
                <div className="add-link-form">
                  <input
                    type="text"
                    placeholder="Link Title"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="add-link-input"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="add-link-input"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newLinkDescription}
                    onChange={(e) => setNewLinkDescription(e.target.value)}
                    className="add-link-textarea"
                    rows={3}
                  />
                  <div className="add-link-actions">
                    <button onClick={handleAddLink} className="add-link-submit">
                      Save Link
                    </button>
                    <button
                      onClick={() => {
                        setShowAddLinkForm(false);
                        setNewLinkTitle('');
                        setNewLinkUrl('');
                        setNewLinkDescription('');
                      }}
                      className="add-link-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {savedLinks.map((link) => (
                <div key={link.id} className="saved-link-item">
                  <div
                    className="saved-link-clickable"
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  >
                    <div className="free-resource-item__icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div className="free-resource-item__content">
                      <h4 className="free-resource-item__title">{link.title}</h4>
                      {link.description && (
                        <p className="free-resource-item__description">{link.description}</p>
                      )}
                    </div>
                    <div className="free-resource-item__arrow">→</div>
                  </div>
                  <button
                    className="saved-link-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLink(link.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {!showAddLinkForm && savedLinks.length === 0 && (
                <div className="empty-state">
                  <p>No saved links yet. Click "Add Custom Link" to save your favorite resources.</p>
                </div>
              )}
            </div>
          ) : activeTier === 'free' ? (
            <div className="asset-modal__free-resources">
              {assets.free_resources.map((resource) => {
                if (resource.type === 'youtube' && resource.videoId) {
                  return (
                    <div key={resource.id} className="free-resource-item">
                      <h4 className="free-resource-item__title">{resource.name}</h4>
                      <p className="free-resource-item__description">{resource.description}</p>
                      <YouTubeEmbed videoId={resource.videoId} title={resource.name} />
                    </div>
                  );
                }

                if (resource.type === 'guide' && resource.url) {
                  return (
                    <div
                      key={resource.id}
                      className="free-resource-item free-resource-item--guide"
                      onClick={() => handleGuideClick(resource.url!, resource.id)}
                    >
                      <div className="free-resource-item__icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                      <div className="free-resource-item__content">
                        <h4 className="free-resource-item__title">{resource.name}</h4>
                        <p className="free-resource-item__description">{resource.description}</p>
                      </div>
                      <div className="free-resource-item__arrow">→</div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            <div className="asset-modal__products">
              {assets[activeTier].map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onCardClick={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
