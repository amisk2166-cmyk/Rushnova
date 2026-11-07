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
        message: event.data ? event.data.text() : ''
      };
    }

    const title = 'Rushnova';
    const message = data.message || data.body ||
      'You have a new Rushnova notification.';

    await self.registration.showNotification(title, {
      body: message,
      icon: '/images/icon-192.png',
      badge: '/images/badge-72.png',
      tag: data.tag || 'rushnova-notification',
      renotify: true,
      timestamp: Date.now()
    });
  })());
});

// Close notification only. No link will open.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});
