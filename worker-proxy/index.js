const REAL_SUPABASE_URL = 'https://bszmxgjhxikfpisxgaml.supabase.co';
const CACHE_TTL = 300;

function handleCors() {
    return new Response('OK', {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
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

        if (!path.startsWith('/rest/v1/') && !path.startsWith('/auth/v1/')) {
            return new Response('Not Found', { status: 404 });
        }

        const targetUrl = REAL_SUPABASE_URL + path + url.search;

        const headers = new Headers(request.headers);
        headers.set('Host', new URL(REAL_SUPABASE_URL).host);
        headers.delete('origin');
        headers.delete('referer');

        const cacheKey = request.url;
        const cache = caches.default;

        if (method === 'GET') {
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse) {
                const h = new Headers(cachedResponse.headers);
                h.set('X-Cache', 'HIT');
                return new Response(cachedResponse.body, { headers: h });
            }
        }

        try {
            const response = await fetch(targetUrl, {
                method,
                headers,
                body: method === 'GET' || method === 'HEAD' ? null : await request.text(),
            });

            if (method === 'GET' && response.ok) {
                const cloned = response.clone();
                ctx.waitUntil(cache.put(cacheKey, new Response(cloned.body, {
                    headers: {
                        ...cloned.headers,
                        'Cache-Control': `public, max-age=${CACHE_TTL}`,
                        'X-Cache': 'MISS',
                    },
                })));
            }

            const newHeaders = new Headers(response.headers);
            newHeaders.set('Access-Control-Allow-Origin', '*');
            newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

            return new Response(response.body, {
                status: response.status,
                headers: newHeaders,
            });
        } catch (err) {
            if (method === 'GET') {
                const cachedResponse = await cache.match(cacheKey);
                if (cachedResponse) {
                    const h = new Headers(cachedResponse.headers);
                    h.set('X-Cache', 'STALE');
                    return new Response(cachedResponse.body, { headers: h });
                }
            }
            return new Response(JSON.stringify({ error: { message: '数据库连接暂时不可用，请稍后重试' } }), {
                status: 503,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }
    },
};
