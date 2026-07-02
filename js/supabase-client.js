import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = localStorage.getItem('worker_url') || '';
const SUPABASE_ANON_KEY = localStorage.getItem('supabase_anon_key') || '';

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

function validateConfig() {
    if (!SUPABASE_URL || !isValidUrl(SUPABASE_URL)) {
        console.warn('Supabase URL not configured. Please configure it in the admin settings.');
    }
    if (!SUPABASE_ANON_KEY) {
        console.warn('Supabase ANON_KEY not configured. Please configure it in the admin settings.');
    }
}

validateConfig();

export const supabase = createClient(SUPABASE_URL || 'https://example.supabase.co', SUPABASE_ANON_KEY || 'your-anon-key');

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('id');
    return { data, error };
}

export async function getSoftware(limit = null, categoryId = null) {
    let query = supabase.from('software').select('*, categories(name)');
    
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
    const { data, error } = await supabase.from('software').select('*, categories(name)').eq('id', id).single();
    return { data, error };
}

export async function searchSoftware(query) {
    const { data, error } = await supabase.from('software').select('*, categories(name)')
        .ilike('name', `%${query}%`)
        .or(`description.ilike.%${query}%`)
        .order('downloads_count', { ascending: false });
    return { data, error };
}

export async function createSoftware(software) {
    const { data, error } = await supabase.from('software').insert([software]);
    return { data, error };
}

export async function updateSoftware(id, software) {
    const { data, error } = await supabase.from('software').update(software).eq('id', id);
    return { data, error };
}

export async function deleteSoftware(id) {
    const { data, error } = await supabase.from('software').delete().eq('id', id);
    return { data, error };
}

export async function createDownloadLog(log) {
    const { data, error } = await supabase.from('download_logs').insert([log]);
    return { data, error };
}

export async function getDownloadLogs(limit = 50) {
    const { data, error } = await supabase.from('download_logs').select('*, software(name)')
        .order('download_time', { ascending: false })
        .limit(limit);
    return { data, error };
}

export async function incrementDownloadCount(softwareId) {
    const { data, error } = await supabase.rpc('increment_download_count', { software_id: softwareId });
    return { data, error };
}

export async function submitContactMessage(message) {
    const { data, error } = await supabase.from('contact_messages').insert([{
        name: message.name,
        contact: message.contact,
        type: message.type,
        message: message.message
    }]);
    return { data, error };
}

export async function getStats() {
    const softwareCount = await supabase.from('software').select('id', { count: 'exact', head: true });
    const totalDownloads = await supabase.from('software').select('downloads_count');
    
    return {
        softwareCount: softwareCount.count || 0,
        totalDownloads: totalDownloads.data ? totalDownloads.data.reduce((sum, s) => sum + (s.downloads_count || 0), 0) : 0
    };
}

// ==================== 注册管理员（首次设置用） ====================
export async function signUpAdmin(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
}
