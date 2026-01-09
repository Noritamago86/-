import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Play, Pause, RotateCcw, Timer, Watch, ChevronDown, ChevronRight } from 'lucide-react';
import { translations } from '../lib/translations';

export function TimerWidget() {
    const { state, dispatch, actions } = useStore();
    const t = translations[state.settings.language || 'ja'];
    const { collapsedWidgets } = state.settings;
    const isCollapsed = collapsedWidgets?.timer ?? false;

    const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'timer'
    const [time, setTime] = useState(0); // in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [initialTime, setInitialTime] = useState(0); // for timer reset
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prev => {
                    if (mode === 'timer' || mode === 'pomodoro') {
                        if (prev <= 1) {
                            setIsRunning(false);
                            // Auto-transition logic for Pomodoro could go here?
                            // For now simple stop.
                            return 0;
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, mode]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTime((mode === 'timer' || mode === 'pomodoro') ? initialTime : 0);
    };

    const addTime = (minutes) => {
        const addSec = minutes * 60;
        if (mode === 'timer') {
            const newTime = time + addSec;
            setTime(newTime);
            setInitialTime(newTime);
        }
    };

    const switchMode = (newMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTime(0);
        setInitialTime(0);
    };

    const toggleCollapse = () => {
        dispatch({ type: actions.TOGGLE_COLLAPSE, payload: { timer: !isCollapsed } });
    };

    return (
        <div className="glass-panel" style={{ padding: '0', marginBottom: '24px', overflow: 'hidden' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-sub)' }}>
                    <Timer size={16} />
                    {mode === 'stopwatch' ? t.stopwatch : t.timer}
                </div>
                {isCollapsed ? <ChevronRight size={18} color="var(--text-sub)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
            </div>

            {!isCollapsed && (
                <div style={{ padding: '16px' }}>
                    {/* Header / Tabs */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <button
                            onClick={() => switchMode('stopwatch')}
                            style={{
                                background: 'none', border: 'none',
                                color: mode === 'stopwatch' ? 'var(--accent)' : 'var(--text-sub)',
                                fontWeight: mode === 'stopwatch' ? 'bold' : 'normal',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <Watch size={14} />
                            {t.stopwatch}
                        </button>
                        <div style={{ width: '1px', background: 'var(--text-sub)', opacity: 0.3 }}></div>
                        <button
                            onClick={() => switchMode('timer')}
                            style={{
                                background: 'none', border: 'none',
                                color: mode === 'timer' ? 'var(--accent)' : 'var(--text-sub)',
                                fontWeight: mode === 'timer' ? 'bold' : 'normal',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <Timer size={14} />
                            {t.timer}
                        </button>
                        <div style={{ width: '1px', background: 'var(--text-sub)', opacity: 0.3 }}></div>
                        <button
                            onClick={() => {
                                switchMode('pomodoro');
                                setTime(25 * 60);
                                setInitialTime(25 * 60);
                            }}
                            style={{
                                background: 'none', border: 'none',
                                color: mode === 'pomodoro' ? 'var(--accent)' : 'var(--text-sub)',
                                fontWeight: mode === 'pomodoro' ? 'bold' : 'normal',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                        >
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'tomato' }}></div>
                            {t.pomodoro}
                        </button>
                    </div>

                    {/* Time Display */}
                    <div style={{ textAlign: 'center', position: 'relative', padding: '12px 0' }}>
                        <div style={{
                            fontSize: '3.5rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            lineHeight: 1,
                            fontVariantNumeric: 'tabular-nums',
                            color: mode === 'pomodoro' && time > 0 && initialTime === 5 * 60 ? '#4ECDC4' : 'inherit'
                        }}>
                            {formatTime(time)}
                        </div>

                        {(mode === 'timer' || mode === 'pomodoro') && initialTime > 0 && (
                            <div style={{
                                height: '4px', width: '100%',
                                background: 'rgba(0,0,0,0.1)',
                                marginTop: '8px', borderRadius: '2px', overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%', width: `${(time / initialTime) * 100}%`,
                                    background: mode === 'pomodoro' && initialTime === 5 * 60 ? '#4ECDC4' : 'var(--accent)',
                                    transition: 'width 1s linear'
                                }} />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                        <button
                            onClick={toggleTimer}
                            className="glass-button"
                            style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: isRunning ? 'var(--white-a20)' : 'var(--accent)',
                                color: isRunning ? 'var(--text-main)' : '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {isRunning ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                        </button>

                        <button
                            onClick={resetTimer}
                            className="glass-button"
                            style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>

                    {/* Timer Presets */}
                    {mode === 'timer' && !isRunning && time === 0 && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                            <button onClick={() => addTime(5)} className="glass-button" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>+5分</button>
                            <button onClick={() => addTime(15)} className="glass-button" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>+15分</button>
                            <button onClick={() => addTime(30)} className="glass-button" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>+30分</button>
                        </div>
                    )}

                    {/* Pomodoro Presets */}
                    {mode === 'pomodoro' && !isRunning && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                            <button
                                onClick={() => {
                                    setTime(25 * 60);
                                    setInitialTime(25 * 60);
                                    setIsRunning(false);
                                }}
                                className="glass-button"
                                style={{
                                    padding: '4px 12px',
                                    background: initialTime === 25 * 60 ? 'var(--accent)' : 'transparent',
                                    color: initialTime === 25 * 60 ? '#fff' : 'var(--text-sub)'
                                }}
                            >
                                {t.focus}
                            </button>
                            <button
                                onClick={() => {
                                    setTime(5 * 60);
                                    setInitialTime(5 * 60);
                                    setIsRunning(false);
                                }}
                                className="glass-button"
                                style={{
                                    padding: '4px 12px',
                                    background: initialTime === 5 * 60 ? '#4ECDC4' : 'transparent',
                                    color: initialTime === 5 * 60 ? '#fff' : 'var(--text-sub)'
                                }}
                            >
                                {t.shortBreak}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
