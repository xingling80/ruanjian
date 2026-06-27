import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

export async function getStats() {
    const softwareCount = await supabase.from('software').select('id', { count: 'exact', head: true });
    const totalDownloads = await supabase.from('software').select('downloads_count', { count: 'sum', head: true });
    
    return {
        softwareCount: softwareCount.count || 0,
        totalDownloads: totalDownloads.count || 0
    };
}
