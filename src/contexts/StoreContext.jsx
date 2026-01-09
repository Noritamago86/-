import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Storage } from '../lib/storage';
import { calculatePlan, getDays } from '../lib/coreLogic.js';
import { MODES, THEMES, FONTS } from '../lib/constants.js';

const StoreContext = createContext();

const ACTION_TYPES = {
    INIT: 'INIT',
    ADD_TASK: 'ADD_TASK',
    UPDATE_PROGRESS: 'UPDATE_PROGRESS',
    CHANGE_MODE: 'CHANGE_MODE',
    DELETE_TASK: 'DELETE_TASK',
    CHANGE_VIEW: 'CHANGE_VIEW',
    REPLAN_TASK: 'REPLAN_TASK',
    UPDATE_TASK: 'UPDATE_TASK',
    UPDATE_GOALS: 'UPDATE_GOALS',
    UPDATE_USER_ICON: 'UPDATE_USER_ICON',
    UPDATE_BIRTHDAY: 'UPDATE_BIRTHDAY',
    UNDO_PROGRESS: 'UNDO_PROGRESS',
    CHANGE_LANGUAGE: 'CHANGE_LANGUAGE',
    TOGGLE_WIDGET: 'TOGGLE_WIDGET',
    TOGGLE_COLLAPSE: 'TOGGLE_COLLAPSE',
    UPDATE_VOCAB: 'UPDATE_VOCAB',
    CHANGE_THEME: 'CHANGE_THEME',
    CHANGE_FONT: 'CHANGE_FONT',
    MOVE_WIDGET: 'MOVE_WIDGET'
};

function reducer(state, action) {
    let newState = { ...state };

    switch (action.type) {
        case ACTION_TYPES.INIT:
            return action.payload;

        case ACTION_TYPES.CHANGE_VIEW:
            newState.view = action.payload;
            break;

        case ACTION_TYPES.CHANGE_MODE:
            newState.settings = { ...newState.settings, mode: action.payload };
            // Always replan based on new mode
            newState.tasks = newState.tasks.map(task => {
                const days = getDays(new Date().toISOString().split('T')[0], task.dueDate);
                const remain = Math.max(0, task.total - task.done);
                const newPlan = calculatePlan(remain, days, action.payload);
                return { ...task, plan: newPlan };
            });
            break;

        case ACTION_TYPES.UPDATE_GOALS:
            newState.settings = { ...newState.settings, goals: action.payload };
            break;

        case ACTION_TYPES.UPDATE_USER_ICON:
            newState.settings = { ...newState.settings, userIcon: action.payload };
            break;

        case ACTION_TYPES.UPDATE_BIRTHDAY:
            newState.settings = { ...newState.settings, birthday: action.payload };
            break;

        case ACTION_TYPES.CHANGE_LANGUAGE:
            newState.settings = { ...newState.settings, language: action.payload };
            break;

        case ACTION_TYPES.TOGGLE_WIDGET:
            newState.settings = {
                ...newState.settings,
                visibleWidgets: { ...newState.settings.visibleWidgets, ...action.payload }
            };
            break;

        case ACTION_TYPES.TOGGLE_COLLAPSE:
            newState.settings = {
                ...newState.settings,
                collapsedWidgets: { ...newState.settings.collapsedWidgets, ...action.payload }
            };
            break;

        case ACTION_TYPES.UPDATE_VOCAB:
            newState.settings = { ...newState.settings, vocab: action.payload };
            break;

        case ACTION_TYPES.CHANGE_THEME:
            newState.settings = { ...newState.settings, theme: action.payload };
            break;

        case 'CHANGE_FONT':
            newState.settings = { ...newState.settings, font: action.payload };
            break;

            {
                const { index, direction } = action.payload; // direction: -1 (up) or 1 (down)
                const newOrder = [...(newState.settings.widgetOrder || ['timer', 'calendar', 'tasks', 'dictionary', 'sound', 'flashcard'])];

                if (direction === -1 && index > 0) {
                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                } else if (direction === 1 && index < newOrder.length - 1) {
                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                }

                newState.settings = { ...newState.settings, widgetOrder: newOrder };
            }
            break;

        case 'REORDER_WIDGETS':
            newState.settings = { ...newState.settings, widgetOrder: action.payload };
            break;

        case ACTION_TYPES.ADD_TASK:
            {
                const task = {
                    id: crypto.randomUUID(),
                    done: 0,
                    createdAt: new Date().toISOString(),
                    ...action.payload
                };
                const days = getDays(new Date().toISOString().split('T')[0], task.dueDate);
                task.plan = calculatePlan(task.total, days, newState.settings.mode);
                newState.tasks = [...newState.tasks, task];
            }
            break;

        case ACTION_TYPES.UPDATE_TASK:
            {
                const { id, updates } = action.payload;
                const taskIndex = newState.tasks.findIndex(t => t.id === id);
                if (taskIndex === -1) break;

                const oldTask = newState.tasks[taskIndex];
                const updatedTask = { ...oldTask, ...updates };

                // If critical fields changed, replan
                if (updates.total !== undefined || updates.dueDate !== undefined) {
                    const days = getDays(new Date().toISOString().split('T')[0], updatedTask.dueDate);
                    // Ensure done doesn't exceed new total effectively (logic choice: keep done as is, just plan remaining)
                    const remain = Math.max(0, updatedTask.total - updatedTask.done);
                    const newPlan = calculatePlan(remain, days, newState.settings.mode);
                    updatedTask.plan = newPlan;
                }

                newState.tasks[taskIndex] = updatedTask;
            }
            break;

        case ACTION_TYPES.UPDATE_PROGRESS:
            {
                const { taskId, amount, date } = action.payload;
                const taskIndex = newState.tasks.findIndex(t => t.id === taskId);
                if (taskIndex === -1) break;

                const task = newState.tasks[taskIndex];
                // Cap progress at total
                const proposedDone = task.done + amount;
                const newDone = Math.min(proposedDone, task.total);

                const effectiveAmount = newDone - task.done;

                if (effectiveAmount <= 0) break; // Nothing to add

                const log = {
                    id: crypto.randomUUID(),
                    taskId,
                    date,
                    amount: effectiveAmount,
                    timestamp: new Date().toISOString()
                };
                newState.logs = [...newState.logs, log];

                // Create copy of tasks to avoid mutation
                newState.tasks = [...newState.tasks];

                const updatedTask = { ...task, done: newDone };

                // Check completion
                if (newDone >= task.total && !updatedTask.completedAt) {
                    updatedTask.completedAt = new Date().toISOString();
                } else if (newDone < task.total) {
                    updatedTask.completedAt = null; // Reset if undone
                }

                if (newState.settings.mode === 'strict' && newDone < task.total) {
                    const days = getDays(date, task.dueDate);
                    const remain = task.total - newDone;
                    const futurePlan = calculatePlan(remain, days, 'strict');
                    updatedTask.plan = { ...updatedTask.plan, ...futurePlan };
                }

                // Update Activity Log (Streak)
                const currentActivity = newState.activityLog || [];
                if (!currentActivity.includes(date)) {
                    newState.activityLog = [...currentActivity, date];
                }

                newState.tasks[taskIndex] = updatedTask;
            }
            break;

        case ACTION_TYPES.UNDO_PROGRESS:
            {
                console.log('Undoing progress for', action.payload);
                const { taskId, date } = action.payload; // Payload expected: { taskId, date }
                const taskIndex = newState.tasks.findIndex(t => t.id === taskId);
                if (taskIndex === -1) break;

                // Find last log for this task & date
                const logsReversed = [...newState.logs].reverse();
                const targetLogIndexReverse = logsReversed.findIndex(l => l.taskId === taskId && l.date === date);

                if (targetLogIndexReverse === -1) break; // No log to undo

                // Calculate actual index
                const targetLogIndex = newState.logs.length - 1 - targetLogIndexReverse;
                const targetLog = newState.logs[targetLogIndex];

                // Remove log
                newState.logs = newState.logs.filter((_, idx) => idx !== targetLogIndex);

                // Create a FRESH copy of tasks array
                newState.tasks = [...newState.tasks];

                // Revert task done
                const task = newState.tasks[taskIndex];
                const newDone = Math.max(0, task.done - targetLog.amount);
                const updatedTask = { ...task, done: newDone };

                // Re-check completion
                if (newDone < task.total) {
                    updatedTask.completedAt = null;
                }

                // If strict mode, we might need to replan
                if (newState.settings.mode === 'strict') {
                    const days = getDays(date, task.dueDate);
                    const remain = task.total - newDone;
                    // FUTURE: Replan logic could be refined. For now, strict mode replans forward.
                    const futurePlan = calculatePlan(remain, days, 'strict');
                    updatedTask.plan = { ...updatedTask.plan, ...futurePlan };
                }

                newState.tasks[taskIndex] = updatedTask;
            }
            break;

        case ACTION_TYPES.DELETE_TASK:
            console.log('Soft Deleting task:', action.payload);
            {
                const taskIndex = newState.tasks.findIndex(t => t.id === action.payload);
                if (taskIndex !== -1) {
                    newState.tasks = [...newState.tasks];
                    newState.tasks[taskIndex] = { ...newState.tasks[taskIndex], isDeleted: true };
                }
            }
            break;

        case ACTION_TYPES.REPLAN_TASK:
            {
                const taskIndex = newState.tasks.findIndex(t => t.id === action.payload);
                if (taskIndex === -1) break;

                const task = newState.tasks[taskIndex];
                // Replan from TODAY
                const days = getDays(new Date().toISOString().split('T')[0], task.dueDate);
                const remain = task.total - task.done;

                // Manual replan -> using current mode (likely Gentle if manual)
                const newPlan = calculatePlan(remain, days, newState.settings.mode);

                newState.tasks[taskIndex] = { ...task, plan: newPlan };
            }
            break;

        default:
            return state;
    }

    return newState;
}

export function StoreProvider({ children }) {
    const initialData = Storage.get() || {};
    if (!initialData.settings) {
        initialData.settings = {};
    }

    // Migration: goal -> goals
    if (initialData.settings && initialData.settings.goal && !initialData.settings.goals) {
        initialData.settings.goals = [{
            id: crypto.randomUUID(),
            text: initialData.settings.goal,
            color: '#8ec5fc' // Default accent
        }];
        delete initialData.settings.goal;
    }
    // Ensure goals exists if new user
    if (initialData.settings && !initialData.settings.goals) {
        initialData.settings.goals = [];
    }

    // Ensure language default
    if (initialData.settings && !initialData.settings.language) {
        initialData.settings.language = 'ja';
    }

    // Ensure visibleWidgets default
    if (initialData.settings && !initialData.settings.visibleWidgets) {
        initialData.settings.visibleWidgets = { timer: true, goals: true, dictionary: true, sound: true, flashcard: true, tasks: true };
    }

    // Ensure collapsedWidgets default
    if (initialData.settings && !initialData.settings.collapsedWidgets) {
        initialData.settings.collapsedWidgets = { timer: false, goals: false, dictionary: true, sound: true, flashcard: false };
    }

    // Ensure vocab default
    if (initialData.settings && !initialData.settings.vocab) {
        initialData.settings.vocab = [];
    }

    // Ensure theme default
    if (initialData.settings && !initialData.settings.theme) {
        initialData.settings.theme = 'midnight';
    }

    // Ensure widgetOrder default and integrity
    const defaultOrder = ['timer', 'calendar', 'tasks', 'dictionary', 'sound', 'flashcard'];
    if (initialData.settings && (!initialData.settings.widgetOrder || initialData.settings.widgetOrder.length === 0)) {
        initialData.settings.widgetOrder = defaultOrder;
    } else if (initialData.settings && initialData.settings.widgetOrder) {
        // Repair: Ensure all keys exist
        const currentOrder = initialData.settings.widgetOrder;
        // Check if currentOrder is an array before attempting filter/spread to avoid crash
        if (Array.isArray(currentOrder)) {
            const missing = defaultOrder.filter(key => !currentOrder.includes(key));
            if (missing.length > 0) {
                initialData.settings.widgetOrder = [...currentOrder, ...missing];
            }
        } else {
            // Fallback if corrupted
            initialData.settings.widgetOrder = defaultOrder;
        }
    }

    // Ensure mode default
    if (initialData.settings && !initialData.settings.mode) {
        initialData.settings.mode = 'gentle';
    }

    // Ensure activityLog exists
    if (!initialData.activityLog) {
        initialData.activityLog = [];
    }

    const initialState = { view: 'dashboard', ...initialData };

    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        Storage.save(state);
        document.body.setAttribute('data-mode', state.settings.mode);

        // Apply Theme Globally
        const currentTheme = THEMES[state.settings.theme || 'midnight'];
        if (currentTheme) {
            Object.entries(currentTheme.colors).forEach(([key, value]) => {
                document.body.style.setProperty(key, value);
            });

            // STRICT MODE OVERRIDE
            if (state.settings.mode === 'strict') {
                document.body.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #000000 0%, #1a202c 100%)');
                document.body.style.setProperty('--bg-primary', '#000000');
                document.body.style.setProperty('--card-bg', 'rgba(20, 0, 0, 0.9)');
                document.body.style.setProperty('--text-main', '#ffffff');
                document.body.style.setProperty('--text-sub', '#a0aec0');
            }

            // Apply Font
            const currentFont = FONTS[state.settings.font || 'sans'];
            if (currentFont) {
                document.body.style.setProperty('--font-main', currentFont.value);
            }
        }
    }, [state]);

    const value = {
        state,
        dispatch,
        actions: ACTION_TYPES
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => useContext(StoreContext);
