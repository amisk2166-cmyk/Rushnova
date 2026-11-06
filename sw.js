const CACHE_NAME = 'rushnova-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive push notification from Supabase Edge Function
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: 'Rushnova',
      message: event.data ? event.data.text() : 'You have a new notification.'
    };
  }

  const title = data.title || 'Rushnova';
  const options = {
    body: data.message || data.body || 'You have a new notification.',
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    data: {
      url: data.url || data.action_url || (
        data.action_screen
          ? '/?screen=' + encodeURIComponent(data.action_screen)
          : '/'
      )
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Open Rushnova when notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/',
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
