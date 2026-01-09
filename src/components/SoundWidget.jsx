import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Volume2, Volume1, VolumeX, Play, Pause, Music, ChevronDown, ChevronRight } from 'lucide-react';
import { translations } from '../lib/translations';

export function SoundWidget() {
    const { state, dispatch, actions } = useStore();
    const t = translations[state.settings.language || 'ja'];
    const { collapsedWidgets } = state.settings;
    const isCollapsed = collapsedWidgets?.sound ?? true;

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [type, setType] = useState('rain'); // 'white', 'rain'

    // Audio Context Refs
    const audioCtxRef = useRef(null);
    const gainNodeRef = useRef(null);
    const sourceNodeRef = useRef(null);

    // Initialize Audio Context
    useEffect(() => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.connect(audioCtxRef.current.destination);
        gainNodeRef.current.gain.value = volume;

        return () => {
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    // Handle Volume Change
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
        }
    }, [volume]);

    // Handle Play/Pause/Type Change
    useEffect(() => {
        if (isPlaying) {
            // Stop existing
            if (sourceNodeRef.current) {
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
            }

            // Create new noise
            const bufferSize = audioCtxRef.current.sampleRate * 2; // 2 seconds buffer
            const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
            const data = buffer.getChannelData(0);

            if (type === 'white') {
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
            } else if (type === 'pink') {
                let b0, b1, b2, b3, b4, b5, b6;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11; // Scale to prevent clipping
                    b6 = white * 0.115926;
                }
            } else if (type === 'rain') {
                // Brown noise approximation
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5;
                }
            } else if (type === 'waves') {
                // Pink noise base
                let b0, b1, b2, b3, b4, b5, b6;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11;
                    b6 = white * 0.115926;
                }
            }

            const noise = audioCtxRef.current.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            if (type === 'waves') {
                // Use a secondary gain node for LFO modulation
                const waveGain = audioCtxRef.current.createGain();
                waveGain.gain.value = 0;

                noise.connect(waveGain);
                waveGain.connect(gainNodeRef.current);

                // LFO for wave simulation (0.1Hz = 10 sec period)
                const lfo = audioCtxRef.current.createOscillator();
                lfo.type = 'sine';
                lfo.frequency.value = 0.1;

                // Keep gain positive: 0.5 * sin + 0.5 -> 0 to 1
                // Actually simple gain modulation is enough
                const lfoGain = audioCtxRef.current.createGain();
                lfoGain.gain.value = 0.5; // Depth

                lfo.connect(lfoGain);
                lfoGain.connect(waveGain.gain);

                lfo.start();
                sourceNodeRef.current = { stop: () => { noise.stop(); lfo.stop(); }, disconnect: () => { noise.disconnect(); lfo.disconnect(); } };
                noise.start();
            } else {
                noise.connect(gainNodeRef.current);
                noise.start();
                sourceNodeRef.current = noise;
            }
        } else {
            if (sourceNodeRef.current) {
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
                sourceNodeRef.current = null;
            }
        }
    }, [isPlaying, type]);

    const toggleCollapse = () => {
        dispatch({ type: actions.TOGGLE_COLLAPSE, payload: { sound: !isCollapsed } });
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
                    <Music size={16} />
                    {t.bgm || "BGM"}
                </div>
                {isCollapsed ? <ChevronRight size={18} color="var(--text-sub)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
            </div>

            {!isCollapsed && (
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setType('rain')}
                            className="glass-button"
                            style={{
                                flex: '1 1 40%', padding: '8px',
                                background: type === 'rain' ? 'var(--white-a20)' : 'transparent',
                                border: type === 'rain' ? '2px solid var(--accent)' : '1px solid transparent'
                            }}
                        >
                            ☂️ {t.rain}
                        </button>
                        <button
                            onClick={() => setType('waves')}
                            className="glass-button"
                            style={{
                                flex: '1 1 40%', padding: '8px',
                                background: type === 'waves' ? 'var(--white-a20)' : 'transparent',
                                border: type === 'waves' ? '2px solid var(--accent)' : '1px solid transparent'
                            }}
                        >
                            🌊 {t.waves}
                        </button>
                        <button
                            onClick={() => setType('pink')}
                            className="glass-button"
                            style={{
                                flex: '1 1 40%', padding: '8px',
                                background: type === 'pink' ? 'var(--white-a20)' : 'transparent',
                                border: type === 'pink' ? '2px solid var(--accent)' : '1px solid transparent'
                            }}
                        >
                            🌸 {t.pinkNoise}
                        </button>
                        <button
                            onClick={() => setType('white')}
                            className="glass-button"
                            style={{
                                flex: '1 1 40%', padding: '8px',
                                background: type === 'white' ? 'var(--white-a20)' : 'transparent',
                                border: type === 'white' ? '2px solid var(--accent)' : '1px solid transparent'
                            }}
                        >
                            📻 {t.whiteNoise}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                width: '48px', height: '48px',
                                borderRadius: '50%', background: isPlaying ? 'var(--accent)' : 'var(--white-a20)',
                                border: 'none', color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                        </button>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {volume === 0 ? <VolumeX size={16} color="var(--text-sub)" /> : <Volume2 size={16} color="var(--text-sub)" />}
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                style={{ flex: 1, cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
