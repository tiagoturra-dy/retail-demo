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
  console.log('[WEBPUSH] Background message received:', payload);
  const { title, body, icon } = payload.notification || {};
  // Pass DY tracking data through so notificationclick can report PN_CLICK
  const dyTracking = payload.data && payload.data['dy-tracking']
    ? JSON.parse(payload.data['dy-tracking'])
    : null;
  const url = payload.data && payload.data.url;
  console.log('[WEBPUSH] Extracted URL:', url, 'DY Tracking:', dyTracking ? 'present' : 'absent');
  self.registration.showNotification(title || 'New notification', {
    body,
    icon: icon || '/favicon-194x194.webp',
    data: { dyTracking, url },
  });
});

// Report PN_CLICK to DY when user clicks the notification
self.addEventListener('notificationclick', (event) => {
  console.log('[WEBPUSH] Notification clicked:', event.notification.data);
  event.notification.close();
  const { dyTracking, url } = event.notification.data || {};
  const target = url || '/';
  console.log('[WEBPUSH] Target URL:', target);

  const reportClick = dyTracking
    ? fetch('/api/webpush/pn-click', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tracking: dyTracking }),
      }).then(r => console.log('[WEBPUSH] PN_CLICK reported:', r.status)).catch((err) => console.error('[WEBPUSH] PN_CLICK error:', err))
    : Promise.resolve();

  const openWindow = clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    console.log('[WEBPUSH] Found', clientList.length, 'clients');
    
    // If we have an open window, navigate it to the target
    if (clientList.length > 0) {
      const client = clientList[0];
      console.log('[WEBPUSH] Navigating existing client to:', target);
      return client.navigate(target).then((result) => {
        console.log('[WEBPUSH] Navigate result:', result);
        if (result) return result.focus();
        // Navigation failed, try opening new window
        console.log('[WEBPUSH] Navigate failed, opening new window');
        return clients.openWindow(target);
      });
    }
    
    // No open windows, open new one
    console.log('[WEBPUSH] No clients found, opening new window to:', target);
    return clients.openWindow(target);
  });

  event.waitUntil(Promise.all([reportClick, openWindow]));
});
