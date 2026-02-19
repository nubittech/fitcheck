import { useState, useRef, useEffect } from 'react';
import '../styles/Inbox.css';

const INITIAL_MESSAGES = [
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
        bgColor: '#E9D5FF',
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

const INITIAL_REQUESTS = [
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

const INITIAL_CHATS = {
    1: [
        { id: 1, sender: 'other', text: "Hey! I saw your outfit post. That jacket is incredible! Where did you find it?", time: "10:23 AM" },
        { id: 2, sender: 'me', text: "Thank you! I got it from a thrift store in Kadıköy, it was such a lucky find.", time: "10:45 AM" },
        { id: 3, sender: 'other', text: "No way! I've been looking for something similar. Do you know the brand?", time: "10:46 AM" },
        { id: 4, sender: 'me', text: "The tag says Mavi. Very 90s cut, I love it.", time: "10:48 AM" },
        { id: 5, sender: 'other', text: "Where is that jacket from?", time: "10:50 AM" },
    ],
    2: [
        { id: 1, sender: 'me', text: "Hey, loved your minimalist look! Simple but fire.", time: "Yesterday" },
        { id: 2, sender: 'other', text: "Thanks for the feedback!", time: "Yesterday" },
    ],
    3: [
        { id: 1, sender: 'other', text: "I saw your two outfits side by side, the beige tones looked way better on you!", time: "Yesterday" },
        { id: 2, sender: 'me', text: "Really? I was unsure about it actually.", time: "Yesterday" },
        { id: 3, sender: 'other', text: "I think the beige one suits you better.", time: "Yesterday" },
    ],
    4: [
        { id: 1, sender: 'other', text: "Is this available in other colors?", time: "Yesterday" },
    ],
    5: [
        { id: 1, sender: 'other', text: "Sent a photo.", time: "Tue", isImage: true, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600' },
    ],
    6: [
        { id: 1, sender: 'other', text: "Love the minimalist vibe of your profile!", time: "Mon" },
        { id: 2, sender: 'me', text: "Thanks man, appreciate it!", time: "Mon" },
    ],
    101: [
        { id: 1, sender: 'other', text: "Hey! Love your style, where did you get that coat?", time: "3h ago" },
    ],
    102: [
        { id: 1, sender: 'other', text: "Can you share the brand of those sneakers?", time: "1d ago" },
    ]
};

const Inbox = ({ onChatSelect, pendingChat }) => {
    const [activeTab, setActiveTab] = useState('messages');
    const [messagesList, setMessagesList] = useState(INITIAL_MESSAGES);
    const [requestsList, setRequestsList] = useState(INITIAL_REQUESTS);

    // If a pendingChat arrives (from PublicProfile Message button), add it to requests
    useEffect(() => {
        if (!pendingChat) return;
        const exists = messagesList.some(m => m.user === pendingChat.user) ||
                       requestsList.some(r => r.user === pendingChat.user);
        if (!exists) {
            const newReq = {
                id: Date.now(),
                user: pendingChat.user,
                avatar: pendingChat.avatar || '',
                lastMessage: pendingChat.initialMessage || 'New message',
                time: 'Now',
                unread: true,
                online: false,
                mutualFollowers: 0
            };
            // Add chat history for this new request
            INITIAL_CHATS[newReq.id] = [
                { id: 1, sender: 'me', text: pendingChat.initialMessage || 'Hey!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ];
            setRequestsList(prev => [newReq, ...prev]);
        }
        // Open the chat
        const chatTarget = messagesList.find(m => m.user === pendingChat.user) ||
                           requestsList.find(r => r.user === pendingChat.user);
        if (chatTarget) {
            onChatSelect(chatTarget);
        }
    }, [pendingChat]);

    const handleAccept = (req) => {
        // Remove from requests
        setRequestsList(prev => prev.filter(r => r.id !== req.id));
        // Add to messages at top
        const newMsg = {
            id: req.id,
            user: req.user,
            avatar: req.avatar,
            lastMessage: req.lastMessage,
            time: 'Now',
            unread: true,
            online: req.online,
            initials: req.initials,
            bgColor: req.bgColor
        };
        setMessagesList(prev => [newMsg, ...prev]);
        // Open the chat
        onChatSelect(newMsg);
    };

    const handleDecline = (reqId) => {
        setRequestsList(prev => prev.filter(r => r.id !== reqId));
    };

    return (
        <div className="inbox-page">
            <header className="inbox-header">
                <h1>Inbox</h1>
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
                    {requestsList.length > 0 && (
                        <span className="badge-count">{requestsList.length}</span>
                    )}
                </button>
            </div>

            {activeTab === 'messages' ? (
                <div className="message-list">
                    {messagesList.map(msg => (
                        <div key={msg.id} className={`message-item ${msg.unread ? 'unread-row' : ''}`} onClick={() => onChatSelect(msg)}>
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
                        {requestsList.map(req => (
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
                                    <button className="request-btn accept" onClick={() => handleAccept(req)}>Accept</button>
                                    <button className="request-btn decline" onClick={() => handleDecline(req.id)}>Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {requestsList.length === 0 && (
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
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        setMessages(INITIAL_CHATS[chat.id] || []);
    }, [chat.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMsg = {
            id: Date.now(),
            sender: 'me',
            text: inputText.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMsg]);
        // Also update the shared chat store so navigating back and forth preserves messages
        if (!INITIAL_CHATS[chat.id]) INITIAL_CHATS[chat.id] = [];
        INITIAL_CHATS[chat.id].push(newMsg);
        setInputText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

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
                            <div className="avatar-placeholder-small" style={{ backgroundColor: chat.bgColor || '#E9D5FF' }}>
                                {chat.initials || chat.user?.charAt(0) || 'U'}
                            </div>
                        )}
                        {chat.online && <div className="online-dot-small"></div>}
                    </div>
                    <div className="user-text">
                        <span className="chat-username">{chat.user}</span>
                        <span className="chat-status">{chat.online ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
                <button className="icon-btn-ghost">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                </button>
            </header>

            <div className="chat-area">
                <div className="date-separator">
                    <span>Today</span>
                </div>

                {messages.map(msg => (
                    <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                        {msg.sender === 'other' && (
                            <div className="bubble-avatar">
                                {chat.avatar ? (
                                    <img src={chat.avatar} alt={chat.user} />
                                ) : (
                                    <div className="bubble-avatar-placeholder" style={{ backgroundColor: chat.bgColor || '#E9D5FF' }}>
                                        {chat.initials || chat.user?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                        )}
                        {msg.isImage ? (
                            <div className="chat-image">
                                <img src={msg.image} alt="Sent attachment" />
                            </div>
                        ) : (
                            <div className="chat-bubble">
                                <p>{msg.text}</p>
                                <span className="bubble-time">{msg.time}</span>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
                <button className="add-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="chat-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button className={`send-btn ${inputText.trim() ? 'active' : ''}`} onClick={handleSend} disabled={!inputText.trim()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
            </div>
        </div>
    );
};

export default Inbox;
