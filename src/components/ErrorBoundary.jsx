import React from 'react';
import { Storage } from '../lib/storage';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleHardReset = () => {
        if (window.confirm('本当にすべてのデータをリセットしますか？この操作は取り消せません。')) {
            Storage.reset();
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: '#1a202c', color: '#fff', padding: '24px', textAlign: 'center'
                }}>
                    <h1 style={{ marginBottom: '16px', color: '#FC8181' }}>エラーが発生しました</h1>
                    <p style={{ marginBottom: '24px', maxWidth: '500px', lineHeight: '1.6' }}>
                        申し訳ありません。アプリで予期せぬエラーが発生しました。<br />
                        再読み込みを試してみてください。それでも解決しない場合は、データをリセットしてください。
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 24px', borderRadius: '8px', border: 'none',
                                background: '#4299E1', color: '#fff', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            再読み込み
                        </button>
                        <button
                            onClick={this.handleHardReset}
                            style={{
                                padding: '12px 24px', borderRadius: '8px', border: 'none',
                                background: 'transparent', border: '1px solid #718096', color: '#A0AEC0', cursor: 'pointer'
                            }}
                        >
                            データを完全にリセット
                        </button>
                    </div>
                    {this.state.error && (
                        <pre style={{
                            marginTop: '32px', padding: '16px', background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px', overflow: 'auto', maxWidth: '80%', textAlign: 'left',
                            fontSize: '0.8rem', color: '#A0AEC0'
                        }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
