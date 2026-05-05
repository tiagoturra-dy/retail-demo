import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Radio } from 'lucide-react';
import styles from './LiveMicButton.module.css';

export const LiveMicButton = forwardRef(({ lang, isDisabled, onTranscript, onActiveChange }, ref) => {
  const [isLive, setIsLive] = useState(false);
  const recognitionRef = useRef(null);
  const isFirstRef = useRef(true);
  const isEnglish = lang?.startsWith('en');

  const stop = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsLive(false);
    isFirstRef.current = true;
    onActiveChange?.(false);
  };

  // Expose stop() so parent can call it on reset/submit
  useImperativeHandle(ref, () => ({ stop }));

  const handleClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !isEnglish) return;

    if (isLive) {
      stop();
      return;
    }

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
    recognition.onerror = () => {
      setIsLive(false);
      isFirstRef.current = true;
      onActiveChange?.(false);
    };
    recognition.onend = () => {
      // Restart if still in live mode (browser ends session after silence)
      if (recognitionRef.current) {
        recognition.start();
      }
    };
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (!transcript) return;
      const text = isFirstRef.current
        ? `Ask any relevant follow up question before showing results. ${transcript}`
        : transcript;
      isFirstRef.current = false;
      onTranscript?.(text, transcript);
    };

    recognition.start();
  };

  const tooltipText = isLive
    ? 'Live — click to stop'
    : isEnglish
      ? 'Live conversation'
      : 'English only';

  return (
    <div className={styles.liveMicWrapper}>
      <button
        type="button"
        className={`${styles.liveMicButton} ${isLive ? styles.liveMicButtonActive : ''}`}
        onClick={handleClick}
        disabled={isDisabled || !isEnglish}
        aria-label={isLive ? 'Stop live mic' : 'Start live conversation'}
      >
        <Radio size={20} />
      </button>
      <span className={styles.liveMicTooltip}>{tooltipText}</span>
    </div>
  );
});

LiveMicButton.displayName = 'LiveMicButton';
