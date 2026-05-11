import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, RotateCcw, X } from 'lucide-react';
import { useMuse } from '../../context/MuseContext';
import { MicButton } from '../../components/MicButton/MicButton';
import { LiveMicButton } from '../../components/LiveMicButton/LiveMicButton';
import useEmblaCarousel from 'embla-carousel-react';
import { personalizationService } from '../../services/personalizationService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../../helpers/currencyConstants';
import { Helper } from '../../helpers/helper';
import { resolveVoice } from '../../helpers/voiceConstants';
import { useGroqConversation } from '../../hooks/useGroqConversation';
import styles from './ShoppingMuse.module.css';

const ENABLE_TYPEWRITER = false; // set to false to show full text immediately

const CONSTANTS = {
  TITLE: "Personal Shopper",
  SUBTITLE: "Your AI shopping assistant",
  RESET_CHAT: "Reset Chat",
  RESET: "Reset",
  PLACEHOLDER: "Ask me anything...",
  THINKING: "Thinking...",
  INITIAL_BOT_MESSAGE: "I'm here to help you find the perfect products. Just tell me what you need!",
  ERROR_BOT_MESSAGE: "I'm having a bit of trouble connecting right now. Please try again in a moment.",
  FALLBACK_BOT_MESSAGE: "I'm sorry, I couldn't find a specific answer for that. How else can I help you?",
  LIVE_PREFIX: "Ask follow-ups before results. Confirm gender. Keep chat moving. Be brief."
};

const MuseCarousel = ({ slots }) => {
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {slots.map((product, pIdx) => (
          <div key={product.sku || pIdx} className={styles.emblaSlide}>
            <ProductCard product={product} compact={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShoppingMuse = () => {
  const { cart } = useCart();
  const { lang } = useCurrency();
  const { isMuseOpen, closeMuse, pendingQuery, clearPendingQuery } = useMuse();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableGroq, setEnableGroq] = useState(false);
  const [isLiveMic, setIsLiveMic] = useState(false);
  const isLiveMicRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const liveMicButtonRef = useRef(null);
  const [ttsState, setTtsState] = useState(null); // { msgId, visibleText }
  const ttsCharRef = useRef(0);
  const ttsMsgRef = useRef(null); // { id, fullText }
  const ttsIntervalRef = useRef(null);
  const [autoStartLive, setAutoStartLive] = useState(false);
  const hasAutoStarted = useRef(false);
  const messagesListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastBubbleRef = useRef(null);
  const lastProcessedQueryRef = useRef(null);
  const inputRef = useRef(null);

  const langLabel = CURRENCY_OPTIONS.find(o => o.lang === lang)?.langLabel ?? lang;

  const MESSAGE_MAX_LEN = 150;

  useEffect(() => {
    if (!lastBubbleRef.current || !messagesListRef.current) return;
    const list = messagesListRef.current;
    const isOverflowing = list.scrollHeight > list.clientHeight;
    if (!isOverflowing) return;
    const t = setTimeout(() => {
      const bubble = lastBubbleRef.current;
      if (!bubble) return;
      const listTop = list.getBoundingClientRect().top;
      const bubbleTop = bubble.getBoundingClientRect().top;
      list.scrollBy({ top: bubbleTop - listTop, behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(t);
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  useEffect(() => {
    isLiveMicRef.current = isLiveMic;
  }, [isLiveMic]);

  const speakBotMessage = useCallback((text, msgId) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    clearInterval(ttsIntervalRef.current);
    isSpeakingRef.current = true;
    ttsMsgRef.current = { id: msgId, fullText: text };
    ttsCharRef.current = 0;

    if (ENABLE_TYPEWRITER) {
      setTtsState({ msgId, visibleText: '' });
      // Word-by-word typewriter at ~2.5 words/sec (400ms/word)
      const tokens = text.split(' ');
      let idx = 0;
      ttsIntervalRef.current = setInterval(() => {
        idx++;
        const visible = tokens.slice(0, idx).join(' ');
        ttsCharRef.current = visible.length;
        setTtsState({ msgId, visibleText: visible });
        if (idx >= tokens.length) clearInterval(ttsIntervalRef.current);
      }, 400);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const cleanup = () => {
      clearInterval(ttsIntervalRef.current);
      setTtsState(null);
      ttsMsgRef.current = null;
      isSpeakingRef.current = false;
    };

    const assignVoiceAndSpeak = () => {
      const voice = resolveVoice(lang);
      if (voice) utterance.voice = voice;
      utterance.onend = cleanup;
      utterance.onerror = cleanup;
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      assignVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        assignVoiceAndSpeak();
      };
    }
  }, [lang]);

  const interruptSpeech = useCallback(() => {
    if (!isSpeakingRef.current || !ttsMsgRef.current) return;
    window.speechSynthesis.cancel();
    clearInterval(ttsIntervalRef.current);
    const { id, fullText } = ttsMsgRef.current;
    const truncated = ttsCharRef.current > 0 ? fullText.slice(0, ttsCharRef.current) : fullText;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: truncated } : m));
    setTtsState(null);
    ttsMsgRef.current = null;
    isSpeakingRef.current = false;
  }, []);

  const appendBotMessage = useCallback((text, widgets = []) => {
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text,
      widgets,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
    if (isLiveMicRef.current) speakBotMessage(botMessage.text, botMessage.id);
  }, [speakBotMessage]);

  const { sendToGroq, resetGroq } = useGroqConversation({
    cart,
    lang,
    onMessage: (text, isBot) => {
      if (isBot) {
        appendBotMessage(text, []);
        setIsLoading(false);
      }
    },
    onMuseResult: (response) => {
      appendBotMessage(response.answer || CONSTANTS.FALLBACK_BOT_MESSAGE, response.widgets || []);
      setIsLoading(false);
    },
    onError: () => {
      appendBotMessage(CONSTANTS.ERROR_BOT_MESSAGE, []);
      setIsLoading(false);
    },
  });

  const handleLiveTranscript = useCallback((text, displayText) => {
    interruptSpeech();
    if (enableGroq) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: displayText || text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      sendToGroq(text, displayText);
    } else {
      handleSendMessage(text, displayText);
    }
  }, [sendToGroq, interruptSpeech, enableGroq]);

  // Lock body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = isMuseOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMuseOpen]);

  // Process pending query when panel opens or a new query arrives
  useEffect(() => {
    if (!isMuseOpen) return;

    if (pendingQuery !== null) {
      const { query: q, live: isLiveRedirect } = pendingQuery;
      clearPendingQuery();

      const queryKey = q || '';
      if (lastProcessedQueryRef.current === queryKey) return;
      lastProcessedQueryRef.current = queryKey;

      if (isLiveRedirect && q) setAutoStartLive(true);
      const augmented = isLiveRedirect && q
        ? `${CONSTANTS.LIVE_PREFIX} ${q}`
        : (q || '');
      handleSendMessage(augmented, q || undefined);
      return;
    }

    // Panel opened without a pending query — show initial greeting if no messages yet
    if (messages.length === 0 && lastProcessedQueryRef.current === null) {
      lastProcessedQueryRef.current = '';
      handleSendMessage('');
    }
  }, [isMuseOpen, pendingQuery]);

  // Auto-start live mic after first bot response when redirected with ?live=1
  useEffect(() => {
    if (autoStartLive && !isLoading && messages.length >= 2 && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      liveMicButtonRef.current?.start(true);
    }
  }, [autoStartLive, isLoading, messages]);

  const handleSendMessage = async (text, displayText) => {
    if (!text.trim()) {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: CONSTANTS.INITIAL_BOT_MESSAGE,
        widgets: [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: displayText || text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await personalizationService.getMuseResponse({
        query: text,
        cart
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.answer || CONSTANTS.FALLBACK_BOT_MESSAGE,
        widgets: response.widgets || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      if (isLiveMicRef.current) speakBotMessage(botMessage.text, botMessage.id);
    } catch (error) {
      console.error('Error getting Muse response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: CONSTANTS.ERROR_BOT_MESSAGE,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    interruptSpeech();
    liveMicButtonRef.current?.stop();
    setTtsState(null);
    setMessages([]);
    setAutoStartLive(false);
    hasAutoStarted.current = false;
    lastProcessedQueryRef.current = '';
    resetGroq();
    Helper.setStoredValue('_dyMuseChatId', '', -1); // Clear the cookie
    handleSendMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    interruptSpeech();
    liveMicButtonRef.current?.stop();
    handleSendMessage(input);
  };

  return (
    <AnimatePresence>
      {isMuseOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMuse}
          />
          <motion.div
            className={styles.panel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logoContainer}>
            <Bot className={styles.botIcon} />
            <h1 className={styles.title}>{CONSTANTS.TITLE}</h1>
          </div>
          <p className={styles.subtitle}>{CONSTANTS.SUBTITLE}</p>
          <div className={styles.headerActions}>
            <button
              onClick={() => setEnableGroq(v => !v)}
              className={`${styles.groqToggle} ${enableGroq ? styles.groqToggleOn : ''}`}
              title={enableGroq ? 'Groq mode — click to use legacy Muse' : 'Legacy mode — click to use Groq'}
            >
              {enableGroq ? 'G+M' : 'M'}
            </button>
            <button
              onClick={handleReset}
              className={styles.resetButton}
              title={CONSTANTS.RESET_CHAT}
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={closeMuse}
              className={styles.closeButton}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messagesList} ref={messagesListRef}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.messageWrapper} ${msg.type === 'user' ? styles.userWrapper : styles.botWrapper}`}
              >
                <div className={styles.avatar}>
                  {msg.type === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={styles.messageContent}>
                  <div
                    className={styles.messageBubble}
                    ref={messages[messages.length - 1]?.id === msg.id ? lastBubbleRef : null}
                  >
                    <p className={styles.messageText}>
                      {ttsState?.msgId === msg.id ? ttsState.visibleText : msg.text}
                    </p>
                  </div>
                  
                  {msg.widgets && msg.widgets.length > 0 && ttsState?.msgId !== msg.id && (
                    <div className={styles.widgetsContainer}>
                      {msg.widgets.map((widget, wIdx) => (
                        <div key={wIdx} className={styles.widgetBlock}>
                          {widget.title && <h4 className={styles.widgetTitle}>{widget.title}</h4>}
                          <MuseCarousel slots={widget.slots} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <span className={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${styles.messageWrapper} ${styles.botWrapper}`}
            >
              <div className={styles.avatar}>
                <Bot size={18} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.loadingBubble}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} style={{ height: '1px', scrollMarginBottom: '2rem' }} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={CONSTANTS.PLACEHOLDER}
              className={styles.input}
              disabled={isLoading}
              maxLength={MESSAGE_MAX_LEN}
            />
            <span className={`${styles.charCount} ${input.length >= 140 ? styles.charCountWarning : ''}`}>
              {input.length}/{MESSAGE_MAX_LEN}
            </span>
          </div>
          <MicButton
            isDisabled={isLoading || isLiveMic}
            onTranscript={(t) => setInput(prev => prev ? `${prev} ${t}` : t)}
            lang={lang}
            tooltip={`Voice language: ${langLabel}`}
            className={styles.mic}
          />
          <LiveMicButton
            ref={liveMicButtonRef}
            lang={lang}
            isDisabled={isLoading}
            onTranscript={(text, displayText) => handleLiveTranscript(text, displayText)}
            onActiveChange={setIsLiveMic}
            onSoundStart={() => { if (isSpeakingRef.current) interruptSpeech(); }}
            tooltip={`Live language: ${langLabel}`}
            className={styles.liveMic}
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={!input.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
