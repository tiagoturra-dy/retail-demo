import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { AudioLines } from 'lucide-react';
import styles from './LiveMicButton.module.css';
import { useMuse } from '../../context/MuseContext';

export const LiveMicButton = forwardRef(({ lang, isDisabled, tooltip, onTranscript, onActiveChange, onNavigate, onSoundStart, className }, ref) => {
  const { isMuseOpen, openMuse } = useMuse();
  const [isLive, setIsLive] = useState(false);
  const recognitionRef = useRef(null);
  const isFirstRef = useRef(true);

  const stop = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsLive(false);
    isFirstRef.current = true;
    onActiveChange?.(false);
  };

  const startRecognition = (skipFirst = false) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || recognitionRef.current) return;

    isFirstRef.current = !skipFirst;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsLive(true);
      onActiveChange?.(true);
    };
    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return; // browser will fire onend and restart naturally
      recognitionRef.current = null;
      setIsLive(false);
      isFirstRef.current = true;
      onActiveChange?.(false);
    };
    recognition.onend = () => {
      if (recognitionRef.current) {
        recognition.start();
      }
    };
    recognition.onsoundstart = () => {
      onSoundStart?.();
    };
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (!transcript) return;

      if (isFirstRef.current && !isMuseOpen) {
        // Muse panel not open yet — open it with the query and live flag
        stop();
        onNavigate?.();
        openMuse({ query: transcript, live: true });
        return;
      }

      const text = isFirstRef.current
        ? `Ask any relevant follow up question before showing results. ${transcript}`
        : transcript;
      isFirstRef.current = false;
      onTranscript?.(text, transcript);
    };

    recognition.start();
  };

  // Expose stop() and start() to parent
  useImperativeHandle(ref, () => ({ stop, start: startRecognition }));

  const handleClick = () => {
    if (isLive) { stop(); return; }
    startRecognition();
  };

  const tooltipText = isLive
    ? 'Live — click to stop'
    : tooltip;

  return (
    <div className={`${styles.liveMicWrapper}${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={`${styles.liveMicButton} ${isLive ? styles.liveMicButtonActive : ''}`}
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={isLive ? 'Stop live mic' : 'Start live conversation'}
      >
        <AudioLines size={20} />
      </button>
      <span className={styles.liveMicTooltip}>{tooltipText}</span>
    </div>
  );
});

LiveMicButton.displayName = 'LiveMicButton';
