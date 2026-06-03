/**
 * =====================================================
 * SERVICE WORKER FOR HR-11 FRONTEND CACHING
 * =====================================================
 */

const CACHE_NAME = 'hr-11-v1.0.0';
const STATIC_CACHE = 'hr-11-static-v1.0.0';
const DYNAMIC_CACHE = 'hr-11-dynamic-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
    '/',
    '/assets/css/app.min.css',
    '/assets/js/vendor.min.js',
    '/assets/js/app.min.js',
    '/assets/fonts/boxicons.woff2',
    '/assets/fonts/tabler-icons.woff2',
    '/assets/images/logo-light.png',
    '/assets/images/logo-dark.png',
    '/favicon.ico'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /^\/api\/menu/,
    /^\/api\/permissions/,
    /^\/api\/user\/profile/
];

// Cache strategies
const CACHE_STRATEGIES = {
    static: 'cache-first',
    api: 'network-first',
    images: 'cache-first',
    fonts: 'cache-first'
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', event => {
    console.log('Service Worker: Install event');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Cache install failed', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate event');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Determine cache strategy based on request type
    const strategy = getCacheStrategy(request);
    
    event.respondWith(
        handleRequest(request, strategy)
    );
});

/**
 * Get cache strategy for request
 */
function getCacheStrategy(request) {
    const url = new URL(request.url);
    
    // Static assets
    if (url.pathname.startsWith('/assets/') || 
        url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.woff') ||
        url.pathname.endsWith('.ttf')) {
        return CACHE_STRATEGIES.static;
    }
    
    // Images
    if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        return CACHE_STRATEGIES.images;
    }
    
    // API requests
    if (url.pathname.startsWith('/api/')) {
        return CACHE_STRATEGIES.api;
    }
    
    // Default strategy
    return CACHE_STRATEGIES.static;
}

/**
 * Handle request based on strategy
 */
async function handleRequest(request, strategy) {
    const url = new URL(request.url);
    
    try {
        switch (strategy) {
            case CACHE_STRATEGIES.static:
                return await cacheFirst(request);
            case CACHE_STRATEGIES.api:
                return await networkFirst(request);
            case CACHE_STRATEGIES.images:
                return await cacheFirst(request);
            default:
                return await networkFirst(request);
        }
    } catch (error) {
        console.error('Service Worker: Request failed', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await getOfflinePage();
        }
        
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Get offline page
 */
async function getOfflinePage() {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
        return offlinePage;
    }
    
    // Create a simple offline page
    const offlineResponse = new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Offline - HR System</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 2rem;
                    background: #f5f5f5;
                    text-align: center;
                }
                .offline-container {
                    max-width: 500px;
                    margin: 2rem auto;
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .offline-icon {
                    font-size: 4rem;
                    color: #6c757d;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #343a40;
                    margin-bottom: 1rem;
                }
                p {
                    color: #6c757d;
                    line-height: 1.6;
                }
                .retry-btn {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 1rem;
                }
                .retry-btn:hover {
                    background: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📱</div>
                <h1>Bạn đang offline</h1>
                <p>Không có kết nối internet. Vui lòng kiểm tra kết nối mạng và thử lại.</p>
                <button class="retry-btn" onclick="window.location.reload()">
                    Thử lại
                </button>
            </div>
        </body>
        </html>
        `,
        {
            headers: {
                'Content-Type': 'text/html',
            },
        }
    );
    
    return offlineResponse;
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * Background sync implementation
 */
async function doBackgroundSync() {
    try {
        // Get pending requests from IndexedDB
        const pendingRequests = await getPendingRequests();
        
        for (const request of pendingRequests) {
            try {
                await fetch(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body
                });
                
                // Remove from pending requests
                await removePendingRequest(request.id);
                console.log('Service Worker: Synced request', request.id);
                
            } catch (error) {
                console.error('Service Worker: Sync failed', error);
            }
        }
    } catch (error) {
        console.error('Service Worker: Background sync error', error);
    }
}

/**
 * Push notification handling
 */
self.addEventListener('push', event => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'Bạn có thông báo mới',
        icon: '/assets/images/logo-light.png',
        badge: '/assets/images/logo-sm.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Xem chi tiết',
                icon: '/assets/images/icon-check.png'
            },
            {
                action: 'close',
                title: 'Đóng',
                icon: '/assets/images/icon-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('HR System', options)
    );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/dashboard')
        );
    }
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

/**
 * Helper functions for IndexedDB operations
 */
async function getPendingRequests() {
    // Implement IndexedDB logic to get pending requests
    return [];
}

async function removePendingRequest(id) {
    // Implement IndexedDB logic to remove pending request
    console.log('Service Worker: Removing pending request', id);
}

/**
 * Cache management utilities
 */
async function clearOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
    
    return Promise.all(
        cacheNames
            .filter(cacheName => !currentCaches.includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
    );
}

async function getCacheSize(cacheName) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    return keys.length;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CACHE_NAME,
        STATIC_CACHE,
        DYNAMIC_CACHE,
        getCacheStrategy,
        handleRequest
    };
}
