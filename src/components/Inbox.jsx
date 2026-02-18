import React, { useState } from 'react';
import '../styles/Inbox.css';

const MOCK_MESSAGES = [
    {
        id: 1,
        user: 'Elif Yılmaz',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        lastMessage: 'Where is that jacket from?',
        time: '2m',
        unread: true,
        online: true
    },
    {
        id: 2,
        user: 'Caner Erkin',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        lastMessage: 'Thanks for the feedback!',
        time: '1h',
        unread: false,
        online: false
    },
    {
        id: 3,
        user: 'Zeynep Demir',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        lastMessage: 'I think the beige one suits you better.',
        time: 'Yesterday',
        unread: false,
        online: false
    },
    {
        id: 4,
        user: 'Selin Yurt',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
        lastMessage: 'Is this available in other colors?',
        time: 'Yesterday',
        unread: false,
        online: false
    },
    {
        id: 5,
        user: 'Mehmet Kaya',
        initials: 'MK',
        bgColor: '#E9D5FF', // Light purple
        lastMessage: 'Sent a photo.',
        time: 'Tue',
        unread: false,
        online: false
    },
    {
        id: 6,
        user: 'Ali Vural',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        lastMessage: 'Love the minimalist vibe of your profile!',
        time: 'Mon',
        unread: false,
        online: false
    }
];

const MOCK_REQUESTS = [
    {
        id: 101,
        user: 'Deniz Akın',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        lastMessage: 'Hey! Love your style, where did you get that coat?',
        time: '3h',
        unread: true,
        online: true,
        mutualFollowers: 4,
        outfitThumb: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200'
    },
    {
        id: 102,
        user: 'Berk Yıldız',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
        lastMessage: 'Can you share the brand of those sneakers?',
        time: '1d',
        unread: true,
        online: false,
        mutualFollowers: 0,
        outfitThumb: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=200'
    }
];

const MOCK_CHAT = [
    {
        id: 1,
        sender: 'other',
        text: "Hey! I saw your comment. I actually found this jacket at a small thrift store in Kadıköy last weekend!",
        time: "10:23 AM"
    },
    {
        id: 2,
        sender: 'me',
        text: "Oh wow, that's such a lucky find! It looks amazing on you. Do you happen to know the brand?",
        time: "10:45 AM"
    },
    {
        id: 3,
        sender: 'other',
        text: "Yeah, the tag inside is super faded but it definitely says 'Mavi'. The cut looks very 90s.",
        time: "10:46 AM"
    },
    {
        id: 4,
        sender: 'other',
        text: "I can send a pic of the tag if you want?",
        time: "10:46 AM"
    },
    {
        id: 5,
        sender: 'me',
        image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600', // Mock image sending
        isImage: true,
        time: "10:48 AM"
    }
];

const Inbox = ({ onChatSelect }) => {
    const [activeTab, setActiveTab] = useState('messages');

    return (
        <div className="inbox-page">
            <header className="inbox-header">
                <h1>Inbox</h1>
                <button className="icon-btn-ghost">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
            </header>

            <div className="inbox-tabs">
                <button
                    className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    Messages
                </button>
                <button
                    className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Requests
                    <span className="badge-count">{MOCK_REQUESTS.length}</span>
                </button>
            </div>

            {activeTab === 'messages' ? (
                <div className="message-list">
                    {MOCK_MESSAGES.map(msg => (
                        <div key={msg.id} className="message-item" onClick={() => onChatSelect(msg)}>
                            <div className="avatar-wrapper">
                                {msg.avatar ? (
                                    <img src={msg.avatar} alt={msg.user} className="avatar-img" />
                                ) : (
                                    <div className="avatar-placeholder" style={{ backgroundColor: msg.bgColor }}>
                                        {msg.initials}
                                    </div>
                                )}
                                {msg.online && <div className="online-dot"></div>}
                            </div>
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="user-name">{msg.user}</span>
                                    <span className={`time ${msg.unread ? 'highlight' : ''}`}>{msg.time}</span>
                                </div>
                                <p className={`last-message ${msg.unread ? 'bold' : ''}`}>
                                    {msg.lastMessage}
                                </p>
                            </div>
                            {msg.unread && <div className="unread-dot"></div>}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="requests-section">
                    <div className="requests-info">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        <span>Message requests from people you don't follow. They won't know you've seen their message until you accept.</span>
                    </div>

                    <div className="message-list">
                        {MOCK_REQUESTS.map(req => (
                            <div key={req.id} className="request-item">
                                <div className="request-top" onClick={() => onChatSelect(req)}>
                                    <div className="avatar-wrapper">
                                        <img src={req.avatar} alt={req.user} className="avatar-img" />
                                        {req.online && <div className="online-dot"></div>}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            <span className="user-name">{req.user}</span>
                                            <span className="time highlight">{req.time}</span>
                                        </div>
                                        <p className="last-message bold">{req.lastMessage}</p>
                                        {req.mutualFollowers > 0 && (
                                            <span className="mutual-info">{req.mutualFollowers} mutual follower{req.mutualFollowers > 1 ? 's' : ''}</span>
                                        )}
                                    </div>
                                    {req.outfitThumb && (
                                        <div className="request-outfit-thumb">
                                            <img src={req.outfitThumb} alt="outfit" />
                                        </div>
                                    )}
                                </div>
                                <div className="request-actions">
                                    <button className="request-btn accept">Accept</button>
                                    <button className="request-btn decline">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {MOCK_REQUESTS.length === 0 && (
                        <div className="requests-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <p>No requests</p>
                            <span>When someone sends you a message request, it will appear here.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ChatDetail = ({ chat, onBack }) => {
    return (
        <div className="chat-detail-page">
            <header className="chat-header">
                <button className="icon-btn-ghost" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div className="chat-user">
                    <div className="chat-avatar">
                        {chat.avatar ? (
                            <img src={chat.avatar} alt={chat.user} />
                        ) : (
                            <div className="avatar-placeholder-small">{chat.initials || 'U'}</div>
                        )}
                        {chat.online && <div className="online-dot-small"></div>}
                    </div>
                    <div className="user-text">
                        <span className="username">@{chat.user.toLowerCase().replace(' ', '_')}</span>
                    </div>
                </div>
                <button className="icon-btn-ghost">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                </button>
            </header>

            {/* Product Context */}
            <div className="product-context">
                <div className="product-thumb">
                    <img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=100" alt="Jacket" />
                </div>
                <div className="context-text">
                    <span className="replying-to">REPLYING TO</span>
                    <span className="product-name">Vintage Mavi Jacket 90s</span>
                </div>
                <button className="view-btn">View</button>
            </div>

            <div className="chat-area">
                <div className="date-separator">
                    <span>Today, 10:23 AM</span>
                </div>

                {MOCK_CHAT.map(msg => (
                    <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                        {msg.sender === 'other' && (
                            <div className="bubble-avatar">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Sender" />
                            </div>
                        )}
                        {msg.isImage ? (
                            <div className="chat-image">
                                <img src={msg.image} alt="Sent attachment" />
                            </div>
                        ) : (
                            <div className="chat-bubble">
                                <p>{msg.text}</p>
                            </div>
                        )}
                    </div>
                ))}
                <div className="chat-bubble-wrapper me">
                    <div className="chat-bubble image-preview-bubble">
                        {/* Placeholder for the image being sent in mockup */}
                        <img src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600" className="preview-img" />
                    </div>
                </div>
            </div>

            <div className="chat-input-area">
                <button className="add-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
                <input type="text" placeholder="Thanks! I'll look for" className="chat-input" />
                <button className="send-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
            </div>
        </div>
    );
};

export default Inbox;
