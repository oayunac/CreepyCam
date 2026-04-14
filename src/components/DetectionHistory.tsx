import { useState } from 'react';
import type { DetectionRecord, AppSettings } from '../types';
import { getBehaviorLabel } from '../types';

interface Props {
  records: DetectionRecord[];
  settings: AppSettings;
  pendingThumbnail: string | null;
  onClear: () => void;
}

const STARING_QUIPS = [
  'Wait... are YOU staring at ME?',
  'I was watching you first.',
  'Caught you looking!',
  'We made eye contact. Awkward.',
  "Don't look at me like that...",
  'Boo!',
];

function getEvidenceText(record: DetectionRecord): string {
  if (record.result.behaviors.includes('staring_at_camera')) {
    return STARING_QUIPS[record.timestamp % STARING_QUIPS.length];
  }
  return record.result.evidence;
}

export function DetectionHistory({ records, settings, pendingThumbnail, onClear }: Props) {
  const [selectedRecord, setSelectedRecord] = useState<DetectionRecord | null>(null);
  const [focusedOnly, setFocusedOnly] = useState(true);

  const displayed = focusedOnly ? records.filter((r) => r.result.detected) : records;

  if (selectedRecord) {
    return (
      <div className="evidence-viewer">
        <button className="back-btn" onClick={() => setSelectedRecord(null)}>
          &larr; Back to History
        </button>
        <div className="evidence-image">
          <img src={selectedRecord.fullImageDataUrl} alt="Evidence" />
        </div>
        <div className="evidence-info">
          {selectedRecord.result.detected ? (
            <div className="behavior-tags">
              {selectedRecord.result.behaviors.map((b) => (
                <span key={b} className="badge badge-alert">
                  {getBehaviorLabel(b, settings)}
                </span>
              ))}
            </div>
          ) : (
            <span className="badge badge-ok">Nothing detected</span>
          )}
          <p>{getEvidenceText(selectedRecord)}</p>
          <time>{new Date(selectedRecord.timestamp).toLocaleString()}</time>
        </div>
      </div>
    );
  }

  return (
    <div className="detection-history">
      <div className="history-header">
        <h3>Caught in the Act ({displayed.length})</h3>
        <div className="history-actions">
          <button
            className={`filter-toggle ${focusedOnly ? 'active' : ''}`}
            onClick={() => setFocusedOnly(!focusedOnly)}
            title={focusedOnly ? 'Showing detections only' : 'Showing all scans'}
          >
            {focusedOnly ? 'Focused' : 'All'}
          </button>
          {records.length > 0 && (
            <button className="btn-small" onClick={onClear}>Clear</button>
          )}
        </div>
      </div>

      {displayed.length === 0 && !pendingThumbnail ? (
        <p className="empty-state">
          {records.length === 0
            ? 'Nothing caught yet. Start monitoring to begin.'
            : 'No detections yet. Toggle "All" to see every scan.'}
        </p>
      ) : (
        <div className="history-list">
          {!focusedOnly && pendingThumbnail && (
            <div className="history-item pending">
              <img src={pendingThumbnail} alt="" className="history-thumb" />
              <div className="history-info">
                <span className="badge badge-pending">Analyzing</span>
                <p className="evidence-text pending-text">Watching closely...</p>
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
              <img src={record.thumbnailDataUrl} alt="" className="history-thumb" />
              <div className="history-info">
                {record.result.detected ? (
                  <div className="behavior-tags">
                    {record.result.behaviors.map((b) => (
                      <span key={b} className="badge badge-alert">
                        {getBehaviorLabel(b, settings)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="badge badge-ok">OK</span>
                )}
                <p className="evidence-text">{getEvidenceText(record)}</p>
                <time>{new Date(record.timestamp).toLocaleTimeString()}</time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
