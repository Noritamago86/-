import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { LayoutDashboard, Menu, X, ChevronDown, ChevronRight, Target, ListTodo } from 'lucide-react';
import { translations } from '../lib/translations';
import { THEMES } from '../lib/constants';

import { UserMenu } from './UserMenu';

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

function GoalItem({ goal, onUpdate, onDelete }) {
    const { state } = useStore();
    const t = translations[state.settings.language || 'ja'];
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(goal.text);
    const [showColorPicker, setShowColorPicker] = React.useState(false);

    const handleSave = () => {
        onUpdate({ ...goal, text: editValue });
        setIsEditing(false);
    };

    return (
        <div className="glass-panel" style={{
            padding: '16px',
            borderLeft: `6px solid ${goal.color || 'var(--accent)'}`,
            display: 'flex', alignItems: 'center', gap: '12px',
            position: 'relative',
            zIndex: showColorPicker ? 10 : 1 // Bring to front when picker is open
        }}>
            {isEditing ? (
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={t.goalPlaceholder}
                        autoFocus
                        style={{
                            flex: 1, background: 'var(--white-a20)', border: 'none',
                            padding: '4px 8px', borderRadius: '4px', color: 'var(--text-main)', fontSize: '1rem'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <button onClick={handleSave} className="glass-button" style={{ padding: '4px 12px' }}>{t.ok}</button>
                    <button onClick={onDelete} className="glass-button" style={{ padding: '4px 12px', color: 'var(--status-risk)' }}>{t.delete}</button>
                </div>
            ) : (
                <>
                    <div
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: goal.color, border: '2px solid rgba(255,255,255,0.5)', cursor: 'pointer',
                            flexShrink: 0
                        }}
                    />

                    {showColorPicker && (
                        <div className="glass-panel" style={{
                            position: 'absolute', top: '48px', left: '0', zIndex: 50,
                            padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', width: '200px'
                        }}>
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        onUpdate({ ...goal, color: c });
                                        setShowColorPicker(false);
                                    }}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: c, border: 'none', cursor: 'pointer',
                                        transform: goal.color === c ? 'scale(1.2)' : 'scale(1)'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div
                        onClick={() => setIsEditing(true)}
                        style={{ flex: 1, fontWeight: 600, cursor: 'text', fontSize: '1rem' }}
                    >
                        {goal.text || <span style={{ opacity: 0.5 }}>{t.goalPlaceholder}</span>}
                    </div>
                </>
            )}
        </div>
    );
}

export function Layout({ children }) {
    const { state, dispatch, actions } = useStore();
    const { mode } = state.settings;
    const t = translations[state.settings.language || 'ja'];
    const currentView = state.view;
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    const toggleMode = () => {
        const newMode = mode === 'gentle' ? 'strict' : 'gentle';
        dispatch({ type: actions.CHANGE_MODE, payload: newMode });
    };

    // ... existing setView ...

    const setView = (view) => {
        dispatch({ type: actions.CHANGE_VIEW, payload: view });
    };

    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);



    const formatDate = (date) => {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const day = days[date.getDay()];
        return `${y}年${m}月${d}日 (${day})`;
    };

    // ... earlier code ...

    const formatTime = (date) => {
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };

    // Birthday Logic
    const isBirthday = React.useMemo(() => {
        if (!state.settings.birthday) return false;
        const today = new Date();
        const birth = new Date(state.settings.birthday);
        return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
    }, [state.settings.birthday, time]); // re-check if time day changes (though time updates every sec, memo is cheap)

    return (
        <div className="container">
            {/* Birthday Background Overlay */}
            {isBirthday && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: -1,
                    backgroundImage: 'url(/birthday_bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.8
                }} />
            )}

            {/* Header */}
            <header className="glass-panel" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                marginBottom: '16px',
                position: 'sticky',
                top: '20px',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => setShowUserMenu(true)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0
                        }}
                    >
                        <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '50%', background: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 'bold', overflow: 'hidden'
                        }}>
                            {state.settings.userIcon ? (
                                <img src={state.settings.userIcon} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                "🐧"
                            )}
                        </div>
                    </button>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.appTitle}</h1>
                </div>

                <button
                    onClick={toggleMode}
                    className="glass-button"
                    style={{
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}
                >
                    {mode === 'gentle' ? t.gentleMode : t.strictMode}
                </button>
            </header>

            {/* Goal & Time Section */}
            <section style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    marginBottom: '12px', padding: '0 8px'
                }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)', fontWeight: 500 }}>
                        {formatDate(time)}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
                        {formatTime(time)}
                    </div>
                </div>

                {/* Goals Area */}

                {state.settings.visibleWidgets?.goals !== false && (
                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '8px' }}>
                        <div
                            onClick={() => dispatch({ type: actions.TOGGLE_COLLAPSE, payload: { goals: !state.settings.collapsedWidgets?.goals } })}
                            style={{
                                padding: '12px 16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: 'pointer',
                                background: 'rgba(255,255,255,0.05)',
                                borderBottom: state.settings.collapsedWidgets?.goals ? 'none' : '1px solid var(--white-a10)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                                <Target size={16} />
                                {state.settings.collapsedWidgets?.goals ? t.goalsOff : t.goalsOn}
                            </div>
                            {state.settings.collapsedWidgets?.goals ? <ChevronRight size={18} color="var(--text-sub)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
                        </div>

                        {!state.settings.collapsedWidgets?.goals && (
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(state.settings.goals || []).map((goal, index) => (
                                    <GoalItem
                                        key={goal.id || index}
                                        goal={goal}
                                        onUpdate={(updated) => {
                                            const newGoals = [...state.settings.goals];
                                            newGoals[index] = updated;
                                            dispatch({ type: actions.UPDATE_GOALS, payload: newGoals });
                                        }}
                                        onDelete={() => {
                                            const newGoals = state.settings.goals.filter((_, i) => i !== index);
                                            dispatch({ type: actions.UPDATE_GOALS, payload: newGoals });
                                        }}
                                    />
                                ))}

                                {(state.settings.goals || []).length < 3 && (
                                    <button
                                        onClick={() => {
                                            const newGoal = {
                                                id: crypto.randomUUID(),
                                                text: '',
                                                color: 'var(--accent)'
                                            };
                                            const newGoals = [...(state.settings.goals || []), newGoal];
                                            dispatch({ type: actions.UPDATE_GOALS, payload: newGoals });
                                        }}
                                        className="glass-button"
                                        style={{
                                            width: '100%', padding: '12px',
                                            borderStyle: 'dashed', opacity: 0.7,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>+</span> {t.addGoal} ({t.remainingGoals.replace('{count}', 3 - (state.settings.goals || []).length)})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Tabs / Nav */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => setView('dashboard')}
                    className="glass-button"
                    style={{
                        flex: 1, padding: '12px',
                        background: currentView === 'dashboard' ? 'var(--white-a50)' : 'transparent',
                        fontWeight: currentView === 'dashboard' ? 'bold' : 'normal',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    <LayoutDashboard size={20} />
                    {t.todaySchedule}
                </button>
                <button
                    onClick={() => setView('list')}
                    className="glass-button"
                    style={{
                        flex: 1, padding: '12px',
                        background: currentView === 'list' ? 'var(--white-a50)' : 'transparent',
                        fontWeight: currentView === 'list' ? 'bold' : 'normal',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    <ListTodo size={20} />
                    {t.allTasks}
                </button>
            </div>

            {/* Main Content */}
            <main style={{ flex: 1, position: 'relative' }}>
                {children}
            </main>

            {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}
        </div>
    );
}
