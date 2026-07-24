importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA3cY6sh9xUlQFWx7pbxmdgyNYhton2tLI",
  authDomain: "dy-retail-demo.firebaseapp.com",
  projectId: "dy-retail-demo",
  storageBucket: "dy-retail-demo.firebasestorage.app",
  messagingSenderId: "85788423626",
  appId: "1:85788423626:web:d6ebcc727918fe338f8b33",
  measurementId: "G-5PBP0EM2KK"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  // Pass DY tracking data through so notificationclick can report PN_CLICK
  const dyTracking = payload.data && payload.data['dy-tracking']
    ? JSON.parse(payload.data['dy-tracking'])
    : null;
  self.registration.showNotification(title || 'New notification', {
    body,
    icon: icon || '/favicon-194x194.webp',
    data: { dyTracking, url: payload.data && payload.data.url },
  });
});

// Report PN_CLICK to DY when user clicks the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { dyTracking, url } = event.notification.data || {};

  const reportClick = dyTracking
    ? fetch('/api/webpush/pn-click', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tracking: dyTracking }),
      }).catch(() => {})
    : Promise.resolve();

  const openWindow = clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    const target = url || '/';
    for (const client of clientList) {
      if (client.url === target && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(target);
  });

  event.waitUntil(Promise.all([reportClick, openWindow]));
});
