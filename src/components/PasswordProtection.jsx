import React, { useState, useEffect } from 'react';

export function PasswordProtection({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const auth = localStorage.getItem('app_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple client-side password check
        if (password === 'NoriTama') {
            localStorage.setItem('app_auth', 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('パスワードが違います');
        }
    };

    if (isAuthenticated) {
        return children;
    }

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
            color: '#fff'
        }}>
            <form onSubmit={handleSubmit} className="glass-panel" style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔒 アクセス制限</h1>
                <p>合言葉を入力してください</p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワード"
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'white',
                        fontSize: '1rem'
                    }}
                    autoFocus
                />
                {error && <p style={{ color: '#fc8181', fontSize: '0.9rem' }}>{error}</p>}
                <button
                    type="submit"
                    className="glass-button"
                    style={{
                        padding: '12px',
                        background: 'var(--accent)',
                        fontWeight: 'bold',
                        marginTop: '0.5rem'
                    }}
                >
                    解除
                </button>
            </form>
        </div>
    );
}
