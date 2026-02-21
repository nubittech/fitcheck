import React from 'react'

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        // TODO: send to crash reporting (e.g. Sentry)
        console.error('[FitCheck Error]', error, info.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100svh', padding: '32px',
                    background: '#0f0f0f', color: '#fff', textAlign: 'center', gap: '16px'
                }}>
                    <div style={{ fontSize: '48px' }}>👗</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Bir şeyler ters gitti</h2>
                    <p style={{ fontSize: '14px', color: '#888', margin: 0, maxWidth: '280px' }}>
                        Uygulamada beklenmedik bir hata oluştu. Sayfayı yenileyerek tekrar dene.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '8px', padding: '12px 28px', borderRadius: '24px',
                            background: '#E07A5F', color: '#fff', border: 'none',
                            fontSize: '15px', fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        Yenile
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}
