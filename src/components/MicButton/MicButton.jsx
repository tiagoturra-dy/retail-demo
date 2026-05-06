import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import styles from './MicButton.module.css';

export const MicButton = ({ isDisabled, onTranscript, tooltip, lang, className }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    if (lang) recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript?.(transcript);
    };

    recognition.start();
  };

  return (
    <div className={`${styles.micWrapper}${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={`${styles.micButton} ${isListening ? styles.micButtonActive : ''}`}
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      {tooltip && (
        <span className={styles.micTooltip}>
          {isListening ? 'Listening...' : tooltip}
        </span>
      )}
    </div>
  );
};
