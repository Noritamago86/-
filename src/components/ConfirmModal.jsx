import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { translations } from '../lib/translations';

export function ConfirmModal({ isOpen, onClose, onConfirm, message, confirmText, confirmColor }) {
    if (!isOpen) return null;

    const { state } = useStore();
    const t = translations[state.settings.language || 'ja'];

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <div
                className="glass-panel animate-fade-in"
                style={{ width: '90%', maxWidth: '320px', padding: '24px', background: 'var(--bg-primary)', textAlign: 'center' }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>{message}</h3>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        className="glass-button"
                        style={{ padding: '8px 16px' }}
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="glass-button"
                        style={{
                            padding: '8px 16px',
                            background: confirmColor || 'var(--accent)',
                            color: '#fff',
                            border: 'none'
                        }}
                    >
                        {confirmText || t.ok}
                    </button>
                </div>
            </div>
        </div>
    );
}
