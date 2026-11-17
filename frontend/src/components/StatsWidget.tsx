import { useState } from 'react';
import type { WordCard } from '../types/app';

interface StatsWidgetProps {
  words: WordCard[];
  selectedDeckId: string;
  deckFilterStatus: string;
  onSelectStatusFilter: (status: string) => void;
}

export function StatsWidget({
  words,
  selectedDeckId,
  deckFilterStatus,
  onSelectStatusFilter,
}: StatsWidgetProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const now = new Date();
  const totalCards = words.length;
  const isDeckScoped = selectedDeckId && selectedDeckId !== 'all';
  const deckCardsCount = isDeckScoped
    ? words.filter((w) => w.deck_id === selectedDeckId).length
    : totalCards;

  const countByStatus = {
    New: words.filter((w) => w.status === 'New').length,
    Learning: words.filter((w) => w.status === 'Learning').length,
    Known: words.filter((w) => w.status === 'Known').length,
    Mastered: words.filter((w) => w.status === 'Mastered').length,
  };

  const dueCardsCount = words.filter((w) => {
    if (!w.next_review_at) return true;
    return new Date(w.next_review_at) <= now;
  }).length;

  const masteredOrKnown = countByStatus.Known + countByStatus.Mastered;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredOrKnown / totalCards) * 100) : 0;
  const quotaUsedPct = Math.min(Math.round((totalCards / 1000) * 100), 100);

  return (
    <div className="stats-widget-container">
      <div className="stats-widget-header">
        <div className="stats-title-group" onClick={() => setIsExpanded((prev) => !prev)}>
          <span className="stats-icon">📊</span>
          <span className="stats-heading">Learning Metrics & Leitner SRS Overview</span>
          <span className="stats-toggle-icon">{isExpanded ? '▲' : '▼'}</span>
        </div>

        <div className="stats-quick-summary">
          <span className="summary-pill due-pill" title="Cards scheduled for review right now">
            ⏰ <strong>{dueCardsCount}</strong> Due
          </span>
          <span className="summary-pill total-pill" title="Cards in this deck / Total collection">
            📇 <strong>{deckCardsCount}</strong> in Deck ({totalCards}/1,000 Total)
          </span>
          <span className="summary-pill mastery-pill" title="Known + Mastered cards percentage">
            🎯 <strong>{masteryPercentage}%</strong> Retained
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="stats-widget-body">
          {/* FSM Status Pipeline */}
          <div className="fsm-pipeline-grid">
            {(['New', 'Learning', 'Known', 'Mastered'] as const).map((st) => {
              const count = countByStatus[st];
              const pct = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
              const isFilterActive = deckFilterStatus === st;

              return (
                <button
                  key={st}
                  type="button"
                  className={`fsm-stat-card stat-${st.toLowerCase()} ${isFilterActive ? 'active-filter' : ''}`}
                  onClick={() => onSelectStatusFilter(isFilterActive ? 'all' : st)}
                  title={`Filter cards by ${st} status`}
                >
                  <div className="stat-card-top">
                    <span className="fsm-dot"></span>
                    <span className="fsm-label">{st}</span>
                  </div>
                  <div className="stat-card-count">{count}</div>
                  <div className="stat-card-pct">{pct}% of deck</div>
                </button>
              );
            })}
          </div>

          {/* Progress Bars */}
          <div className="stats-bars-row">
            <div className="progress-group">
              <div className="progress-label-bar">
                <span>Leitner Retention Progress (Known + Mastered)</span>
                <span>{masteredOrKnown} / {totalCards} cards ({masteryPercentage}%)</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill retention-fill"
                  style={{ width: `${masteryPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="progress-group">
              <div className="progress-label-bar">
                <span>Trial Quota Used (Max 1,000)</span>
                <span>{totalCards} / 1,000 ({quotaUsedPct}%)</span>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill quota-fill ${totalCards >= 900 ? 'quota-warning' : ''}`}
                  style={{ width: `${quotaUsedPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
