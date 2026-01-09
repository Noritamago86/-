import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Plus, Check, RotateCcw, Trash2, ChevronDown, ChevronRight, List } from 'lucide-react';
import { calculatePlan, getDays } from '../lib/coreLogic';
import { translations } from '../lib/translations';
import { TaskForm } from './TaskForm';
import { ConfirmModal } from './ConfirmModal';
import { MODES } from '../lib/constants';

function TaskItem({ task, todayTarget, onDone, onUndo, onDelete, isCompleted, doneToday, t }) {
    const { unit, title } = task;

    if (todayTarget <= 0 && !isCompleted && doneToday === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="glass-panel" style={{
            marginBottom: '12px', padding: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            opacity: 1,
            transition: 'all 0.5s',
            borderLeft: `6px solid ${task.color || 'var(--white-a50)'}`,
            background: isCompleted ? 'var(--white-a30)' : undefined
        }}>
            {isCompleted ? (
                <>
                    <div style={{ flex: 1, textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            background: 'linear-gradient(45deg, #FF6B6B, #F6AD55)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            頑張ったね！えらい！
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                            {t.todayTarget} ({todayTarget} {unit})
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => onUndo(task.id, todayTarget)}
                            className="glass-button"
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--white-a50)',
                                color: 'var(--text-sub)',
                                border: 'none'
                            }}
                            title="元に戻す"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: daysRemaining < 3 ? 'var(--status-risk)' : 'var(--white-a20)',
                                color: daysRemaining < 3 ? '#fff' : 'var(--text-sub)',
                                fontWeight: 'bold'
                            }}>
                                {t.daysRemaining.replace('{days}', daysRemaining)}
                            </span>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                            {t.todayTarget}: {todayTarget} {unit}
                            {task.strictDiff > 0 && (
                                <span style={{ color: 'var(--status-risk)', marginLeft: '8px', fontWeight: 'bold' }}>
                                    (+{task.strictDiff})
                                </span>
                            )}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {doneToday > 0 && (
                            <button
                                onClick={() => onUndo(task.id)}
                                className="glass-button"
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--white-a30)',
                                    color: 'var(--text-sub)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                title="1回分戻す"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}

                        <button
                            onClick={() => onDone(task.id, todayTarget)}
                            className="glass-button"
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent',
                                color: 'var(--text-main)',
                                border: '1px solid var(--text-sub)',
                                cursor: 'pointer'
                            }}
                            title="完了"
                        >
                            <Check size={24} />
                        </button>

                        <button
                            onClick={() => onDelete(task.id)}
                            className="glass-button"
                            style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'var(--white-a20)',
                                color: 'var(--text-sub)',
                                border: 'none',
                                marginLeft: '4px',
                                cursor: 'pointer'
                            }}
                            title="削除"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export function TaskWidget() {
    const { state, dispatch, actions } = useStore();
    const { tasks, settings, logs } = state;
    const t = translations[settings.language || 'ja']; // Outer t (translations)
    const { collapsedWidgets } = settings;
    const isCollapsed = collapsedWidgets?.tasks ?? false;

    const [showForm, setShowForm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const todayStr = new Date().toISOString().split('T')[0];

    // Derive Today's Tasks
    // Fixed Shadowing: iteration variable renamed from t to taskItem
    const todayTasks = tasks.map(taskItem => {
        const planned = taskItem.plan ? taskItem.plan[todayStr] : 0;
        let diff = 0;
        if (settings.mode === 'strict' && planned > 0) {
            const days = getDays(todayStr, taskItem.dueDate);
            const remain = taskItem.total - taskItem.done;
            if (remain > 0 && days.length > 0) {
                const gentleMap = calculatePlan(remain, days, 'gentle');
                const gentleTarget = gentleMap[todayStr] || 0;
                if (planned > gentleTarget) {
                    diff = planned - gentleTarget;
                }
            }
        }
        const doneToday = logs
            .filter(l => l.taskId === taskItem.id && l.date === todayStr)
            .reduce((sum, l) => sum + l.amount, 0);

        const isCompleted = doneToday >= planned && planned > 0;

        return { ...taskItem, todayTarget: planned, strictDiff: diff, isCompleted, doneToday };
    }).filter(taskItem => !taskItem.isDeleted && (taskItem.todayTarget > 0 || taskItem.isCompleted || taskItem.doneToday > 0));

    const handleDone = (taskId, amount) => {
        dispatch({
            type: actions.UPDATE_PROGRESS,
            payload: { taskId, date: todayStr, amount }
        });
    };

    const handleUndo = (taskId) => {
        dispatch({
            type: actions.UNDO_PROGRESS,
            payload: { taskId, date: todayStr }
        });
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            dispatch({ type: actions.DELETE_TASK, payload: deleteTargetId });
            setDeleteTargetId(null);
        }
    };

    const toggleCollapse = () => {
        dispatch({ type: actions.TOGGLE_COLLAPSE, payload: { tasks: !isCollapsed } });
    };

    return (
        <div style={{ marginBottom: '24px' }}> {/* Wrapper Div for Layout Safety */}

            {/* The Widget Content - Glass Panel */}
            <div className="glass-panel" style={{
                padding: '0',
                background: 'rgba(255, 255, 255, 0.05)',
                overflow: 'hidden' // Re-enabled hidden for header containment, safe now
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={16} />
                        <span>{todayTasks.length > 0 ? t.todayTasks : t.noTasksToday}</span>
                    </div>
                    {isCollapsed ? <ChevronRight size={18} color="var(--text-sub)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
                </div>

                {!isCollapsed && (
                    <div style={{ padding: '16px' }}>
                        <div>
                            {todayTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    todayTarget={task.todayTarget}
                                    doneToday={task.doneToday}
                                    isCompleted={task.isCompleted}
                                    onDone={handleDone}
                                    onUndo={() => handleUndo(task.id)}
                                    onDelete={setDeleteTargetId}
                                    t={t}
                                />
                            ))}

                            {todayTasks.length === 0 && (
                                <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', opacity: 0.7 }}>
                                    <p>{t.letsStart}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowForm(true)}
                style={{
                    position: 'fixed', bottom: '24px', right: '24px',
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 1000
                }}
            >
                <Plus size={32} />
            </button>

            {showForm && <TaskForm onClose={() => setShowForm(false)} />}

            {
                deleteTargetId && (
                    <ConfirmModal
                        isOpen={!!deleteTargetId}
                        onClose={() => setDeleteTargetId(null)}
                        onConfirm={confirmDelete}
                        message={t.deleteConfirm}
                        confirmText={t.delete}
                        confirmColor="var(--status-risk)"
                    />
                )
            }
        </div>
    );
}
