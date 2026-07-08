import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ContentClient } from 'dc-delivery-sdk-js';
import ReactMarkdown from 'react-markdown';
import { Helper } from '../../helpers/helper';
import { MuseStripBanner } from '../../components/MuseStripBanner/MuseStripBanner';
import { useMuse } from '../../context/MuseContext';
import styles from './BlogArticlePage.module.css';

export const BlogArticlePage = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const amplienceClient = process.env.AMPLIENCE_HUB_NAME
      ? new ContentClient({
        hubName: process.env.AMPLIENCE_HUB_NAME,
        parameters: {
          depth: 'all',
          format: 'inlined',
        },
      })
      : null;

    const fetchArticle = async () => {
      if (!amplienceClient) {
        setError('Amplience is not configured.');
        setLoading(false);
        return;
      }
      try {
        const response = await amplienceClient.getContentItemById(articleId);
        setArticle(response.body);
      } catch (err) {
        console.error('Amplience fetch failed:', err);
        setError('Failed to load article.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) return <div className={styles.state}>Loading...</div>;
  if (error) return <div className={styles.state}>{error}</div>;
  if (!article) return null;

  const { blogcontent, blogdate } = article;
  const textBlocks = blogcontent?.content?.text ?? [];
  const headerImage = textBlocks.find((b) => b.type === 'dc-image-link');
  const markdownBlock = textBlocks.find((b) => b.type === 'markdown');
  const imageAlt = blogcontent?.image?.imageAltText ?? '';
  const musePrompt = article?.urls?.[1]?.url ?? '';

  const musePills = musePrompt
    ? musePrompt.split('||').map((s) => {
        const [label, prompt] = s.split('|');
        return { label: label.trim(), prompt: (prompt ?? '').trim() };
      })
    : [];

  const { openMuse } = useMuse();

  return (
    <article className={styles.article}>
      {headerImage && (
        <div className={styles.heroWrapper}>
          <img
            src={Helper.getAmplienceImageUrl(headerImage.data)}
            alt={imageAlt}
            className={styles.heroImage}
          />
        </div>
      )}

      <div className={styles.body}>
        {blogcontent?.title && (
          <h1 className={styles.title}>{blogcontent.title}</h1>
        )}

        {blogdate && (
          <p className={styles.date}>
            {new Date(blogdate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        
        {musePills.length > 0 && (
          <div className={styles.pillRow}>
            {musePills.map(({ label, prompt }) => (
              <button
                key={label}
                type="button"
                className={styles.pill}
                onClick={() => openMuse({ query: prompt })}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {markdownBlock?.data && (
          <div className={styles.content}>
            <ReactMarkdown>{markdownBlock.data}</ReactMarkdown>
          </div>
        )}
      </div>
    </article>
  );
};
