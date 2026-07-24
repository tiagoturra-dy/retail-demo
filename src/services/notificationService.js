import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../lib/firebase.js';
import { Helper } from '../helpers/helper.js';

const VAPID_KEY = process.env.FIREBASE_VAPID_KEY;

async function callDyPushEndpoint(action, token) {
  const dyid = Helper.getStoredValue('_dyid');
  try {
    await fetch(`/api/webpush/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dyid: dyid || '', token }),
    });
  } catch (err) {
    console.error(`DY push ${action} failed:`, err);
  }
}

/**
 * Request notification permission, return the FCM token, and opt-in with DY.
 * Returns null if permission is denied or unsupported.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission denied.');
    return null;
  }

  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) await callDyPushEndpoint('opt-in', token);
    return token || null;
  } catch (err) {
    console.error('Failed to get FCM token:', err);
    return null;
  }
}

/**
 * Opt the user out of web push in DY and clear the stored token.
 */
export async function revokeNotificationPermission() {
  const token = localStorage.getItem('fcm_token');
  if (!token) return;
  await callDyPushEndpoint('opt-out', token);
  localStorage.removeItem('fcm_token');
}

/**
 * Listen for foreground messages.
 * @param {(payload: object) => void} callback
 * @returns unsubscribe function
 */
export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}
