
'use strict';

// Rushnova Service Worker

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive Rushnova Push Notification
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let data = {};

    try {
      data = event.data ? event.data.json() : {};
    } catch (error) {
      data = {
        body: event.data
          ? event.data.text()
          : 'New Rushnova notification'
      };
    }

    const title = data.title || 'Rushnova';

    // Validate notification destination
    let targetUrl = self.location.origin + '/';

    try {
      const requestedUrl = new URL(
        data.url || data.actionScreen || '/',
        self.location.origin
      );

      if (requestedUrl.origin === self.location.origin) {
        targetUrl = requestedUrl.href;
      }
    } catch (error) {
      targetUrl = self.location.origin + '/';
    }

    const options = {
      body: data.body || data.message ||
        'You have a new Rushnova notification.',

      // Correct Rushnova logo paths
      icon: '/images/icon-192.png',
      badge: '/images/badge-72.png',

      data: {
        url: targetUrl
      },

      tag: data.tag || 'rushnova-notification',
      renotify: true,
      timestamp: Date.now()
    };

    await self.registration.showNotification(title, options);
  })());
});


// Open Rushnova screen when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url ||
    (self.location.origin + '/');

  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of clientList) {
      if (new URL(client.url).origin === self.location.origin) {
        await client.focus();

        if (client.navigate) {
          await client.navigate(targetUrl);
        }

        return;
      }
    }

    await self.clients.openWindow(targetUrl);
  })());
});
