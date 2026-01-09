import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Trash2, TriangleAlert, RefreshCw, Pencil } from 'lucide-react';
import { getDays } from '../lib/coreLogic';
import { TaskForm } from './TaskForm';
import { ConfirmModal } from './ConfirmModal';
import { translations } from '../lib/translations';

function determineStatus(task, mode) {
    if (!task.plan) return 'ok';

    const today = new Date().toISOString().split('T')[0];
    const days = Object.keys(task.plan).sort();
    const pastDays = days.filter(d => d <= today);

    const ideal = pastDays.reduce((sum, d) => sum + task.plan[d], 0);
    const delay = ideal - task.done;
    const delayRate = delay / task.total;

    if (delayRate > 0.25) return 'danger';
    if (delayRate > 0.10) return 'warn';
    return 'ok';
}

export function TaskList() {
    const { state, dispatch, actions } = useStore();
    const { tasks, settings } = state;
    const t = translations[settings.language || 'ja'];
    const [editingTask, setEditingTask] = useState(null);
    const [confirmState, setConfirmState] = useState(null); // { message, onConfirm, confirmText, confirmColor }

    const handleDelete = (id) => {
        setConfirmState({
            message: t.deleteConfirm,
            confirmText: t.delete,
            confirmColor: 'var(--status-risk)',
            onConfirm: () => dispatch({ type: actions.DELETE_TASK, payload: id })
        });
    };

    const handleReplan = (id) => {
        setConfirmState({
            message: t.replanConfirm,
            confirmText: t.replan,
            confirmColor: 'var(--accent)',
            onConfirm: () => dispatch({ type: actions.REPLAN_TASK, payload: id })
        });
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>{t.allTasks}</h2>

            {tasks.length === 0 ? (
                <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', opacity: 0.7 }}>
                    <p>{t.noTasksToday}</p>
                </div>
            ) : (
                tasks.filter(t => !t.isDeleted).map(task => {
                    const status = determineStatus(task, settings.mode);
                    const progress = task.total > 0 ? Math.min(100, Math.floor((task.done / task.total) * 100)) : 0;

                    let statusColor = 'var(--status-ok)';
                    if (status === 'warn') statusColor = 'var(--status-warn)';
                    if (status === 'danger') statusColor = 'var(--status-risk)';

                    return (
                        <div key={task.id} className="glass-panel" style={{
                            marginBottom: '16px', padding: '16px',
                            borderLeft: `6px solid ${task.color || 'var(--white-a50)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{task.title}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                        締切: {task.dueDate}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setEditingTask(task)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(task.id);
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                    <span>{progress}%</span>
                                    <span>{task.done} / {task.total} {task.unit}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${progress}%`,
                                        height: '100%',
                                        background: statusColor,
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            {status !== 'ok' && (
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: statusColor }}>
                                        <TriangleAlert size={14} />
                                        <span>
                                            {status === 'danger' ? t.statusDanger : t.statusWarn}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleReplan(task.id)}
                                        className="glass-button"
                                        style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--white-a50)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <RefreshCw size={12} />
                                        {t.replan}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {editingTask && (
                <TaskForm
                    initialTask={editingTask}
                    onClose={() => setEditingTask(null)}
                />
            )}

            {confirmState && (
                <ConfirmModal
                    isOpen={!!confirmState}
                    onClose={() => setConfirmState(null)}
                    onConfirm={confirmState.onConfirm}
                    message={confirmState.message}
                    confirmText={confirmState.confirmText}
                    confirmColor={confirmState.confirmColor}
                />
            )}
        </div>
    );
}
