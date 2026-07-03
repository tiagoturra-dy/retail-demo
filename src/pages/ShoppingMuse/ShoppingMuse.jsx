import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, RotateCcw, X, SendHorizontal, Search, Sparkles } from 'lucide-react';
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
import { MuseIcon } from '../../icons/MuseIcon/MuseIcon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartSearchIcon } from '../../icons/SmartSearchIcon/SmartSearchIcon';

const ENABLE_TYPEWRITER = false; // set to false to show full text immediately

const CONSTANTS = {
  TITLE: "Personal Shopper",
  SUBTITLE: "",
  RESET_CHAT: "Reset Chat",
  RESET: "Reset",
  PLACEHOLDER: "Ask me anything...",
  WELCOME_PLACEHOLDER: "What are you looking for?",
  POWERED_BY: "Powered by AI",
  SUGGESTED_SEARCHES: "Suggested searches",
  THINKING: "Thinking...",
  INITIAL_BOT_MESSAGE: "I'm here to help you find the perfect products. Just tell me what you need!",
  ERROR_BOT_MESSAGE: "I'm having a bit of trouble connecting right now. Please try again in a moment.",
  FALLBACK_BOT_MESSAGE: "I'm sorry, I couldn't find a specific answer for that. How else can I help you?",
  LIVE_PREFIX: "Ask follow-ups before results. Confirm gender. Keep chat moving. Be brief."
};

const MuseCarousel = ({ slots, onApiReady, onNavigate }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  useEffect(() => {
    if (emblaApi && onApiReady) onApiReady(emblaApi);
  }, [emblaApi, onApiReady]);

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {slots.map((product, pIdx) => (
          <div key={product.sku || pIdx} className={styles.emblaSlide}>
            <ProductCard product={product} compact={true} addToCartPosition='bottom' onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </div>
  );
};

const MuseWidgetBlock = ({ widget, onNavigate }) => {
  const emblaApiRef = useRef(null);

  const scrollPrev = useCallback(() => emblaApiRef.current?.scrollPrev(), []);
  const scrollNext = useCallback(() => emblaApiRef.current?.scrollNext(), []);

  const handleApiReady = useCallback((api) => {
    emblaApiRef.current = api;
  }, []);

  return (
    <div className={styles.widgetBlock}>
      <div className={styles.widgetHeader}>
        {widget.title && <h4 className={styles.widgetTitle}>{widget.title}</h4>}
        <div className={styles.widgetNavButtons}>
          <button className={styles.widgetNavButton} onClick={scrollPrev} aria-label="Previous">
            <ChevronLeft size={16} />
          </button>
          <button className={styles.widgetNavButton} onClick={scrollNext} aria-label="Next">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <MuseCarousel slots={widget.slots} onApiReady={handleApiReady} onNavigate={onNavigate} />
    </div>
  );
};

const AiSearchIcon = () => (
  <span className={styles.aiSearchIcon}>
    <Search size={15} />
    <Sparkles size={9} className={styles.aiSearchSparkle} />
  </span>
);

const MuseDisclaimer = ({ disclaimer }) => (
  <p className={styles.welcomeDisclaimer}>
    <span>{disclaimer.text}</span>
    {disclaimer.links.length > 0 && (
      <span className={styles.welcomeDisclaimerLinks}>
        {' '}
        {disclaimer.links.map((link, i) => (
          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
        ))}
      </span>
    )}
  </p>
);

const MuseSearchForm = ({ value, onChange, onSubmit, inputRef, inputClassName, formClassName, onFocus, onBlur }) => (
  <form onSubmit={e => { e.preventDefault(); if (value.trim()) onSubmit(value.trim()); }} className={formClassName || styles.welcomeForm}>
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={CONSTANTS.WELCOME_PLACEHOLDER}
      className={inputClassName || styles.welcomeInput}
      onFocus={onFocus}
      onBlur={onBlur}
    />
    <button type="submit" className={styles.welcomeSubmitBtn} disabled={!value.trim()}>
      <SendHorizontal size={16} />
    </button>
  </form>
);

const MuseWelcomeV1 = ({ museName, trendingQueries, disclaimer, onSubmit, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className={styles.welcomeV1}>
      <div className={styles.welcomeScroll}>
        <button className={styles.welcomeCloseBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className={styles.welcomeIconWrap}>
          <div className={styles.welcomeIconCircle}>
            <MuseIcon color="currentColor" size={22} />
          </div>
        </div>
        <h1 className={styles.welcomeTitle}>{museName}</h1>
        <p className={styles.welcomePowered}>{CONSTANTS.POWERED_BY}</p>
        <MuseSearchForm value={query} onChange={setQuery} onSubmit={onSubmit} inputRef={inputRef} />
        {trendingQueries.length > 0 && (
          <div className={styles.welcomeChips}>
            {trendingQueries.map((q, i) => (
              <button key={i} type="button" className={styles.welcomeChip} onClick={() => onSubmit(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
      <MuseDisclaimer disclaimer={disclaimer} />
    </div>
  );
};

const MuseWelcomeV2 = ({ museName, trendingQueries, disclaimer, welcomeProducts, onSubmit, onClose }) => {
  const [query, setQuery] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleFocus = () => {
    if (formRef.current && containerRef.current) {
      const formRect = formRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setDropdownTop(formRect.bottom - containerRect.top);
    }
    setInputFocused(true);
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logoContainer}>
            <div className={styles.museIcon}>
              <MuseIcon color="currentColor" size={16} />
            </div>
            <h1 className={styles.title}>{museName}</h1>
          </div>
          <div className={styles.headerActions}>
            <button onClick={onClose} className={styles.closeButton} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className={styles.welcomeV2} ref={containerRef}>
        <div className={styles.welcomeScroll}>
          <div className={styles.welcomeV2SearchWrap} ref={formRef}>
            <MuseSearchForm
              value={query}
              onChange={setQuery}
              onSubmit={onSubmit}
              inputRef={inputRef}
              formClassName={styles.welcomeV2Form}
              inputClassName={styles.welcomeV2Input}
              onFocus={handleFocus}
              onBlur={() => setInputFocused(false)}
            />
          </div>
          {(welcomeProducts.length > 0 || trendingQueries.length > 0) && (
            <div className={styles.welcomeV2Grid}>
              {(() => {
                const items = [];
                const maxLen = Math.max(welcomeProducts.length, trendingQueries.length);
                for (let i = 0; i < maxLen; i++) {
                  const productEl = i < welcomeProducts.length ? (
                    <div key={`p-${i}`} className={styles.welcomeV2GridItem} style={{ '--desktopOrder': i * 2 }}>
                      <ProductCard product={welcomeProducts[i]} compact={true} addToCartPosition='right' onNavigate={closeMuse} style={{ maxWidth: '100%' }} />
                    </div>
                  ) : null;
                  const chipEl = i < trendingQueries.length ? (
                    <button key={`q-${i}`} type="button" className={styles.welcomeV2QueryCard} style={{ '--desktopOrder': i * 2 + 1 }} onClick={() => onSubmit(trendingQueries[i])}>
                      <SmartSearchIcon size={28} />
                      <span>{trendingQueries[i]}</span>
                    </button>
                  ) : null;
                  // Mobile (2-col): even rows → product left / chip right; odd rows → chip left / product right
                  if (i % 2 === 0) {
                    if (productEl) items.push(productEl);
                    if (chipEl) items.push(chipEl);
                  } else {
                    if (chipEl) items.push(chipEl);
                    if (productEl) items.push(productEl);
                  }
                }
                return items;
              })()}
            </div>
          )}
        </div>
        <MuseDisclaimer disclaimer={disclaimer} />
        {trendingQueries.length > 0 && inputFocused && (
          <div className={styles.welcomeV2Queries} style={{ top: dropdownTop }}>
            <p className={styles.welcomeV2QueriesLabel}>{CONSTANTS.SUGGESTED_SEARCHES}</p>
            {trendingQueries.map((q, i) => (
              <button key={i} type="button" className={styles.welcomeV2Query} onMouseDown={e => e.preventDefault()} onClick={() => onSubmit(q)}>
                <SmartSearchIcon size={20} />
                <span>{q}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export const ShoppingMuse = () => {
  const { cart } = useCart();
  const { lang } = useCurrency();
  const { isMuseOpen, closeMuse, pendingQuery, clearPendingQuery, museConfig } = useMuse();
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

  const museVersion = museConfig.version;       // 'chat' | 'v1' | 'v2'
  const museName = museConfig.museName;
  const trendingQueries = museConfig.trendingQueries;
  const disclaimer = museConfig.disclaimer;
  const showWelcome = messages.length === 0 && museVersion !== 'chat';
  const isV1 = museVersion === 'v1';

  const [welcomeProducts, setWelcomeProducts] = useState([]);

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

  useEffect(() => {
    if (museVersion !== 'v2' || !isMuseOpen) return;
    personalizationService.getRecommendations({ selectors: ['MuseHomeRecs'] })
      .then(data => {
        const rawSlots = data?.choices?.[0]?.variations?.[0]?.payload?.data?.slots || [];
        const slots = rawSlots.map(slot => ({ ...slot, ...slot.productData }));
        setWelcomeProducts(slots);
      })
      .catch(() => {});
  }, [museVersion, isMuseOpen]);

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

      // v1/v2 with no query: show welcome screen, don't trigger bot greeting
      if (!q && museConfig.version !== 'chat') return;

      if (isLiveRedirect && q) setAutoStartLive(true);
      const augmented = isLiveRedirect && q
        ? `${CONSTANTS.LIVE_PREFIX} ${q}`
        : (q || '');
      handleSendMessage(augmented, q || undefined);
      return;
    }

    // Panel opened without a pending query — show welcome or greeting depending on version
    if (messages.length === 0 && lastProcessedQueryRef.current === null) {
      lastProcessedQueryRef.current = '';
      if (museConfig.version === 'chat') {
        handleSendMessage('');
      }
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
    if (museVersion === 'chat') handleSendMessage('');
    else lastProcessedQueryRef.current = null; // allow welcome screen to re-init on next open
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
            {showWelcome ? (
              isV1 ? (
                <MuseWelcomeV1
                  museName={museName}
                  trendingQueries={trendingQueries}
                  disclaimer={disclaimer}
                  onSubmit={handleSendMessage}
                  onClose={closeMuse}
                />
              ) : (
                <MuseWelcomeV2
                  museName={museName}
                  trendingQueries={trendingQueries}
                  disclaimer={disclaimer}
                  welcomeProducts={welcomeProducts}
                  onSubmit={handleSendMessage}
                  onClose={closeMuse}
                />
              )
            ) : (
              <>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logoContainer}>
            <div className={styles.museIcon}>
              <MuseIcon className={`dy-nav-icon ${styles.botIcon}`} color="currentColor" size={16} />
            </div>
            <h1 className={styles.title}>{museName}</h1>
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
                        <MuseWidgetBlock key={wIdx} widget={widget} onNavigate={closeMuse} />
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
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
