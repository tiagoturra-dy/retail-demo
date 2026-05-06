import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, RotateCcw } from 'lucide-react';
import { MicButton } from '../../components/MicButton/MicButton';
import { LiveMicButton } from '../../components/LiveMicButton/LiveMicButton';
import useEmblaCarousel from 'embla-carousel-react';
import { personalizationService } from '../../services/personalizationService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../../helpers/currencyConstants';
import { Helper } from '../../helpers/helper';
import styles from './ShoppingMuse.module.css';

const CONSTANTS = {
  TITLE: "Personal Shopper",
  SUBTITLE: "Your AI shopping assistant",
  RESET_CHAT: "Reset Chat",
  RESET: "Reset",
  PLACEHOLDER: "Ask me anything...",
  THINKING: "Thinking...",
  INITIAL_BOT_MESSAGE: "I'm here to help you find the perfect products. Just tell me what you need!",
  ERROR_BOT_MESSAGE: "I'm having a bit of trouble connecting right now. Please try again in a moment.",
  FALLBACK_BOT_MESSAGE: "I'm sorry, I couldn't find a specific answer for that. How else can I help you?"
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
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMic, setIsLiveMic] = useState(false);
  const isLiveMicRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const liveMicButtonRef = useRef(null);
  const autoStartLive = searchParams.get('live') === '1';
  const hasAutoStarted = useRef(false);
  const messagesListRef = useRef(null);
  const messagesEndRef = useRef(null);

  const langLabel = CURRENCY_OPTIONS.find(o => o.lang === lang)?.langLabel ?? lang;

  const MESSAGE_MAX_LEN = 150;

  useEffect(() => {
    isLiveMicRef.current = isLiveMic;
  }, [isLiveMic]);

  const speakBotMessage = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const assignVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const langBase = lang.split('-')[0].toLowerCase();
      const googleVoice = voices.find(v =>
        v.name.toLowerCase().includes('google') && v.lang.toLowerCase().startsWith(langBase)
      );
      const fallbackVoice = voices.find(v => v.lang.toLowerCase().startsWith(langBase));
      if (googleVoice) utterance.voice = googleVoice;
      else if (fallbackVoice) utterance.voice = fallbackVoice;
      utterance.onend = () => { isSpeakingRef.current = false; };
      utterance.onerror = () => { isSpeakingRef.current = false; };
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

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Small timeout to ensure DOM has updated and animations have started
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const isLiveRedirect = searchParams.get('live') === '1';
    let initialQuery = urlQuery || null;

    if (!initialQuery) {
      const storedData = localStorage.getItem('retailDemo');
      if (storedData) {
        try {
          const retailDemo = JSON.parse(storedData);
          initialQuery = retailDemo?.museQuery || null;

          if (initialQuery) {
            // Clear the variable after use in localStorage
            retailDemo.museQuery = null;
            localStorage.setItem('retailDemo', JSON.stringify(retailDemo));
          }
        } catch (e) {
          console.error('Error parsing retailDemo from localStorage', e);
        }
      }
    }

    const augmented = isLiveRedirect && initialQuery
      ? `Ask any relevant follow up question before showing results. ${initialQuery}`
      : (initialQuery || '');
    handleSendMessage(augmented, initialQuery || undefined);
  }, []);

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
      if (isLiveMicRef.current) speakBotMessage(botMessage.text);
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
    window.speechSynthesis?.cancel();
    liveMicButtonRef.current?.stop();
    setMessages([]);
    Helper.setStoredValue('_dyMuseChatId', '', -1); // Clear the cookie
    handleSendMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    liveMicButtonRef.current?.stop();
    handleSendMessage(input);
  };

  return (
    <div className={styles.musePage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div className={styles.logoContainer}>
              <Bot className={styles.botIcon} />
              <h1 className={styles.title}>{CONSTANTS.TITLE}</h1>
            </div>

            <p className={styles.subtitle}>{CONSTANTS.SUBTITLE}</p>
            
            <button 
              onClick={handleReset} 
              className={styles.resetButton}
              title={CONSTANTS.RESET_CHAT}
            >
              <RotateCcw size={18} />
              <span>{CONSTANTS.RESET}</span>
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
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.messageWrapper} ${msg.type === 'user' ? styles.userWrapper : styles.botWrapper}`}
              >
                <div className={styles.avatar}>
                  {msg.type === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageBubble}>
                    <p className={styles.messageText}>{msg.text}</p>
                  </div>
                  
                  {msg.widgets && msg.widgets.length > 0 && (
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
          />
          <LiveMicButton
            ref={liveMicButtonRef}
            lang={lang}
            isDisabled={isLoading}
            onTranscript={(text, displayText) => { if (!isSpeakingRef.current) handleSendMessage(text, displayText); }}
            onActiveChange={setIsLiveMic}
            tooltip={`Voice language: ${langLabel}`}
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
    </div>
  );
};
