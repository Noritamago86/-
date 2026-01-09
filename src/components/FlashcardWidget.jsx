import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Book, Plus, Trash2, Play, ChevronDown, ChevronRight, RotateCcw, Check, X as XIcon } from 'lucide-react';
import { translations } from '../lib/translations';

export function FlashcardWidget() {
    const { state, dispatch, actions } = useStore();
    const t = translations[state.settings.language || 'ja'];
    const { collapsedWidgets, vocab = [] } = state.settings;
    const isCollapsed = collapsedWidgets?.flashcard ?? false;

    const [mode, setMode] = useState('list'); // 'list', 'test'
    // List Mode State
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');

    // Test Mode State
    const [testCards, setTestCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const toggleCollapse = () => {
        dispatch({ type: actions.TOGGLE_COLLAPSE, payload: { flashcard: !isCollapsed } });
    };

    const addCard = () => {
        if (!newFront.trim() || !newBack.trim()) return;
        const newCard = {
            id: crypto.randomUUID(),
            front: newFront,
            back: newBack,
            createdAt: new Date().toISOString()
        };
        const newVocab = [...vocab, newCard];
        dispatch({ type: actions.UPDATE_VOCAB, payload: newVocab });
        setNewFront('');
        setNewBack('');
    };

    const deleteCard = (id) => {
        const newVocab = vocab.filter(c => c.id !== id);
        dispatch({ type: actions.UPDATE_VOCAB, payload: newVocab });
    };

    const startTest = () => {
        if (vocab.length === 0) return;
        // Shuffle cards
        const shuffled = [...vocab].sort(() => Math.random() - 0.5);
        setTestCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setScore(0);
        setIsFinished(false);
        setMode('test');
    };

    const handleAnswer = (isCorrect) => {
        if (isCorrect) setScore(s => s + 1);

        if (currentIndex < testCards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            setIsFinished(true);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '0', marginBottom: '16px', overflow: 'hidden' }}>
            {/* Header */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                    <Book size={16} />
                    {t.flashcard}
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({vocab.length})</span>
                </div>
                {isCollapsed ? <ChevronRight size={18} color="var(--text-sub)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
            </div>

            {!isCollapsed && (
                <div style={{ padding: '16px' }}>
                    {mode === 'list' && (
                        <>
                            {/* Controls */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                <button
                                    onClick={startTest}
                                    disabled={vocab.length === 0}
                                    className="glass-button"
                                    style={{
                                        background: vocab.length > 0 ? 'var(--accent)' : 'var(--white-a10)',
                                        color: vocab.length > 0 ? '#fff' : 'var(--text-sub)',
                                        border: 'none', padding: '8px 16px',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        opacity: vocab.length === 0 ? 0.5 : 1
                                    }}
                                >
                                    <Play size={16} fill="currentColor" />
                                    {t.testMode}
                                </button>
                            </div>

                            {/* Add Card Form */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <input
                                        placeholder={t.front}
                                        value={newFront}
                                        onChange={(e) => setNewFront(e.target.value)}
                                        className="glass-button"
                                        style={{ width: '100%', padding: '8px', textAlign: 'left', cursor: 'text' }}
                                    />
                                    <input
                                        placeholder={t.back}
                                        value={newBack}
                                        onChange={(e) => setNewBack(e.target.value)}
                                        className="glass-button"
                                        style={{ width: '100%', padding: '8px', textAlign: 'left', cursor: 'text' }}
                                        onKeyDown={(e) => e.key === 'Enter' && addCard()}
                                    />
                                </div>
                                <button
                                    onClick={addCard}
                                    className="glass-button"
                                    style={{
                                        width: '40px', background: 'var(--white-a10)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* List */}
                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {vocab.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                                        {t.emptyCard}
                                    </div>
                                ) : (
                                    vocab.map(card => (
                                        <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--white-a05)', borderRadius: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{card.front}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{card.back}</div>
                                            </div>
                                            <button
                                                onClick={() => deleteCard(card.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--status-risk)', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {mode === 'test' && (
                        <div style={{ textAlign: 'center' }}>
                            {!isFinished ? (
                                <>
                                    <div style={{ marginBottom: '16px', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                                        {currentIndex + 1} / {testCards.length}
                                    </div>

                                    <div
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        style={{
                                            minHeight: '160px',
                                            background: 'var(--white-a10)',
                                            borderRadius: '16px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            padding: '24px',
                                            cursor: 'pointer',
                                            marginBottom: '24px',
                                            position: 'relative',
                                            transformStyle: 'preserve-3d',
                                            transition: 'transform 0.6s'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                                            {isFlipped ? testCards[currentIndex].back : testCards[currentIndex].front}
                                        </div>
                                        {isFlipped && <div style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>({testCards[currentIndex].front})</div>}

                                        {!isFlipped && <div style={{ marginTop: '16px', fontSize: '0.8rem', opacity: 0.5 }}>Tap to Flip</div>}
                                    </div>

                                    {isFlipped && (
                                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleAnswer(false)}
                                                className="glass-button"
                                                style={{
                                                    flex: 1, padding: '12px',
                                                    background: 'var(--white-a10)', color: 'var(--text-sub)',
                                                    border: 'none'
                                                }}
                                            >
                                                <XIcon size={18} style={{ marginRight: '8px' }} />
                                                {t.forgot}
                                            </button>
                                            <button
                                                onClick={() => handleAnswer(true)}
                                                className="glass-button"
                                                style={{
                                                    flex: 1, padding: '12px',
                                                    background: 'var(--accent)', color: '#fff',
                                                    border: 'none', fontWeight: 'bold'
                                                }}
                                            >
                                                <Check size={18} style={{ marginRight: '8px' }} />
                                                {t.remembered}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ padding: '24px 0' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>{t.testFinish}</h3>
                                    <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
                                        {Math.round((score / testCards.length) * 100)}%
                                    </div>
                                    <p style={{ color: 'var(--text-sub)', marginBottom: '24px' }}>
                                        {score} / {testCards.length} Correct
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setMode('list')}
                                            className="glass-button"
                                            style={{ flex: 1, padding: '12px', gap: '8px' }}
                                        >
                                            <Book size={18} />
                                            {t.editMode}
                                        </button>
                                        <button
                                            onClick={startTest}
                                            className="glass-button"
                                            style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', gap: '8px' }}
                                        >
                                            <RotateCcw size={18} />
                                            {t.restart}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
