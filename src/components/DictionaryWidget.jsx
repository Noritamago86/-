import React, { useState } from 'react';
import { Search, Book, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { translations } from '../lib/translations';

export function DictionaryWidget() {
    const { state, dispatch, actions } = useStore();
    const { settings } = state;
    const t = translations[settings.language || 'ja'];
    const { collapsedWidgets } = settings;
    const isCollapsed = collapsedWidgets?.dictionary ?? true;

    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Open Weblio in new tab
        window.open(`https://ejje.weblio.jp/content/${encodeURIComponent(query)}`, '_blank');
        setQuery('');
    };

    const toggleCollapse = () => {
        dispatch({ type: actions.TOGGLE_COLLAPSE, payload: { dictionary: !isCollapsed } });
    };

    return (
        <div className="glass-panel" style={{
            marginTop: '16px', marginBottom: '16px', padding: '0',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* Collapsible Header */}
            <div
                onClick={toggleCollapse}
                style={{
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    borderBottom: isCollapsed ? 'none' : '1px solid var(--white-a10)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-sub)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Book size={16} />
                    <span>{t.dictionary || "Dictionary"}</span>
                </div>
                {isCollapsed ? <ChevronRight size={18} color="var(--text-sub)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
            </div>

            {!isCollapsed && (
                <div style={{ padding: '16px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t.dictPlaceholder || "Search..."}
                                className="glass-button"
                                style={{
                                    width: '100%', padding: '10px 10px 10px 36px',
                                    textAlign: 'left',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                        <button type="submit" className="glass-button" style={{ padding: '0 16px', fontWeight: 'bold' }}>
                            Go
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
