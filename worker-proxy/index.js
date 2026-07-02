const REAL_SUPABASE_URL = '<YOUR_SUPABASE_PROJECT_URL>';
const CACHE_TTL = 300;

function handleCors() {
    return new Response('OK', {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
        },
    });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method.toUpperCase();

        if (method === 'OPTIONS') {
            return handleCors();
        }

        if (!path.startsWith('/rest/v1/') && !path.startsWith('/auth/v1/') && !path.startsWith('/realtime/v1/') && !path.startsWith('/storage/v1/') && !path.startsWith('/functions/v1/') && path !== '/health') {
            return new Response('Not Found', { status: 404 });
        }

        const targetUrl = REAL_SUPABASE_URL + path + url.search;

        const headers = new Headers(request.headers);
        headers.set('Host', new URL(REAL_SUPABASE_URL).host);
        headers.set('origin', REAL_SUPABASE_URL);
        headers.set('referer', REAL_SUPABASE_URL);

        const cacheKey = request.url;
        const cache = caches.default;

        if (method === 'GET') {
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse) {
                const h = new Headers(cachedResponse.headers);
                h.set('X-Cache', 'HIT');
                h.set('Access-Control-Allow-Origin', '*');
                return new Response(cachedResponse.body, { headers: h });
            }
        }

        try {
            const requestBody = method === 'GET' || method === 'HEAD' ? null : await request.arrayBuffer();
            const response = await fetch(targetUrl, {
                method,
                headers,
                body: requestBody,
            });

            if (method === 'GET' && response.ok) {
                const cloned = response.clone();
                const cacheHeaders = new Headers(cloned.headers);
                cacheHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
                cacheHeaders.set('X-Cache', 'MISS');
                ctx.waitUntil(cache.put(cacheKey, new Response(cloned.body, { headers: cacheHeaders })));
            }

            const newHeaders = new Headers(response.headers);
            newHeaders.set('Access-Control-Allow-Origin', '*');
            newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            newHeaders.set('Access-Control-Allow-Headers', '*');
            newHeaders.set('Access-Control-Allow-Credentials', 'true');

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
            });
        } catch (err) {
            console.error('Fetch error:', err);
            if (method === 'GET') {
                const cachedResponse = await cache.match(cacheKey);
                if (cachedResponse) {
                    const h = new Headers(cachedResponse.headers);
                    h.set('X-Cache', 'STALE');
                    h.set('Access-Control-Allow-Origin', '*');
                    return new Response(cachedResponse.body, { headers: h });
                }
            }
            return new Response(JSON.stringify({ error: { message: '数据库连接暂时不可用，请稍后重试', details: err.message } }), {
                status: 503,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }
    },
};
