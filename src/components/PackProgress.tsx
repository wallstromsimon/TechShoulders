import { useState, useEffect } from 'react';

interface PackProgressProps {
  packId: string;
  cardIds: string[];
  cardNames: string[];
}

const STORAGE_KEY = 'techshoulders_pack_progress';

interface ProgressData {
  [packId: string]: {
    [cardId: string]: boolean;
  };
}

function getProgress(): ProgressData {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function PackProgress({ packId, cardIds, cardNames }: PackProgressProps) {
  const [readCards, setReadCards] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const progress = getProgress();
    const packProgress = progress[packId] || {};
    setReadCards(new Set(Object.keys(packProgress).filter(id => packProgress[id])));
  }, [packId]);

  const toggleCard = (cardId: string) => {
    const newReadCards = new Set(readCards);
    const isRead = readCards.has(cardId);

    if (isRead) {
      newReadCards.delete(cardId);
    } else {
      newReadCards.add(cardId);
    }

    setReadCards(newReadCards);

    // Persist to localStorage
    const progress = getProgress();
    if (!progress[packId]) {
      progress[packId] = {};
    }
    progress[packId][cardId] = !isRead;
    saveProgress(progress);
  };

  const completedCount = readCards.size;
  const totalCount = cardIds.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!mounted) {
    // SSR placeholder
    return (
      <div className="pack-progress">
        <div className="progress-header">
          <span className="progress-label">Your Progress</span>
          <span className="progress-count">0 / {totalCount} cards</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '0%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="pack-progress">
      <div className="progress-header">
        <span className="progress-label">Your Progress</span>
        <span className="progress-count">
          {completedCount} / {totalCount} cards
          {completedCount === totalCount && totalCount > 0 && (
            <span className="complete-badge" title="Pack completed!">✓</span>
          )}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="progress-cards">
        {cardIds.map((cardId, index) => {
          const isRead = readCards.has(cardId);
          return (
            <button
              key={cardId}
              className={`progress-card-btn ${isRead ? 'read' : ''}`}
              onClick={() => toggleCard(cardId)}
              title={`${isRead ? 'Unmark' : 'Mark'} "${cardNames[index]}" as read`}
            >
              <span className="card-number">{index + 1}</span>
              <span className="check-icon">{isRead ? '✓' : ''}</span>
            </button>
          );
        })}
      </div>
      <p className="progress-hint">Click numbers to mark cards as read</p>
    </div>
  );
}
