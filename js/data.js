import { supabase, getSoftware, getSoftwareById as sbGetSoftwareById, getCategories, searchSoftware as sbSearchSoftware } from './supabase-client.js';

const softwareData = [
    {
        id: 1,
        name: "Creative Suite Pro",
        icon: "design_services",
        version: "v24.5.1 LTS",
        platform: "Multi-Platform",
        size: "4.2 GB",
        category: "创意设计",
        license: "企业订阅",
        description: "数字创作者的终极工具包。体验硬件加速渲染、AI驱动的自动化工具。",
        features: ["认证发行商", "64位原生", "支持云端"],
        systemRequirements: {
            cpu: "Intel Core i7 or AMD Ryzen 7 (8+ cores)",
            gpu: "NVIDIA RTX 3060 (8GB+ VRAM)",
            ram: "32GB DDR4/DDR5 unified memory",
            storage: "50GB available NVMe SSD space"
        },
        releaseNotes: [
            { title: "引擎优化", detail: "Build 24.5.1 - Fixes render latency", icon: "build" },
            { title: "AI 模块更新", detail: "Build 24.5.0 - New generative fill", icon: "neurology" }
        ],
        downloads: [],
        download_urls: [],
        sha256: "a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01",
        uploadDate: "2024-06-15",
        downloads_count: 1256
    },
    {
        id: 2,
        name: "DevStudio Enterprise",
        icon: "code",
        version: "v2024.2",
        platform: "Windows / macOS / Linux",
        size: "1.8 GB",
        category: "开发工具",
        license: "商业许可",
        description: "专业级集成开发环境，支持100+编程语言，智能代码补全。",
        features: ["认证发行商", "64位原生", "跨平台支持"],
        systemRequirements: {
            cpu: "Intel Core i5 or AMD Ryzen 5 (4+ cores)",
            gpu: "Integrated graphics or better",
            ram: "16GB RAM minimum",
            storage: "20GB available space"
        },
        releaseNotes: [
            { title: "性能优化", detail: "Build 2024.2 - 启动速度提升30%", icon: "speed" },
            { title: "新语言支持", detail: "Build 2024.1 - Rust & Go 深度集成", icon: "language" }
        ],
        downloads: [],
        download_urls: [],
        sha256: "b2c3d4e5f6a7890123456789bcdef0123456789abcdef0123456789abcdef0123",
        uploadDate: "2024-05-20",
        downloads_count: 2890
    },
    {
        id: 3,
        name: "VideoStudio Ultimate",
        icon: "movie_edit",
        version: "v18.0",
        platform: "Windows / macOS",
        size: "3.5 GB",
        category: "视频剪辑",
        license: "永久授权",
        description: "专业视频编辑软件，支持8K视频编辑，AI智能剪辑。",
        features: ["认证发行商", "64位原生", "GPU加速"],
        systemRequirements: {
            cpu: "Intel Core i7 or AMD Ryzen 7 (8+ cores)",
            gpu: "NVIDIA RTX 3070 / AMD RX 6800 (8GB+ VRAM)",
            ram: "32GB RAM recommended",
            storage: "100GB available SSD space"
        },
        releaseNotes: [
            { title: "AI 剪辑增强", detail: "v18.0 - AI智能剪辑全面升级", icon: "auto_awesome" },
            { title: "格式支持", detail: "v17.5 - 新增 AV1 编解码", icon: "video_library" }
        ],
        downloads: [],
        download_urls: [],
        sha256: "c3d4e5f6a7b890123456789cdef0123456789abcdef0123456789abcdef012345",
        uploadDate: "2024-04-10",
        downloads_count: 987
    },
    {
        id: 4,
        name: "DataAnalytics Pro",
        icon: "analytics",
        version: "v12.3",
        platform: "Windows / macOS / Web",
        size: "2.1 GB",
        category: "数据分析",
        license: "订阅制",
        description: "强大的数据分析与可视化工具，支持海量数据处理。",
        features: ["认证发行商", "64位原生", "云同步"],
        systemRequirements: {
            cpu: "Intel Core i5 or AMD Ryzen 5",
            gpu: "Integrated graphics",
            ram: "16GB RAM",
            storage: "10GB available space"
        },
        releaseNotes: [
            { title: "大数据优化", detail: "v12.3 - 亿级数据处理性能提升50%", icon: "dataset" },
            { title: "新图表类型", detail: "v12.0 - 新增20+图表类型", icon: "show_chart" }
        ],
        downloads: [],
        download_urls: [],
        sha256: "d4e5f6a7b8c90123456789def0123456789abcdef0123456789abcdef01234567",
        uploadDate: "2024-06-01",
        downloads_count: 1543
    },
    {
        id: 5,
        name: "SecureVault Premium",
        icon: "security",
        version: "v8.2",
        platform: "Multi-Platform",
        size: "256 MB",
        category: "安全加密",
        license: "永久授权",
        description: "军事级数据加密软件，端到端加密保护您的敏感数据。",
        features: ["认证发行商", "64位原生", "军事级加密"],
        systemRequirements: {
            cpu: "Any modern processor",
            gpu: "Not required",
            ram: "4GB RAM minimum",
            storage: "500MB available space"
        },
        releaseNotes: [
            { title: "安全更新", detail: "v8.2 - 修复潜在安全漏洞", icon: "shield" },
            { title: "新功能", detail: "v8.0 - 支持硬件安全密钥", icon: "vpn_key" }
        ],
        downloads: [],
        download_urls: [],
        sha256: "e5f6a7b8c9d0123456789ef0123456789abcdef0123456789abcdef0123456789",
        uploadDate: "2024-05-28",
        downloads_count: 3421
    },
    {
        id: 6,
        name: "CloudSync Business",
        icon: "cloud_sync",
        version: "v5.1",
        platform: "Windows / macOS / Linux / Mobile",
        size: "128 MB",
        category: "云存储",
        license: "企业订阅",
        description: "企业级云存储同步工具，智能增量同步，完整审计日志。",
        features: ["认证发行商", "跨平台", "企业级"],
        systemRequirements: {
            cpu: "Any modern processor",
            gpu: "Not required",
            ram: "2GB RAM minimum",
            storage: "200MB available space"
        },
        releaseNotes: [
            { title: "同步优化", detail: "v5.1 - 增量同步速度提升80%", icon: "sync" },
            { title: "团队功能", detail: "v5.0 - 新增团队协作空间", icon: "group" }
        ],
        downloads: [],
        download_urls: [],
        sha256: "f6a7b8c9d0e123456789f0123456789abcdef0123456789abcdef0123456789a",
        uploadDate: "2024-06-10",
        downloads_count: 2156
    }
];

const defaultCategories = [
    { id: 'all', name: '全部软件', icon: 'apps' },
    { id: '创意设计', name: '创意设计', icon: 'design_services' },
    { id: '开发工具', name: '开发工具', icon: 'code' },
    { id: '视频剪辑', name: '视频剪辑', icon: 'movie_edit' },
    { id: '数据分析', name: '数据分析', icon: 'analytics' },
    { id: '安全加密', name: '安全加密', icon: 'security' },
    { id: '云存储', name: '云存储', icon: 'cloud' }
];

let categories = [...defaultCategories];

// ==================== JSON 工具函数 ====================

function parseJsonField(val) {
    if (!val) return null;
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
    }
    return val;
}

// ==================== 数据加载函数 ====================

async function loadCategoriesFromDB() {
    try {
        const { data, error } = await getCategories();
        if (data && data.length > 0) {
            categories = [{ id: 'all', name: '全部软件', icon: 'apps' }, ...data];
        }
    } catch (e) {
        console.log('Failed to load categories from DB, using default');
    }
}

async function loadSoftwareFromDB() {
    try {
        const { data, error } = await getSoftware();
        if (data && data.length > 0) {
            return data.map(s => transformSoftware(s));
        }
    } catch (e) {
        console.log('Failed to load software from DB, using default');
    }
    return softwareData;
}

function transformSoftware(s) {
    // download_urls 优先，回退到 downloads 兼容旧数据
    const downloadUrls = parseJsonField(s.download_urls) || [];
    const downloads = parseJsonField(s.downloads) || [];
    const mergedDownloads = downloadUrls.length > 0 
        ? downloadUrls.map(d => ({
            name: d.name,
            size: d.size,
            type: d.type || (d.name ? d.name.split('.').pop() : 'unknown'),
            url: d.url,
            r2_key: d.r2_key
          }))
        : downloads;

    return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        version: s.version,
        platform: s.platform,
        size: s.size,
        category: s.categories?.name || s.category,
        category_id: s.category_id,
        license: s.license,
        description: s.description,
        features: s.features || [],
        systemRequirements: parseJsonField(s.system_requirements) || {},
        releaseNotes: parseJsonField(s.release_notes) || [],
        downloads: mergedDownloads,
        download_urls: downloadUrls,
        sha256: s.sha256,
        uploadDate: s.upload_date || s.uploadDate,
        downloads_count: s.downloads_count || 0,
        is_verified: s.is_verified
    };
}

async function getSoftwareById(id) {
    try {
        const { data, error } = await sbGetSoftwareById(id);
        if (data) {
            return transformSoftware(data);
        }
    } catch (e) {
        console.log('Failed to get software by ID from DB');
    }
    return softwareData.find(s => s.id === parseInt(id));
}

async function getSoftwareByCategory(category) {
    if (category === 'all') {
        return await loadSoftwareFromDB();
    }
    
    const catId = categories.find(c => c.name === category)?.id;
    if (catId && catId !== 'all') {
        try {
            const { data, error } = await getSoftware(null, catId);
            if (data) {
                return data.map(s => transformSoftware(s));
            }
        } catch (e) {
            console.log('Failed to get software by category from DB');
        }
    }
    
    return softwareData.filter(s => s.category === category);
}

async function searchSoftware(query) {
    try {
        const { data, error } = await sbSearchSoftware(query);
        if (data && data.length > 0) {
            return data.map(s => transformSoftware(s));
        }
    } catch (e) {
        console.log('Failed to search software from DB');
    }
    
    const q = query.toLowerCase();
    return softwareData.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
}

function formatFileSize(size) {
    if (!size) return '0 B';
    if (typeof size === 'number') {
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    return size;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export {
    softwareData,
    categories,
    defaultCategories,
    loadCategoriesFromDB,
    loadSoftwareFromDB,
    getSoftwareById,
    getSoftwareByCategory,
    searchSoftware,
    formatFileSize,
    formatDate
};
