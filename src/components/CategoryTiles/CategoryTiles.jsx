import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CategoryTiles.module.css';

const vPositionMap = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

const hPositionMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const CategoryTile = ({ data }) => {
  const { image, title, subtitle, buttons, layout } = data;

  const color = layout?.color || '#ffffff';
  const vPos = vPositionMap[layout?.v_position] || 'flex-end';
  const hPos = hPositionMap[layout?.position] || 'center';
  const textAlign = layout?.position || 'center';

  const href = buttons?.[0]?.link || '#';
  const cta = buttons?.[0]?.cta;

  return (
    <Link to={href} className={styles.tile}>
      <img src={image} alt={title} className={styles.image} />
      <div className={styles.overlay} />
      <div
        className={styles.content}
        style={{ justifyContent: vPos, alignItems: hPos, color }}
      >
        <div className={styles.textGroup} style={{ textAlign }}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {cta && <span className={styles.cta}>{cta}</span>}
        </div>
      </div>
    </Link>
  );
};

export const CategoryTiles = ({ choice }) => {
  if (!choice?.variations?.length) return null;

  const tiles = choice.variations
    .map(v => v.payload?.data)
    .filter(Boolean);

  if (!tiles.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {tiles.map((tile, idx) => (
          <CategoryTile key={idx} data={tile} />
        ))}
      </div>
    </section>
  );
};
