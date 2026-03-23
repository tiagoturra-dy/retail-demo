import React from 'react';
import { MastercardLogo } from '../../icons/MastercardLogo/MastercardLogo';
import styles from './PoweredBy.module.css';

export const PoweredBy = ({ className = '' }) => {
  return (
    <div className={`${styles.poweredByContainer} ${className}`}>
      Powered by
      <MastercardLogo size={32} />
    </div>
  );
};
