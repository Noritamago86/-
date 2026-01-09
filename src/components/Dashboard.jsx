import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { TimerWidget } from './TimerWidget';
import { DictionaryWidget } from './DictionaryWidget';
import { SoundWidget } from './SoundWidget';
import { FlashcardWidget } from './FlashcardWidget';
import { CalendarWidget } from './CalendarWidget';
import { TaskWidget } from './TaskWidget';
import { MODES } from '../lib/constants';
import { translations } from '../lib/translations';

export function Dashboard() {
    const { state } = useStore();
    const { tasks, settings } = state;
    const t = translations[settings.language || 'ja'];

    const todayStr = new Date().toISOString().split('T')[0];

    if (!state || !tasks || !settings) {
        return <div className="glass-panel" style={{ padding: '24px' }}>Loading...</div>;
    }

    const modeConfig = MODES[settings.mode];
    if (!modeConfig) return <div className="glass-panel" style={{ padding: '24px' }}>Mode Error</div>;

    // Calculate Summary Stats for Header
    const todayTasks = tasks.filter(t => {
        const planned = t.plan ? t.plan[todayStr] : 0;
        // Simple filter for summary: has plan or is completed today
        return (planned > 0 && !t.isDeleted) || (t.completedAt && t.completedAt.startsWith(todayStr));
    });

    // We can just define total volume broadly or re-use logic if consistent
    // For now, let's keep the greeting simple. 
    // If strict exact stats are needed, we can duplicate the filter logic or extract it to a helper. 
    // Given the widget handles the list, the dashboard just shows the greeting.

    const activeTasksCount = todayTasks.length;
    const totalVolume = todayTasks.reduce((sum, t) => sum + (t.plan?.[todayStr] || 0), 0);

    return (
        <div style={{ paddingBottom: '80px' }}>

            {/* Greeting / Status */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {activeTasksCount > 0 ? (settings.language === 'en' ? (modeConfig.copy.ok === "今日も1日頑張りましょう！" ? "Let's do your best today!" : "Push yourself hard today!") : modeConfig.copy.ok) : t.noTasksToday}
                </h2>
                <p style={{ color: 'var(--text-sub)' }}>
                    {t.todayTasks}: {activeTasksCount} ({t.totalVolume}: {totalVolume})
                </p>
            </div>

            {/* Dynamic Widgets */}
            {(settings.widgetOrder || ['timer', 'calendar', 'tasks', 'dictionary', 'sound', 'flashcard']).map(widgetKey => {
                if (settings.visibleWidgets?.[widgetKey] === false) return null;

                switch (widgetKey) {
                    case 'timer': return <TimerWidget key="timer" />;
                    case 'calendar': return <CalendarWidget key="calendar" />;
                    case 'tasks': return <TaskWidget key="tasks" />;
                    case 'dictionary': return <DictionaryWidget key="dictionary" />;
                    case 'sound': return <SoundWidget key="sound" />;
                    case 'flashcard': return <FlashcardWidget key="flashcard" />;
                    default: return null;
                }
            })}
        </div>
    );
}
