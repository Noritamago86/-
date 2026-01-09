import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { X } from 'lucide-react';
import { TIME_UNITS, TASK_COLORS } from '../lib/constants';

// Simple Modal Wrapper inline for speed, or separate component
function Modal({ children, onClose }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <div
                className="glass-panel animate-fade-in"
                style={{ width: '90%', maxWidth: '400px', padding: '24px', background: 'var(--bg-primary)' }}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

export function TaskForm({ onClose, initialTask = null }) {
    const { dispatch, actions, state } = useStore();
    const [form, setForm] = useState({
        title: initialTask?.title || '',
        total: initialTask?.total || '',
        unit: initialTask?.unit || 'page',
        dueDate: initialTask?.dueDate || '',
        color: initialTask?.color || TASK_COLORS[7] // Default Gray
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.total || !form.dueDate) return;

        if (initialTask) {
            dispatch({
                type: actions.UPDATE_TASK,
                payload: {
                    id: initialTask.id,
                    updates: {
                        title: form.title,
                        total: parseInt(form.total, 10),
                        unit: form.unit,
                        dueDate: form.dueDate,
                        color: form.color
                    }
                }
            });
        } else {
            dispatch({
                type: actions.ADD_TASK,
                payload: {
                    title: form.title,
                    total: parseInt(form.total, 10),
                    unit: form.unit,
                    dueDate: form.dueDate,
                    color: form.color
                }
            });
        }
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem' }}>{initialTask ? 'タスクを編集' : '新しいタスク'}</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)' }}>
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '4px' }}>タスク名</label>
                    <input
                        type="text"
                        className="glass-button" // Reuse style for input
                        style={{ width: '100%', textAlign: 'left', cursor: 'text', padding: '12px' }}
                        placeholder="例：数学ワーク P10-40"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '4px' }}>量</label>
                        <input
                            type="number"
                            className="glass-button"
                            style={{ width: '100%', textAlign: 'left', cursor: 'text', padding: '12px' }}
                            value={form.total}
                            onChange={e => setForm({ ...form, total: e.target.value })}
                            required
                            min="1"
                        />
                    </div>
                    <div style={{ width: '100px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '4px' }}>単位</label>
                        <select
                            className="glass-button"
                            style={{ width: '100%', padding: '12px' }}
                            value={form.unit}
                            onChange={e => setForm({ ...form, unit: e.target.value })}
                        >
                            {TIME_UNITS.map(u => (
                                <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '4px' }}>いつまでに？</label>
                    <input
                        type="date"
                        className="glass-button"
                        style={{ width: '100%', textAlign: 'left', cursor: 'text', padding: '12px' }}
                        value={form.dueDate}
                        onChange={e => setForm({ ...form, dueDate: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Suggestion / Preview Area could go here */}

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '4px' }}>ラベルカラー</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {TASK_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setForm({ ...form, color })}
                                style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    background: color,
                                    border: form.color === color ? '3px solid var(--text-main)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="glass-button"
                    style={{
                        marginTop: '8px',
                        background: 'var(--accent)',
                        color: '#fff',
                        fontWeight: 'bold',
                        border: 'none'
                    }}
                >
                    {initialTask ? '変更を保存' : '計画を作成'}
                </button>
            </form>
        </Modal>
    );
}
