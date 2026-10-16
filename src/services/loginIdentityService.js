import { Helper } from '../helpers/helper.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => (typeof email === 'string' ? email : '').trim().toLowerCase();

const getAllowedDomains = () => {
  const configuredDomains = window.__dyRuntimeConfig?.config?.login?.allowedDomains;

  return Helper.parseDelimitedConfigList(configuredDomains)
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
};

export const isAllowedLoginEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) return false;

  const domain = normalizedEmail.split('@')[1];
  return getAllowedDomains().includes(domain);
};

export const getAllowedLoginDomains = () => getAllowedDomains();

export const hashEmail = async (email) => {
  const emailBytes = new TextEncoder().encode(normalizeEmail(email));
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', emailBytes);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const sendLoginEvent = async ({ email, userId = '' }) => {
  const normalizedEmail = normalizeEmail(email);
  const hashedEmail = normalizedEmail ? await hashEmail(normalizedEmail) : '';
  const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
  const cuid = normalizedUserId || hashedEmail;

  if (!cuid) return null;

  if (window.DY && typeof window.DY.API === 'function') {
    const secondaryIdentifiers = hashedEmail
      ? [{ type: 'he', value: hashedEmail }]
      : [];

    window.DY.API('event', {
      name: 'Login',
      properties: {
        dyType: 'login-v1',
        cuid,
        cuidType: normalizedUserId ? 'id' : 'he',
        secondaryIdentifiers,
      },
    });
  }

  return { hashedEmail, cuid };
};