import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { Calendar as CalendarIcon, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { translations } from '../lib/translations';

export function CalendarWidget() {
    const { state, dispatch, actions } = useStore();
    const { settings, activityLog = [] } = state;
    const { collapsedWidgets = {} } = settings;
    const t = translations[settings.language || 'ja'];

    const isCollapsed = collapsedWidgets.calendar || false;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    // Calculate days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

    // Generate calendar grid
    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Days actual
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', animation: 'fadeIn 0.5s ease-out' }}>
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isCollapsed ? 0 : '16px', cursor: 'pointer' }}
                onClick={() => dispatch({ type: actions.TOGGLE_COLLAPSE, payload: { calendar: !isCollapsed } })}
            >
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                    <CalendarIcon size={20} color="var(--accent)" />
                    {t.streakCalendar || "Study Streak"}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                        <Flame size={16} color={activityLog.length > 0 ? "var(--status-warn)" : "var(--text-sub)"} />
                        {activityLog.length} Days
                    </div>
                    {isCollapsed ? <ChevronDown size={20} color="var(--text-sub)" /> : <ChevronUp size={20} color="var(--text-sub)" />}
                </div>
            </div>

            {!isCollapsed && (
                <>
                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                        {/* Headers */}
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ fontSize: '0.8rem', color: 'var(--text-sub)', paddingBottom: '8px' }}>{d}</div>
                        ))}

                        {/* Days */}
                        {days.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} />;

                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isActive = activityLog.includes(dateStr);
                            const isToday = day === today.getDate();

                            return (
                                <div
                                    key={day}
                                    style={{
                                        aspectRatio: '1/1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        background: isActive ? 'var(--accent)' : (isToday ? 'var(--white-a10)' : 'transparent'),
                                        color: isActive ? 'var(--bg-primary)' : 'var(--text-main)',
                                        fontWeight: isActive || isToday ? 'bold' : 'normal',
                                        border: isToday && !isActive ? '1px solid var(--accent)' : 'none',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                        {currentYear} / {monthNames[currentMonth]}
                    </div>
                </>
            )}
        </div>
    );
}
