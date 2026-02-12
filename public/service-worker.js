// public/service-worker.js

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Yangi Bildirishnoma';
  const options = {
    body: data.body || 'Sizga yangi xabar keldi.',
    icon: data.icon || '/favicon.ico', // Ilovangiz ikonkasiga yo'l
    badge: data.badge || '/favicon.ico', // Badge ikonkasiga yo'l
    data: {
      url: data.url || '/', // Bildirishnomani bosganda ochiladigan URL
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Bildirishnomani yopish

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.openWindow(urlToOpen) // Yangi tabda URLni ochish
  );
});

self.addEventListener('install', function(event) {
  console.log('Service Worker o\'rnatildi.');
  self.skipWaiting(); // Yangi service worker'ni darhol faollashtirish
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker faollashdi.');
  event.waitUntil(clients.claim()); // Barcha ochiq mijozlarni boshqarish
});