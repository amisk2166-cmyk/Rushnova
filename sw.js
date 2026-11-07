
'use strict';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive Rushnova push notification
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      body: event.data ? event.data.text() : 'New Rushnova notification'
    };
  }

  const title = data.title || 'Rushnova';

  // Allow only URLs from the Rushnova website
  let targetUrl = '/';

  try {
    const requestedUrl = new URL(data.url || data.actionScreen || '/', self.location.origin);
    if (requestedUrl.origin === self.location.origin) {
      targetUrl = requestedUrl.href;
    }
  } catch (error) {
    targetUrl = self.location.origin + '/';
  }

  const options = {
    body: data.body || data.message || 'You have a new notification.',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: targetUrl
    },
    tag: data.tag || 'rushnova-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Open the correct Rushnova screen when notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || (self.location.origin + '/');

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();

          if (client.navigate) {
            await client.navigate(targetUrl);
          }

          return;
        }
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
