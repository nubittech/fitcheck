import React from 'react';
import '../styles/Settings.css'; // Re-use settings styles

const LegalPage = ({ title, content, onBack }) => {
    return (
        <div className="settings-page legal-page">
            <header className="settings-header">
                <button className="settings-back-btn" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <span className="settings-title">{title}</span>
                <div style={{ width: 32 }} />
            </header>

            <div className="settings-scroll">
                <div className="legal-content" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
};

export default LegalPage;
