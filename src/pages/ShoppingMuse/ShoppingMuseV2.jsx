import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, SendHorizontal, ShoppingCart, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMuse } from '../../context/MuseContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CURRENCY_OPTIONS } from '../../helpers/currencyConstants';
import { Helper } from '../../helpers/helper';
import { resolveVoice } from '../../helpers/voiceConstants';
import { useGroqConversation } from '../../hooks/useGroqConversation';
import { personalizationService } from '../../services/personalizationService';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { MicButton } from '../../components/MicButton/MicButton';
import { LiveMicButton } from '../../components/LiveMicButton/LiveMicButton';
import { MuseIcon } from '../../icons/MuseIcon/MuseIcon';
import { QuickActionsBar } from '../../components/QuickActionsBar/QuickActionsBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './ShoppingMuseV2.module.css';

const ENABLE_TYPEWRITER = false;
const MAX_SELECTED_PRODUCTS = 4;

const CONSTANTS = {
  TITLE: 'Personal Shopper',
  SUBTITLE: '',
  RESET_CHAT: 'Reset Chat',
  RESET: 'Reset',
  PLACEHOLDER: 'Ask me anything...',
  WELCOME_PLACEHOLDER: 'What are you looking for?',
  POWERED_BY: 'Powered by AI',
  THINKING: 'Thinking...',
  INITIAL_BOT_MESSAGE: "I'm here to help you find the perfect products. Just tell me what you need!",
  ERROR_BOT_MESSAGE: 'I\'m having a bit of trouble connecting right now. Please try again in a moment.',
  FALLBACK_BOT_MESSAGE: 'I\'m sorry, I couldn\'t find a specific answer for that. How else can I help you?',
};

const MuseCarousel = ({ slots, onProductSelect, selectedProducts, onNavigate, emblaApiRef }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  // Expose embla API to parent component
  useEffect(() => {
    if (emblaApiRef) {
      emblaApiRef.current = emblaApi;
    }
  }, [emblaApi, emblaApiRef]);

  const handleSelectToggle = useCallback((e, product) => {
    e.stopPropagation();
    onProductSelect && onProductSelect(product);
  }, [onProductSelect]);

  return (
    <div className={styles.embla} ref={emblaRef}>
      <div className={styles.emblaContainer}>
        {slots.map((product, pIdx) => {
          const productKey = product.id || product.sku || `product-${pIdx}`;
          const isSelected = selectedProducts?.some(p => (p.id || p.sku) === productKey);
          return (
            <div
              key={productKey}
              className={styles.emblaSlide}
            >
              <div className={styles.productCardWrapper}>
                <ProductCard
                  product={product}
                  compact={true}
                  addToCartPosition='bottom'
                  onNavigate={onNavigate}
                />
                <button
                  className={`${styles.selectButton} ${isSelected ? styles.selectButtonActive : ''}`}
                  onClick={(e) => handleSelectToggle(e, product)}
                  aria-label="Select product"
                >
                  {isSelected ? <Check size={16} /> : <Check size={16} />}
                  <span>{isSelected ? 'Selected' : 'Select'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MuseWidgetBlock = ({ widget, onProductSelect, selectedProducts, onNavigate }) => {
  const emblaApiRef = useRef(null);

  const scrollPrev = useCallback(() => emblaApiRef.current?.scrollPrev(), []);
  const scrollNext = useCallback(() => emblaApiRef.current?.scrollNext(), []);

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
      <MuseCarousel
        slots={widget.slots}
        onProductSelect={onProductSelect}
        selectedProducts={selectedProducts}
        onNavigate={onNavigate}
        emblaApiRef={emblaApiRef}
      />
    </div>
  );
};

export const ShoppingMuseV2 = () => {
  const { cart, cartId } = useCart();
  const { lang } = useCurrency();
  const { isMuseOpen, closeMuse, pendingQuery, clearPendingQuery, museConfig } = useMuse();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMic, setIsLiveMic] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [ttsState, setTtsState] = useState(null);
  
  const isLiveMicRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const liveMicButtonRef = useRef(null);
  const messagesListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastBubbleRef = useRef(null);
  const lastProcessedQueryRef = useRef(null);
  const inputRef = useRef(null);
  const ttsCharRef = useRef(0);
  const ttsMsgRef = useRef(null);
  const ttsIntervalRef = useRef(null);

  const langLabel = CURRENCY_OPTIONS.find(o => o.lang === lang)?.langLabel ?? lang;
  const MESSAGE_MAX_LEN = 150;
  const museName = museConfig.museName;

  useEffect(() => {
    isLiveMicRef.current = isLiveMic;
  }, [isLiveMic]);

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

  const speakBotMessage = useCallback((text, msgId) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    clearInterval(ttsIntervalRef.current);
    isSpeakingRef.current = true;
    ttsMsgRef.current = { id: msgId, fullText: text };
    ttsCharRef.current = 0;

    if (ENABLE_TYPEWRITER) {
      setTtsState({ msgId, visibleText: '' });
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

  const appendBotMessage = useCallback((text, widgets = [], blocks = []) => {
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text,
      widgets,
      blocks,
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
        appendBotMessage(text, [], []);
        setIsLoading(false);
      }
    },
    onMuseResult: (response) => {
      appendBotMessage(response.answer || CONSTANTS.FALLBACK_BOT_MESSAGE, response.widgets || [], response.blocks || []);
      setIsLoading(false);
    },
    onError: () => {
      appendBotMessage(CONSTANTS.ERROR_BOT_MESSAGE, [], []);
      setIsLoading(false);
    },
  });

  const handleProductSelect = useCallback((product) => {
    setSelectedProducts(prev => {
      const productKey = product.id || product.sku;
      const isSelected = prev.some(p => (p.id || p.sku) === productKey);
      if (isSelected) {
        return prev.filter(p => (p.id || p.sku) !== productKey);
      } else {
        // Limit to MAX_SELECTED_PRODUCTS
        if (prev.length >= MAX_SELECTED_PRODUCTS) {
          return prev;
        }
        return [...prev, product];
      }
    });
  }, []);

  const handleCompare = useCallback(() => {
    const names = selectedProducts.map(p => p.name).join(', ');
    const query = `Compare: ${names}`;
    handleSendMessage(query);
  }, [selectedProducts]);

  const handleFindSimilar = useCallback(() => {
    const skus = selectedProducts.map(p => p.sku || p.id).join(', ');
    const query = `Find items similar to: ${skus}`;
    handleSendMessage(query);
  }, [selectedProducts]);

  const handleAskAbout = useCallback(() => {
    const names = selectedProducts.map(p => p.name).join(', ');
    const query = `Tell me more about ${names}`;
    handleSendMessage(query);
  }, [selectedProducts]);

  const handleAddToCart = useCallback(async () => {
    if (selectedProducts.length === 0) return;

    // Track the add to cart action
    personalizationService.trackMuseEvent({
      name: 'Muse Add to Cart',
      properties: {
        dyType: 'muse-add-to-cart-v2',
        productCount: selectedProducts.length,
        productSkus: selectedProducts.map(p => p.sku || p.id).join(','),
        cartId
      },
      cart
    });

    try {
      // Send add to cart request to Muse without redirecting
      // Cart will be updated by external service via WebSocket
      const response = await personalizationService.getMuseResponseV2({
        query: `Add items to cart: ${selectedProducts.map(p => `${p.sku} (${p.name})`).join(', ')}`,
        cart,
        cartId,
        action: 'addToCart'
      });

      // Show confirmation message from Muse
      const confirmationMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.answer || `Added ${selectedProducts.length} item(s) to your cart. Ready to continue shopping?`,
        widgets: [],
        blocks: response.blocks || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, confirmationMessage]);

      // Deselect all products after adding to cart
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error adding to cart via Muse:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Sorry, I had trouble adding those items to your cart. Please try again.',
        blocks: [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [selectedProducts, cart, cartId]);

  useEffect(() => {
    document.body.style.overflow = isMuseOpen ? 'hidden' : '';
    if (isMuseOpen) {
      personalizationService.trackMuseEvent({ name: 'Muse Chat Open', properties: { dyType: 'muse-chat-open-v2' }, cart });
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMuseOpen, cart]);

  useEffect(() => {
    if (!isMuseOpen) return;
    if (pendingQuery !== null) {
      const { query: q } = pendingQuery;
      clearPendingQuery();
      if (lastProcessedQueryRef.current === q) return;
      lastProcessedQueryRef.current = q;
      if (q) {
        handleSendMessage(q);
      }
      return;
    }
    if (messages.length === 0 && lastProcessedQueryRef.current === null) {
      lastProcessedQueryRef.current = '';
      handleSendMessage('');
    }
  }, [isMuseOpen, pendingQuery]);

  const handleSendMessage = async (text, displayText) => {
    if (!text.trim()) {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: CONSTANTS.INITIAL_BOT_MESSAGE,
        widgets: [],
        blocks: [],
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

    personalizationService.trackMuseEvent({
      name: 'Muse Message Sent',
      properties: {
        dyType: 'muse-message-sent-v2',
        message: displayText || text,
        selectedProducts: selectedProducts.length,
        cartId
      },
      cart
    });

    try {
      const response = await personalizationService.getMuseResponseV2({
        query: text,
        cart,
        cartId,
        selectedProducts: selectedProducts.map(p => ({ id: p.id || p.sku, name: p.name, sku: p.sku }))
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.answer || CONSTANTS.FALLBACK_BOT_MESSAGE,
        widgets: response.widgets || [],
        blocks: response.blocks || [],
        timestamp: new Date()
      };

      if (response.widgets && response.widgets.length > 0) {
        personalizationService.trackMuseEvent({
          name: 'Muse Engagement',
          properties: {
            dyType: 'muse-engagement-v2',
            widgetCount: response.widgets.length,
            selectedProducts: selectedProducts.length
          },
          cart
        });
      }

      setMessages(prev => [...prev, botMessage]);
      if (isLiveMicRef.current) speakBotMessage(botMessage.text, botMessage.id);
    } catch (error) {
      console.error('Error getting Muse response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: CONSTANTS.ERROR_BOT_MESSAGE,
        blocks: [],
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
    setSelectedProducts([]);
    lastProcessedQueryRef.current = '';
    resetGroq();
    Helper.setStoredValue('_dyMuseChatId', '', -1);
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
                  <div className={styles.museIcon}>
                    <MuseIcon color="currentColor" size={16} />
                  </div>
                  <h1 className={styles.title}>{museName}</h1>
                </div>
                <div className={styles.headerActions}>
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

            <>
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
                              <div className={styles.messageText}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {ttsState?.msgId === msg.id ? ttsState.visibleText : msg.text}
                                </ReactMarkdown>
                              </div>
                            </div>

                            {msg.blocks && msg.blocks.length > 0 && ttsState?.msgId !== msg.id && (
                              <div className={styles.widgetsContainer}>
                                {msg.blocks.map((block, bIdx) => {
                                  if (block.type === 'recommendation') {
                                    console.log(`[ShoppingMuseV2] Rendering recommendation block ${bIdx}:`, {
                                      dataIsArray: Array.isArray(block.data),
                                      dataLength: block.data?.length,
                                      items: block.data
                                    });
                                    return block.data.map((item, itemIdx) => {
                                      console.log(`[ShoppingMuseV2] Rendering item ${itemIdx}:`, {
                                        title: item.title,
                                        slotsCount: item.slots?.length || 0,
                                        slots: item.slots
                                      });
                                      return (
                                        <MuseWidgetBlock
                                          key={`${bIdx}-${itemIdx}`}
                                          widget={{
                                            title: item.title || 'Recommendations',
                                            slots: item.slots || []
                                          }}
                                          onProductSelect={handleProductSelect}
                                          selectedProducts={selectedProducts}
                                          onNavigate={closeMuse}
                                        />
                                      );
                                    });
                                  }
                                  if (block.type === 'redirect' && block.data?.url) {
                                    const buttonLabel = block.data.type
                                      ? block.data.type.charAt(0).toUpperCase() + block.data.type.slice(1).toLowerCase()
                                      : 'Click here';
                                    return (
                                      <button
                                        key={bIdx}
                                        onClick={() => window.location.href = block.data.url}
                                        className={styles.redirectButton}
                                      >
                                        {buttonLabel}
                                      </button>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            )}

                            {msg.widgets && msg.widgets.length > 0 && ttsState?.msgId !== msg.id && (
                              <div className={styles.widgetsContainer}>
                                {msg.widgets.map((widget, wIdx) => (
                                  <MuseWidgetBlock
                                    key={wIdx}
                                    widget={widget}
                                    onProductSelect={handleProductSelect}
                                    selectedProducts={selectedProducts}
                                    onNavigate={closeMuse}
                                  />
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

                  {selectedProducts.length > 0 && (
                    <div className={styles.selectedProductsBar}>
                      {selectedProducts.map((product) => (
                        <div key={product.id || product.sku} className={styles.selectedProductThumbnail}>
                          <img src={Helper.getProductImage(product.image_url)} alt={product.name} />
                          <button
                            className={styles.removeButton}
                            onClick={() => handleProductSelect(product)}
                            aria-label={`Remove ${product.name}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <QuickActionsBar
                      selectedProducts={selectedProducts}
                      onCompare={handleCompare}
                      onFindSimilar={handleFindSimilar}
                      onAskAbout={handleAskAbout}
                      onAddToCart={handleAddToCart}
                    />
                  )}

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
                      onTranscript={(text, displayText) => {
                        interruptSpeech();
                        const userMessage = {
                          id: Date.now(),
                          type: 'user',
                          text: displayText || text,
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, userMessage]);
                        setIsLoading(true);
                        sendToGroq(text, displayText);
                      }}
                      onActiveChange={setIsLiveMic}
                      onSoundStart={() => { if (isSpeakingRef.current) interruptSpeech(); }}
                      tooltip={`Live language: ${langLabel}`}
                      className={styles.liveMic}
                    />
                    {selectedProducts.length > 0 && (
                      <button
                        type="button"
                        className={styles.checkoutButton}
                        onClick={handleAddToCart}
                        title="Add selected items to cart"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    )}
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
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
