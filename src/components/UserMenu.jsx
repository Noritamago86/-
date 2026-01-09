import React, { useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { X, Upload, History, Trophy, Globe, Eye, EyeOff, Palette } from 'lucide-react';
import { translations } from '../lib/translations';
import { THEMES, FONTS } from '../lib/constants';

export function UserMenu({ onClose }) {
    const { state, dispatch, actions } = useStore();
    const { settings, tasks } = state;
    const { visibleWidgets = { timer: true, goals: true, dictionary: true, sound: true, flashcard: true, tasks: true } } = settings;
    const t = translations[settings.language || 'ja'];
    const fileInputRef = useRef(null);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // Filter completed tasks
    const completedTasks = tasks.filter(t => t.completedAt).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            dispatch({ type: actions.UPDATE_USER_ICON, payload: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <div
                className="glass-panel animate-fade-in"
                style={{ width: '90%', maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--white-a10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t.userSettings}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    {/* Icon Section */}
                    <section style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={16} /> {t.language}
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => dispatch({ type: actions.CHANGE_LANGUAGE, payload: 'ja' })}
                                    className="glass-button"
                                    style={{
                                        flex: 1, padding: '8px',
                                        background: settings.language === 'ja' ? 'var(--accent)' : 'var(--white-a20)',
                                        color: settings.language === 'ja' ? '#fff' : 'var(--text-main)',
                                        border: 'none'
                                    }}
                                >
                                    日本語
                                </button>
                                <button
                                    onClick={() => dispatch({ type: actions.CHANGE_LANGUAGE, payload: 'en' })}
                                    className="glass-button"
                                    style={{
                                        flex: 1, padding: '8px',
                                        background: settings.language === 'en' ? 'var(--accent)' : 'var(--white-a20)',
                                        color: settings.language === 'en' ? '#fff' : 'var(--text-main)',
                                        border: 'none'
                                    }}
                                >
                                    English
                                </button>
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Palette size={16} /> {t.theme || "Theme"}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {Object.keys(THEMES).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => dispatch({ type: actions.CHANGE_THEME, payload: key })}
                                        className="glass-button"
                                        style={{
                                            padding: '8px',
                                            background: settings.theme === key ? 'var(--accent)' : 'var(--white-a20)',
                                            color: settings.theme === key ? 'var(--bg-primary)' : 'var(--text-main)',
                                            fontWeight: settings.theme === key ? 'bold' : 'normal',
                                            border: 'none',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {THEMES[key].name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Settings */}
                        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Aa</span> {t.font || "Font"}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                {Object.entries(FONTS).map(([key, font]) => (
                                    <button
                                        key={key}
                                        onClick={() => dispatch({ type: actions.CHANGE_FONT, payload: key })}
                                        className="glass-button"
                                        style={{
                                            padding: '8px',
                                            background: settings.font === key ? 'var(--accent)' : 'var(--white-a20)',
                                            color: settings.font === key ? 'var(--bg-primary)' : 'var(--text-main)',
                                            fontFamily: font.value,
                                            border: 'none',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {font.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Eye size={16} /> {t.displaySettings}
                            </label>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(settings.widgetOrder || ['timer', 'calendar', 'tasks', 'dictionary', 'sound', 'flashcard']).map((widgetKey, index) => {
                                    const isVisible = visibleWidgets[widgetKey] !== false;

                                    // Helper for labels
                                    const getLabel = (key) => {
                                        switch (key) {
                                            case 'timer': return isVisible ? t.timerOn : t.timerOff;
                                            case 'calendar': return isVisible ? "カレンダー: ON" : "カレンダー: OFF";
                                            case 'dictionary': return isVisible ? t.dictOn : t.dictOff;
                                            case 'sound': return isVisible ? t.soundOn : t.soundOff;
                                            case 'flashcard': return isVisible ? t.cardOn : t.cardOff;
                                            case 'tasks': return isVisible ? t.tasksWidgetOn : t.tasksWidgetOff;
                                            default: return key;
                                        }
                                    };

                                    return (
                                        <div
                                            key={widgetKey}
                                            draggable
                                            onDragStart={(e) => {
                                                dragItem.current = index;
                                                e.target.style.opacity = '0.5';
                                            }}
                                            onDragEnter={(e) => {
                                                if (dragItem.current === null || dragItem.current === index) return;

                                                const currentOrder = settings.widgetOrder || ['timer', 'calendar', 'tasks', 'dictionary', 'sound', 'flashcard'];
                                                const newOrder = [...currentOrder];

                                                const draggedIdx = dragItem.current;
                                                const targetIdx = index;

                                                if (newOrder[draggedIdx] && newOrder[targetIdx]) {
                                                    const draggedItemContent = newOrder[draggedIdx];
                                                    newOrder.splice(draggedIdx, 1);
                                                    newOrder.splice(targetIdx, 0, draggedItemContent);

                                                    dragItem.current = targetIdx;
                                                    dispatch({ type: 'REORDER_WIDGETS', payload: newOrder });
                                                }
                                            }}
                                            onDragEnd={(e) => {
                                                dragItem.current = null;
                                                dragOverItem.current = null;
                                                e.target.style.opacity = '1';
                                            }}
                                            onDragOver={(e) => e.preventDefault()}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                cursor: 'grab'
                                            }}
                                        >
                                            {/* Toggle Button */}
                                            <button
                                                onClick={() => dispatch({ type: actions.TOGGLE_WIDGET, payload: { [widgetKey]: !isVisible } })}
                                                className="glass-button"
                                                style={{
                                                    flex: 1, padding: '8px',
                                                    background: isVisible ? 'var(--accent)' : 'var(--white-a20)',
                                                    color: isVisible ? '#fff' : 'var(--text-main)',
                                                    border: 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                                }}
                                            >
                                                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                                                {getLabel(widgetKey)}
                                            </button>

                                            {/* Reorder Buttons (Kept as accessible fallback / precise control) */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <button
                                                    onClick={() => dispatch({ type: actions.MOVE_WIDGET, payload: { index, direction: -1 } })}
                                                    disabled={index === 0}
                                                    style={{
                                                        background: 'var(--white-a10)', border: 'none', borderRadius: '4px',
                                                        color: index === 0 ? 'var(--white-a10)' : 'var(--text-sub)',
                                                        cursor: index === 0 ? 'default' : 'pointer',
                                                        padding: '2px 6px', fontSize: '0.6rem'
                                                    }}
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    onClick={() => dispatch({ type: actions.MOVE_WIDGET, payload: { index, direction: 1 } })}
                                                    disabled={index === (settings.widgetOrder ? settings.widgetOrder.length : 5) - 1}
                                                    style={{
                                                        background: 'var(--white-a10)', border: 'none', borderRadius: '4px',
                                                        color: index === (settings.widgetOrder ? settings.widgetOrder.length : 5) - 1 ? 'var(--white-a10)' : 'var(--text-sub)',
                                                        cursor: index === (settings.widgetOrder ? settings.widgetOrder.length : 5) - 1 ? 'default' : 'pointer',
                                                        padding: '2px 6px', fontSize: '0.6rem'
                                                    }}
                                                >
                                                    ▼
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => dispatch({ type: 'REORDER_WIDGETS', payload: ['timer', 'calendar', 'tasks', 'dictionary', 'sound', 'flashcard'] })}
                                style={{
                                    background: 'transparent', border: '1px solid var(--text-sub)',
                                    color: 'var(--text-sub)', borderRadius: '4px',
                                    padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer'
                                }}
                            >
                                レイアウトをリセット
                            </button>
                        </div>



                        <h3 style={{ fontSize: '1rem', marginBottom: '16px', textAlign: 'left', color: 'var(--text-sub)' }}>{t.profileImage}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '80px', height: '80px',
                                borderRadius: '50%', background: 'var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 'bold', fontSize: '2rem',
                                overflow: 'hidden', border: '2px solid var(--card-border)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {settings.userIcon ? (
                                    <img src={settings.userIcon} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    "🐧"
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="glass-button"
                                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                            >
                                <Upload size={16} />
                                {t.changeImage}
                            </button>
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'left' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '4px', display: 'block' }}>{t.birthday}</label>
                            <input
                                type="date"
                                className="glass-button"
                                style={{ width: '100%', padding: '12px', cursor: 'pointer' }}
                                value={settings.birthday || ''}
                                onChange={(e) => dispatch({ type: actions.UPDATE_BIRTHDAY, payload: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* History Section */}
                    <section>
                        <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={18} />
                            {t.studyHistory}
                        </h3>

                        {completedTasks.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)', background: 'var(--white-a10)', borderRadius: '16px', whiteSpace: 'pre-wrap' }}>
                                {t.noHistory}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {completedTasks.map(task => (
                                    <div key={task.id} className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: 'var(--status-ok)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                                        }}>
                                            <Trophy size={16} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{task.title}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                                {task.total} {task.unit} 達成
                                            </p>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', textAlign: 'right' }}>
                                            {t.completedDate}<br />
                                            {formatDate(task.completedAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div >
        </div >

    );
}
