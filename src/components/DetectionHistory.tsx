import { useState } from 'react';
import type { DetectionRecord, AppSettings } from '../types';
import { t, getBehaviorLabelI18n } from '../i18n';
import { AnimatedFrames } from './AnimatedFrames';

interface Props {
  records: DetectionRecord[];
  settings: AppSettings;
  pendingThumbnail: string | null;
  onClear: () => void;
}

export function DetectionHistory({ records, settings, pendingThumbnail, onClear }: Props) {
  const [selectedRecord, setSelectedRecord] = useState<DetectionRecord | null>(null);
  const [focusedOnly, setFocusedOnly] = useState(true);
  const loc = settings.locale;

  const displayed = focusedOnly ? records.filter((r) => r.result.detected) : records;

  if (selectedRecord) {
    return (
      <div className="evidence-viewer">
        <button className="back-btn" onClick={() => setSelectedRecord(null)}>
          &larr; {t('backToHistory', loc)}
        </button>
        <div className="evidence-image">
          {selectedRecord.frames.length > 1 ? (
            <AnimatedFrames frames={selectedRecord.frames} className="evidence-anim" autoPlay />
          ) : (
            <img src={selectedRecord.fullImageDataUrl} alt="" />
          )}
        </div>
        <div className="evidence-info">
          {selectedRecord.result.detected ? (
            <div className="behavior-tags">
              {selectedRecord.result.behaviors.map((b) => (
                <span key={b} className="badge badge-alert">
                  {getBehaviorLabelI18n(b, loc, settings.customBehaviors)}
                </span>
              ))}
            </div>
          ) : (
            <span className="badge badge-ok">{t('nothingDetected', loc)}</span>
          )}
          <p className="whisper-text">{selectedRecord.result.message}</p>
          <time>{new Date(selectedRecord.timestamp).toLocaleString()}</time>
        </div>
      </div>
    );
  }

  return (
    <div className="detection-history">
      <div className="history-header">
        <h3>{t('caughtInTheAct', loc)} ({displayed.length})</h3>
        <div className="history-actions">
          <button
            className={`filter-toggle ${focusedOnly ? 'active' : ''}`}
            onClick={() => setFocusedOnly(!focusedOnly)}
          >
            {focusedOnly ? t('focused', loc) : t('all', loc)}
          </button>
          {records.length > 0 && (
            <button className="btn-small" onClick={onClear}>{t('clear', loc)}</button>
          )}
        </div>
      </div>

      {displayed.length === 0 && !pendingThumbnail ? (
        <p className="empty-state">
          {records.length === 0 ? t('nothingYet', loc) : t('noDetections', loc)}
        </p>
      ) : (
        <div className="history-list">
          {!focusedOnly && pendingThumbnail && (
            <div className="history-item pending">
              <img src={pendingThumbnail} alt="" className="history-thumb" />
              <div className="history-info">
                <span className="badge badge-pending">{t('analyzingBadge', loc)}</span>
                <p className="evidence-text pending-text">{t('watchingClosely', loc)}</p>
              </div>
              <div className="pending-spinner" />
            </div>
          )}
          {displayed.map((record) => (
            <div
              key={record.id}
              className={`history-item ${record.result.detected ? 'alert' : ''}`}
              onClick={() => setSelectedRecord(record)}
            >
              <AnimatedFrames frames={record.frames} className="history-thumb" />
              <div className="history-info">
                {record.result.detected ? (
                  <div className="behavior-tags">
                    {record.result.behaviors.map((b) => (
                      <span key={b} className="badge badge-alert">
                        {getBehaviorLabelI18n(b, loc, settings.customBehaviors)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="badge badge-ok">{t('ok', loc)}</span>
                )}
                <p className="evidence-text whisper-text">{record.result.message}</p>
                <time>{new Date(record.timestamp).toLocaleTimeString()}</time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
