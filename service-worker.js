const CACHE_NAME = "grocerymate-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./onboarding.html",
    "./home.html",
    "./grocery-list.html",
    "./add-item.html",
    "./budget-summary.html",
    "./set-budget.html",
    "./item-details.html",
    "./history.html",
    "./settings.html",
    "./style.css",
    "./script.js"
];

/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function (cache) {

                return cache.addAll(APP_FILES);

            })

    );

    /* Activate the new version immediately */
    self.skipWaiting();

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys()
            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        if (cacheName !== CACHE_NAME) {

                            return caches.delete(cacheName);

                        }

                    })

                );

            })

    );

    /* Take control of open pages */
    self.clients.claim();

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", function (event) {

    /*
       For HTML pages:
       Network first → latest version
       Cache fallback → offline
    */

    if (
        event.request.mode === "navigate" ||
        event.request.destination === "document"
    ) {

        event.respondWith(

            fetch(event.request)
                .then(function (response) {

                    /*
                       Save the newest HTML
                    */

                    const responseClone =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then(function (cache) {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                    return response;

                })
                .catch(function () {

                    return caches.match(
                        event.request
                    );

                })

        );

        return;

    }


    /*
       CSS / JS / images / other files:
       Cache first → network fallback
    */

    event.respondWith(

        caches.match(event.request)
            .then(function (cachedResponse) {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request)
                    .then(function (response) {

                        const responseClone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });

                        return response;

                    });

            })

    );

});