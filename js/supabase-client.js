import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const WORKER_URL = 'https://still-meadow-9abe.dongzehua588.workers.dev';
const DIRECT_SUPABASE_URL = 'https://bszmxgjhxikfpisxgaml.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vVGZp3VO6OPFxKBUIaxJkA_FmC0rqeS';

let supabaseClient;

async function initSupabase() {
    let useWorker = true;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${WORKER_URL}/rest/v1/categories?apikey=${SUPABASE_ANON_KEY}`, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) {
            useWorker = false;
        }
    } catch (e) {
        useWorker = false;
    }
    
    const url = useWorker ? WORKER_URL : DIRECT_SUPABASE_URL;
    if (!useWorker) {
        console.log('Worker proxy unavailable, using direct Supabase connection');
    }
    
    supabaseClient = createClient(url, SUPABASE_ANON_KEY);
}

initSupabase();

export async function getSupabase() {
    if (!supabaseClient) {
        await initSupabase();
    }
    return supabaseClient;
}

export async function getCurrentUser() {
    const client = await getSupabase();
    const { data: { user } } = await client.auth.getUser();
    return user;
}

export async function isAuthenticated() {
    const client = await getSupabase();
    const { data: { session } } = await client.auth.getSession();
    return !!session;
}

export async function login(email, password) {
    const client = await getSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    return { data, error };
}

export async function logout() {
    const client = await getSupabase();
    const { error } = await client.auth.signOut();
    return { error };
}

export async function getCategories() {
    const client = await getSupabase();
    const { data, error } = await client.from('categories').select('*').order('id');
    return { data, error };
}

export async function getSoftware(limit = null, categoryId = null) {
    const client = await getSupabase();
    let query = client.from('software').select('*, categories(name)');
    
    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }
    
    if (limit) {
        query = query.limit(limit);
    }
    
    const { data, error } = await query.order('downloads_count', { ascending: false });
    return { data, error };
}

export async function getSoftwareById(id) {
    const client = await getSupabase();
    const { data, error } = await client.from('software').select('*, categories(name)').eq('id', id).single();
    return { data, error };
}

export async function searchSoftware(query) {
    const client = await getSupabase();
    const { data, error } = await client.from('software').select('*, categories(name)')
        .ilike('name', `%${query}%`)
        .or(`description.ilike.%${query}%`)
        .order('downloads_count', { ascending: false });
    return { data, error };
}

export async function createSoftware(software) {
    const client = await getSupabase();
    const { data, error } = await client.from('software').insert([software]);
    return { data, error };
}

export async function updateSoftware(id, software) {
    const client = await getSupabase();
    const { data, error } = await client.from('software').update(software).eq('id', id);
    return { data, error };
}

export async function deleteSoftware(id) {
    const client = await getSupabase();
    const { data, error } = await client.from('software').delete().eq('id', id);
    return { data, error };
}

export async function createDownloadLog(log) {
    const client = await getSupabase();
    const { data, error } = await client.from('download_logs').insert([log]);
    return { data, error };
}

export async function getDownloadLogs(limit = 50) {
    const client = await getSupabase();
    const { data, error } = await client.from('download_logs').select('*, software(name)')
        .order('download_time', { ascending: false })
        .limit(limit);
    return { data, error };
}

export async function incrementDownloadCount(softwareId) {
    const client = await getSupabase();
    const { data, error } = await client.rpc('increment_download_count', { software_id: softwareId });
    return { data, error };
}

export async function submitContactMessage(message) {
    const client = await getSupabase();
    const { data, error } = await client.from('contact_messages').insert([{
        name: message.name,
        contact: message.contact,
        type: message.type,
        message: message.message
    }]);
    return { data, error };
}

export async function getStats() {
    const client = await getSupabase();
    const softwareCount = await client.from('software').select('id', { count: 'exact', head: true });
    const totalDownloads = await client.from('software').select('downloads_count');
    
    return {
        softwareCount: softwareCount.count || 0,
        totalDownloads: totalDownloads.data ? totalDownloads.data.reduce((sum, s) => sum + (s.downloads_count || 0), 0) : 0
    };
}

export async function signUpAdmin(email, password) {
    const client = await getSupabase();
    const { data, error } = await client.auth.signUp({ email, password });
    return { data, error };
}
