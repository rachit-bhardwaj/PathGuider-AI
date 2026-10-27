import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiBars3, HiOutlineSparkles } from 'react-icons/hi2';
import ConversationList from '../components/chat/ConversationList';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import {
  getConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
  submitMessageFeedback
} from '../services/chatService';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await getConversations();
      setConversations(list);
      if (list.length && !activeId) {
        setActiveId(list[0]._id);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingList(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (id) => {
    setLoadingMessages(true);
    try {
      const { messages: msgs } = await getConversation(id);
      setMessages(msgs);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleNewConversation = async () => {
    try {
      const conv = await createConversation();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv._id);
      setSidebarOpen((v) => (window.innerWidth < 768 ? false : v));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSelectConversation = (id) => {
    setActiveId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSend = async (content) => {
    let convId = activeId;
    if (!convId) {
      try {
        const conv = await createConversation();
        setConversations((prev) => [conv, ...prev]);
        setActiveId(conv._id);
        convId = conv._id;
      } catch (err) {
        toast.error(err.message);
        return;
      }
    }

    setMessages((prev) => [
      ...prev,
      { _id: `temp-${Date.now()}`, sender: 'user', content, createdAt: new Date().toISOString() }
    ]);
    setSending(true);

    try {
      const { userMessage, aiMessage } = await sendMessage(convId, content);
      setMessages((prev) => [...prev.filter((m) => !m._id.toString().startsWith('temp-')), userMessage, aiMessage]);
      loadConversations();
    } catch (err) {
      toast.error(err.message);
      setMessages((prev) => prev.filter((m) => !m._id.toString().startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  const handleFeedback = async (messageId, feedback) => {
    setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, feedback } : m)));
    try {
      await submitMessageFeedback(messageId, feedback);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const activeTitle = conversations.find((c) => c._id === activeId)?.title;

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-border bg-surface transition-transform duration-200 md:static md:transition-[width] md:duration-200 ${
          sidebarOpen ? 'translate-x-0 md:w-72' : '-translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-r-0'
        }`}
      >
        <div className="h-full w-72">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelectConversation}
            onNew={handleNewConversation}
            onDelete={handleDeleteConversation}
            loading={loadingList}
          />
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close conversation list"
        />
      )}

      {/* Main chat column */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="shrink-0 rounded-lg p-1.5 text-ink-soft transition hover:bg-paper hover:text-ink"
            aria-label="Toggle conversation list"
          >
            <HiBars3 className="h-5 w-5" />
          </button>
          <h1 className="truncate font-display text-base font-semibold text-ink">{activeTitle || 'New chat'}</h1>
        </div>

        <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto bg-chat-bg">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end px-4 py-6 sm:px-6">
            {loadingMessages && <p className="text-center text-sm text-ink-soft">Loading messages…</p>}

            {!loadingMessages && messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
                  <HiOutlineSparkles className="h-7 w-7" />
                </div>
                <p className="font-display text-xl text-ink">How can I help today?</p>
                <p className="mt-1 max-w-sm text-sm text-ink-soft">
                  Ask about admissions, financial aid, academics, housing, tech issues, or wellness resources.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((m) => (
                <MessageBubble key={m._id} message={m} onFeedback={handleFeedback} />
              ))}
              {sending && <TypingIndicator />}
            </div>
          </div>
        </div>

        <ChatInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}
