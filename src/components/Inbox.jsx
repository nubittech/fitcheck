import { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/Inbox.css';
import { getConversations, getMessages, sendMessage, findOrCreateConversation, subscribeToMessages } from '../lib/api';

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffH < 24) return `${diffH}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessageTime(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ──────────────────────────────────────────
// Inbox (conversation list)
// ──────────────────────────────────────────
const Inbox = ({ onChatSelect, currentUser }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'requests'

    const loadConversations = useCallback(async () => {
        if (!currentUser?.id) return;
        setLoading(true);
        const { data, error } = await getConversations(currentUser.id);
        if (!error && data) {
            setConversations(data);
        }
        setLoading(false);
    }, [currentUser?.id]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Derive partner profile from conversation row
    const getPartner = (conv) => {
        return conv.participant_1 === currentUser?.id ? conv.p2 : conv.p1;
    };

    // Split conversations: requests = conversations where current user never sent a message
    // A conversation is a "request" if the current user did NOT initiate it AND has no messages from them
    // Simple heuristic: if last_message is null or current user is not the initiator and has no reply
    const isRequest = (conv) => {
        // If the conversation has no messages at all, it's a request (someone just opened a chat)
        if (!conv.last_message) return true;
        // If the current user initiated the conversation, it goes to inbox
        if (conv.participant_1 === currentUser?.id && conv.participant_1 < conv.participant_2) return false;
        if (conv.participant_2 === currentUser?.id && conv.participant_2 < conv.participant_1) return false;
        // Otherwise, check if this is a new conversation from someone else
        // We can't know who sent last_message without extra data, so use a simple rule:
        // Conversations with only "Say hello!" placeholder go to requests
        return false;
    };

    const inboxConvs = conversations.filter(c => !isRequest(c));
    const requestConvs = conversations.filter(c => isRequest(c));
    const activeConvs = activeTab === 'inbox' ? inboxConvs : requestConvs;

    if (loading) {
        return (
            <div className="inbox-page">
                <header className="inbox-header"><h1>Inbox</h1></header>
                <div className="inbox-loading">
                    <div className="inbox-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="inbox-page">
            <header className="inbox-header">
                <h1>Mesajlar</h1>
            </header>

            {/* Tabs */}
            <div className="inbox-tabs">
                <button
                    className={`inbox-tab ${activeTab === 'inbox' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inbox')}
                >
                    Inbox
                    {inboxConvs.length > 0 && <span className="inbox-tab-count">{inboxConvs.length}</span>}
                </button>
                <button
                    className={`inbox-tab ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    İstekler
                    {requestConvs.length > 0 && <span className="inbox-tab-count request">{requestConvs.length}</span>}
                </button>
            </div>

            {activeConvs.length === 0 ? (
                <div className="inbox-empty">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p>{activeTab === 'inbox' ? 'Henüz mesaj yok' : 'Yeni istek yok'}</p>
                    <span>{activeTab === 'inbox'
                        ? 'Biriyle mesajlaştığında burada görünecek.'
                        : 'Yeni mesaj istekleri burada görünecek.'
                    }</span>
                </div>
            ) : (
                <div className="message-list">
                    {activeConvs.map(conv => {
                        const partner = getPartner(conv);
                        if (!partner) return null;
                        return (
                            <div
                                key={conv.id}
                                className="message-item"
                                onClick={() => onChatSelect({ ...conv, partner })}
                            >
                                <div className="avatar-wrapper">
                                    {partner.avatar_url ? (
                                        <img src={partner.avatar_url} alt={partner.full_name} className="avatar-img" />
                                    ) : (
                                        <div className="avatar-placeholder" style={{ backgroundColor: '#E9D5FF' }}>
                                            {(partner.full_name || partner.username || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="user-name">{partner.full_name || partner.username}</span>
                                        <span className="time">{formatTime(conv.last_message_at)}</span>
                                    </div>
                                    <p className="last-message">{conv.last_message || 'Say hello!'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────
// ChatDetail (individual conversation)
// ──────────────────────────────────────────
export const ChatDetail = ({ chat, onBack, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);
    const channelRef = useRef(null);

    const partner = chat.partner;
    const conversationId = chat.id;

    // Load messages
    useEffect(() => {
        if (!conversationId) return;
        setLoading(true);
        getMessages(conversationId).then(({ data }) => {
            if (data) setMessages(data);
            setLoading(false);
        });

        // Subscribe to realtime new messages
        channelRef.current = subscribeToMessages(conversationId, (newMsg) => {
            // Avoid duplicates (we already add our own optimistically)
            setMessages(prev => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });

        return () => {
            if (channelRef.current) channelRef.current.unsubscribe();
        };
    }, [conversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || !currentUser?.id || sending) return;

        // Optimistic update
        const optimistic = {
            id: `opt-${Date.now()}`,
            sender_id: currentUser.id,
            text,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);
        setInputText('');
        setSending(true);

        const { data, error } = await sendMessage({
            conversationId,
            senderId: currentUser.id,
            text,
        });

        if (!error && data) {
            // Replace optimistic with real
            setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m));
        }
        setSending(false);
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
                        {partner?.avatar_url ? (
                            <img src={partner.avatar_url} alt={partner.full_name} />
                        ) : (
                            <div className="avatar-placeholder-small" style={{ backgroundColor: '#E9D5FF' }}>
                                {(partner?.full_name || partner?.username || '?').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="user-text">
                        <span className="chat-username">{partner?.full_name || partner?.username}</span>
                        <span className="chat-status">@{partner?.username || '—'}</span>
                    </div>
                </div>
                <button className="icon-btn-ghost">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                </button>
            </header>

            <div className="chat-area">
                {loading ? (
                    <div className="inbox-loading"><div className="inbox-spinner" /></div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty-state">
                        <p>Say hi to {partner?.full_name?.split(' ')[0] || 'them'} 👋</p>
                    </div>
                ) : (
                    <>
                        {messages.map(msg => {
                            const isMe = msg.sender_id === currentUser?.id;
                            return (
                                <div key={msg.id} className={`chat-bubble-wrapper ${isMe ? 'me' : 'other'}`}>
                                    {!isMe && (
                                        <div className="bubble-avatar">
                                            {partner?.avatar_url ? (
                                                <img src={partner.avatar_url} alt={partner.full_name} />
                                            ) : (
                                                <div className="bubble-avatar-placeholder" style={{ backgroundColor: '#E9D5FF' }}>
                                                    {(partner?.full_name || '?').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="chat-bubble">
                                        <p>{msg.text}</p>
                                        <span className="bubble-time">{formatMessageTime(msg.created_at)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="chat-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <button
                    className={`send-btn ${inputText.trim() ? 'active' : ''}`}
                    onClick={handleSend}
                    disabled={!inputText.trim() || sending}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Inbox;
