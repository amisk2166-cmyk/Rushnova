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

  const options = {
    body: data.body || data.message || 'You have a new notification.',
    data: {
      url: '/',
      actionScreen: data.url || '/'
    },
    tag: 'rushnova-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Open Rushnova when notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL('/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();
          return;
        }
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
