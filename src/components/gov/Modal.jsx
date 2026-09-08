import React from 'react';
import { X } from 'lucide-react';

export function Modal({ title, onClose, children, width = 620 }) {
  return (
    <div className="gov-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="gov-modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="gov-modal-head">
          <span className="gov-card-title">{title}</span>
          <button className="gov-icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>
        <div className="gov-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({ title, onClose, children }) {
  return (
    <div className="gov-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="gov-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gov-drawer-head">
          <span className="gov-card-title">{title}</span>
          <button className="gov-icon-btn" onClick={onClose} aria-label="Close panel">
            <X size={16} />
          </button>
        </div>
        <div className="gov-drawer-body">{children}</div>
      </div>
    </div>
  );
}
