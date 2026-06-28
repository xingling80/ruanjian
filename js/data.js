import { supabase, getSoftware, getSoftwareById as sbGetSoftwareById, getCategories, searchSoftware as sbSearchSoftware, createSoftware, updateSoftware, deleteSoftware, getDownloadLogs, getStats } from './supabase-client.js';
import { getCache, setCache } from './cache.js';

const softwareData = [
    {
        id: 1,
        name: "VS Code",
        icon: "code",
        version: "v1.90.0",
        category: "编程开发工具",
        category_id: "devtools",
        license: "MIT 开源",
        description: "微软推出的轻量级代码编辑器，支持丰富的插件生态系统，是最流行的开发工具之一。",
        features: ["开源免费", "智能补全", "插件生态"],
        officialUrl: "https://code.visualstudio.com/",
        downloadLinks: {
            windows: {
                url: "https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user",
                label: "Windows x64 安装包",
                size: "95 MB"
            },
            macos: {
                url: "https://code.visualstudio.com/sha/download?build=stable&os=darwin-universal",
                label: "macOS Universal",
                size: "120 MB"
            },
            linux: {
                url: "https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64",
                label: "Linux .deb (x64)",
                size: "90 MB"
            }
        },
        releaseDate: "2024-06-10",
        downloads_count: 15234
    },
    {
        id: 2,
        name: "IntelliJ IDEA",
        icon: "integration_instructions",
        version: "v2024.1",
        category: "编程开发工具",
        category_id: "devtools",
        license: "社区版免费 / 旗舰版付费",
        description: "JetBrains 出品的智能 Java IDE，提供深度代码分析、智能重构和强大的调试功能。",
        features: ["智能代码分析", "多语言支持", "强大调试"],
        officialUrl: "https://www.jetbrains.com/idea/",
        downloadLinks: {
            windows: {
                url: "https://www.jetbrains.com/idea/download/download-thanks.html?platform=windows&code=IIC",
                label: "Windows x64 安装包",
                size: "780 MB"
            },
            macos: {
                url: "https://www.jetbrains.com/idea/download/download-thanks.html?platform=macM1&code=IIC",
                label: "macOS (Apple Silicon)",
                size: "820 MB"
            },
            linux: {
                url: "https://www.jetbrains.com/idea/download/download-thanks.html?platform=linux&code=IIC",
                label: "Linux tar.gz",
                size: "750 MB"
            }
        },
        releaseDate: "2024-05-20",
        downloads_count: 8921
    },
    {
        id: 3,
        name: "Git",
        icon: "hub",
        version: "v2.45.0",
        category: "编程开发工具",
        category_id: "devtools",
        license: "GPL v2 开源",
        description: "分布式版本控制系统，用于跟踪代码变更和团队协作开发。",
        features: ["分布式", "开源免费", "行业标准"],
        officialUrl: "https://git-scm.com/",
        downloadLinks: {
            windows: {
                url: "https://git-scm.com/download/win",
                label: "Windows 安装包",
                size: "55 MB"
            },
            macos: {
                url: "https://git-scm.com/download/mac",
                label: "macOS (Homebrew/安装包)",
                size: "45 MB"
            },
            linux: {
                url: "https://git-scm.com/download/linux",
                label: "Linux (各发行版)",
                size: "30 MB"
            }
        },
        releaseDate: "2024-04-15",
        downloads_count: 21567
    },
    {
        id: 4,
        name: "Node.js",
        icon: "javascript",
        version: "v20.14.0 LTS",
        category: "编程开发工具",
        category_id: "devtools",
        license: "MIT 开源",
        description: "基于 Chrome V8 引擎的 JavaScript 运行时，用于构建高性能网络应用。",
        features: ["事件驱动", "非阻塞I/O", "npm生态"],
        officialUrl: "https://nodejs.org/",
        downloadLinks: {
            windows: {
                url: "https://nodejs.org/dist/v20.14.0/node-v20.14.0-x64.msi",
                label: "Windows x64 MSI",
                size: "35 MB"
            },
            macos: {
                url: "https://nodejs.org/dist/v20.14.0/node-v20.14.0.pkg",
                label: "macOS 安装包",
                size: "40 MB"
            },
            linux: {
                url: "https://nodejs.org/dist/v20.14.0/node-v20.14.0-linux-x64.tar.xz",
                label: "Linux x64 二进制",
                size: "25 MB"
            },
            android: {
                url: "https://play.google.com/store/apps/details?id=com.termux",
                label: "Termux (Android终端)",
                size: "—"
            }
        },
        releaseDate: "2024-05-28",
        downloads_count: 18765
    },
    {
        id: 5,
        name: "Docker Desktop",
        icon: "deployed_code",
        version: "v4.31.0",
        category: "编程开发工具",
        category_id: "devtools",
        license: "个人免费 / 商业付费",
        description: "容器化应用开发和部署平台，简化开发环境配置和应用分发。",
        features: ["容器化", "Kubernetes集成", "跨平台"],
        officialUrl: "https://www.docker.com/products/docker-desktop/",
        downloadLinks: {
            windows: {
                url: "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe",
                label: "Windows x64 安装包",
                size: "550 MB"
            },
            macos: {
                url: "https://desktop.docker.com/mac/main/arm64/Docker.dmg",
                label: "macOS (Apple Silicon)",
                size: "520 MB"
            },
            linux: {
                url: "https://docs.docker.com/desktop/install/linux-install/",
                label: "Linux DEB/RPM",
                size: "—"
            }
        },
        releaseDate: "2024-06-05",
        downloads_count: 12345
    },
    {
        id: 6,
        name: "Postman",
        icon: "send",
        version: "v11.1.0",
        category: "编程开发工具",
        category_id: "devtools",
        license: "免费版 / 专业版付费",
        description: "API 开发和测试工具，支持 REST、GraphQL、SOAP 等多种 API 协议。",
        features: ["API测试", "自动化", "团队协作"],
        officialUrl: "https://www.postman.com/",
        downloadLinks: {
            windows: {
                url: "https://www.postman.com/downloads/",
                label: "Windows x64 安装包",
                size: "200 MB"
            },
            macos: {
                url: "https://www.postman.com/downloads/",
                label: "macOS 安装包",
                size: "220 MB"
            },
            linux: {
                url: "https://www.postman.com/downloads/",
                label: "Linux tar.gz",
                size: "195 MB"
            }
        },
        releaseDate: "2024-05-18",
        downloads_count: 9876
    },
    {
        id: 7,
        name: "Python",
        icon: "data_object",
        version: "v3.12.4",
        category: "编程开发工具",
        category_id: "devtools",
        license: "PSF 开源",
        description: "简洁优雅的编程语言，广泛应用于 Web 开发、数据分析、人工智能等领域。",
        features: ["语法简洁", "生态丰富", "跨平台"],
        officialUrl: "https://www.python.org/",
        downloadLinks: {
            windows: {
                url: "https://www.python.org/ftp/python/3.12.4/python-3.12.4-amd64.exe",
                label: "Windows x64 安装包",
                size: "28 MB"
            },
            macos: {
                url: "https://www.python.org/ftp/python/3.12.4/python-3.12.4-macos11.pkg",
                label: "macOS 安装包",
                size: "35 MB"
            },
            linux: {
                url: "https://www.python.org/downloads/source/",
                label: "Linux 源码包",
                size: "25 MB"
            },
            android: {
                url: "https://play.google.com/store/apps/details?id=org.qpython.qpy3",
                label: "QPython (Android)",
                size: "—"
            }
        },
        releaseDate: "2024-06-06",
        downloads_count: 25678
    },
    {
        id: 8,
        name: "MySQL Workbench",
        icon: "schema",
        version: "v8.0.37",
        category: "编程开发工具",
        category_id: "devtools",
        license: "GPL 开源",
        description: "MySQL 官方数据库设计和管理工具，支持可视化建模、SQL 开发和服务器管理。",
        features: ["可视化建模", "SQL开发", "性能监控"],
        officialUrl: "https://www.mysql.com/products/workbench/",
        downloadLinks: {
            windows: {
                url: "https://dev.mysql.com/downloads/workbench/",
                label: "Windows x64 安装包",
                size: "150 MB"
            },
            macos: {
                url: "https://dev.mysql.com/downloads/workbench/",
                label: "macOS DMG",
                size: "160 MB"
            },
            linux: {
                url: "https://dev.mysql.com/downloads/workbench/",
                label: "Linux DEB/RPM",
                size: "145 MB"
            }
        },
        releaseDate: "2024-04-30",
        downloads_count: 7654
    },
    {
        id: 9,
        name: "ChatGPT",
        icon: "smart_toy",
        version: "v2024.06",
        category: "人工智能工具",
        category_id: "ai",
        license: "免费版 / Plus付费",
        description: "OpenAI 开发的强大 AI 对话助手，支持文本生成、代码编写、问题解答等。",
        features: ["对话AI", "代码生成", "多模态"],
        officialUrl: "https://chat.openai.com/",
        downloadLinks: {
            windows: {
                url: "https://chat.openai.com/download",
                label: "Windows 桌面版",
                size: "180 MB"
            },
            macos: {
                url: "https://chat.openai.com/download",
                label: "macOS 桌面版",
                size: "200 MB"
            },
            android: {
                url: "https://play.google.com/store/apps/details?id=com.openai.chatgpt",
                label: "Android 版 (Google Play)",
                size: "—"
            },
            linux: {
                url: "https://chat.openai.com/",
                label: "Linux (网页版)",
                size: "—"
            }
        },
        releaseDate: "2024-06-15",
        downloads_count: 35678
    },
    {
        id: 10,
        name: "Claude",
        icon: "psychology",
        version: "v2024.06",
        category: "人工智能工具",
        category_id: "ai",
        license: "免费版 / Pro付费",
        description: "Anthropic 开发的 AI 助手，擅长长文本处理、分析推理和代码生成。",
        features: ["长上下文", "强推理", "安全对齐"],
        officialUrl: "https://claude.ai/",
        downloadLinks: {
            windows: {
                url: "https://claude.ai/download",
                label: "Windows 桌面版",
                size: "160 MB"
            },
            macos: {
                url: "https://claude.ai/download",
                label: "macOS 桌面版",
                size: "180 MB"
            },
            android: {
                url: "https://play.google.com/store/apps/details?id=com.anthropic.claude",
                label: "Android 版 (Google Play)",
                size: "—"
            },
            linux: {
                url: "https://claude.ai/",
                label: "Linux (网页版)",
                size: "—"
            }
        },
        releaseDate: "2024-06-12",
        downloads_count: 28934
    },
    {
        id: 11,
        name: "Stable Diffusion WebUI",
        icon: "image",
        version: "v1.9.3",
        category: "人工智能工具",
        category_id: "ai",
        license: "AGPL 开源",
        description: "基于 Stable Diffusion 的 AI 图像生成工具，支持文生图、图生图、ControlNet 等功能。",
        features: ["AI绘图", "开源免费", "高度自定义"],
        officialUrl: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
        downloadLinks: {
            windows: {
                url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui/releases",
                label: "Windows 一键包",
                size: "8.5 GB"
            },
            macos: {
                url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
                label: "macOS (源码安装)",
                size: "—"
            },
            linux: {
                url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
                label: "Linux (源码安装)",
                size: "—"
            }
        },
        releaseDate: "2024-05-25",
        downloads_count: 15678
    },
    {
        id: 12,
        name: "Ollama",
        icon: "model_training",
        version: "v0.1.48",
        category: "人工智能工具",
        category_id: "ai",
        license: "MIT 开源",
        description: "本地运行大语言模型的工具，支持 Llama、Mistral、Gemma 等多种开源模型。",
        features: ["本地运行", "多模型支持", "CLI工具"],
        officialUrl: "https://ollama.com/",
        downloadLinks: {
            windows: {
                url: "https://ollama.com/download/OllamaSetup.exe",
                label: "Windows 安装包",
                size: "250 MB"
            },
            macos: {
                url: "https://ollama.com/download/Ollama-darwin.zip",
                label: "macOS 安装包",
                size: "280 MB"
            },
            linux: {
                url: "https://ollama.com/download/ollama-linux-amd64.tgz",
                label: "Linux 二进制",
                size: "230 MB"
            }
        },
        releaseDate: "2024-06-18",
        downloads_count: 12345
    },
    {
        id: 13,
        name: "Cursor",
        icon: "mode_edit",
        version: "v0.40.0",
        category: "人工智能工具",
        category_id: "ai",
        license: "免费版 / Pro付费",
        description: "AI 驱动的代码编辑器，基于 VS Code 构建，内置智能代码补全和对话功能。",
        features: ["AI编程", "代码补全", "代码对话"],
        officialUrl: "https://cursor.sh/",
        downloadLinks: {
            windows: {
                url: "https://cursor.sh/download/windows",
                label: "Windows 安装包",
                size: "120 MB"
            },
            macos: {
                url: "https://cursor.sh/download/mac",
                label: "macOS 安装包",
                size: "145 MB"
            },
            linux: {
                url: "https://cursor.sh/download/linux",
                label: "Linux .AppImage",
                size: "115 MB"
            }
        },
        releaseDate: "2024-06-20",
        downloads_count: 18902
    },
    {
        id: 14,
        name: "Hugging Face Hub",
        icon: "hub",
        version: "v2024.06",
        category: "人工智能工具",
        category_id: "ai",
        license: "Apache 2.0 开源",
        description: "AI 模型和数据集平台，提供数千个预训练模型和数据集的托管服务。",
        features: ["模型仓库", "数据集", "开源社区"],
        officialUrl: "https://huggingface.co/",
        downloadLinks: {
            windows: {
                url: "https://huggingface.co/docs/huggingface_hub/installation",
                label: "Python 包 (pip)",
                size: "—"
            },
            macos: {
                url: "https://huggingface.co/docs/huggingface_hub/installation",
                label: "Python 包 (pip)",
                size: "—"
            },
            linux: {
                url: "https://huggingface.co/docs/huggingface_hub/installation",
                label: "Python 包 (pip)",
                size: "—"
            }
        },
        releaseDate: "2024-06-01",
        downloads_count: 8765
    },
    {
        id: 15,
        name: "LangChain",
        icon: "link",
        version: "v0.2.5",
        category: "人工智能工具",
        category_id: "ai",
        license: "MIT 开源",
        description: "构建 LLM 应用的开发框架，支持链式调用、RAG、Agent 等高级功能。",
        features: ["LLM开发", "RAG检索", "智能Agent"],
        officialUrl: "https://www.langchain.com/",
        downloadLinks: {
            windows: {
                url: "https://python.langchain.com/docs/get_started/installation",
                label: "Python 包 (pip install langchain)",
                size: "—"
            },
            macos: {
                url: "https://python.langchain.com/docs/get_started/installation",
                label: "Python 包 (pip install langchain)",
                size: "—"
            },
            linux: {
                url: "https://python.langchain.com/docs/get_started/installation",
                label: "Python 包 (pip install langchain)",
                size: "—"
            }
        },
        releaseDate: "2024-06-22",
        downloads_count: 11234
    },
    {
        id: 16,
        name: "TensorFlow",
        icon: "tune",
        version: "v2.16.1",
        category: "人工智能工具",
        category_id: "ai",
        license: "Apache 2.0 开源",
        description: "Google 开发的端到端机器学习平台，支持深度学习模型的构建、训练和部署。",
        features: ["深度学习", "生产部署", "TPU支持"],
        officialUrl: "https://www.tensorflow.org/",
        downloadLinks: {
            windows: {
                url: "https://www.tensorflow.org/install/pip",
                label: "pip 安装",
                size: "—"
            },
            macos: {
                url: "https://developer.apple.com/metal/tensorflow-plugin/",
                label: "macOS (Metal插件)",
                size: "—"
            },
            linux: {
                url: "https://www.tensorflow.org/install/pip",
                label: "pip 安装 (GPU支持)",
                size: "—"
            }
        },
        releaseDate: "2024-05-10",
        downloads_count: 14567
    }
];

const defaultCategories = [
    { id: 'all', name: '全部软件', icon: 'apps' },
    { id: 'devtools', name: '编程开发工具', icon: 'code' },
    { id: 'ai', name: '人工智能工具', icon: 'psychology' }
];

const osList = [
    { id: 'all', name: '全部平台', icon: 'devices' },
    { id: 'windows', name: 'Windows', icon: 'desktop_windows' },
    { id: 'macos', name: 'macOS', icon: 'laptop_mac' },
    { id: 'linux', name: 'Linux', icon: 'terminal' },
    { id: 'android', name: 'Android', icon: 'smartphone' }
];

let categories = [...defaultCategories];

function parseJsonField(val) {
    if (!val) return null;
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
    }
    return val;
}

async function loadCategoriesFromDB() {
    // 优先读缓存 → 二次访问秒开
    const cached = getCache('categories');
    if (cached) {
        categories = cached;
        return;
    }
    try {
        const { data, error } = await getCategories();
        if (data && data.length > 0) {
            categories = [{ id: 'all', name: '全部软件', icon: 'apps' }, ...data];
            setCache('categories', categories);
        }
    } catch (e) {
        console.log('Failed to load categories from DB, using default');
    }
}

async function loadSoftwareFromDB() {
    // 优先读缓存 → 二次访问秒开
    const cached = getCache('software');
    if (cached) return cached;

    try {
        const { data, error } = await getSoftware();
        if (data && data.length > 0) {
            const transformed = data.map(s => transformSoftware(s));
            setCache('software', transformed);
            return transformed;
        }
    } catch (e) {
        console.log('Failed to load software from DB, using default');
    }
    return softwareData;
}

function transformSoftware(s) {
    const downloadLinks = parseJsonField(s.download_links) || {};
    
    return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        version: s.version,
        category: s.categories?.name || s.category,
        category_id: s.category_id,
        license: s.license,
        description: s.description,
        features: s.features || [],
        officialUrl: s.official_url || s.officialUrl,
        downloadLinks: downloadLinks,
        releaseDate: s.release_date || s.releaseDate,
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
    
    const catId = categories.find(c => c.id === category || c.name === category)?.id;
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
    
    const effectiveCatId = catId || category;
    return softwareData.filter(s => 
        s.category_id === effectiveCatId || 
        s.category === effectiveCatId || 
        s.category === category
    );
}

async function getSoftwareByOS(os) {
    const allSoftware = await loadSoftwareFromDB();
    if (os === 'all') return allSoftware;
    return allSoftware.filter(s => s.downloadLinks && s.downloadLinks[os]);
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

function getSoftwareOSList(software) {
    const links = software.downloadLinks || {};
    const osMap = {
        windows: { name: 'Windows', icon: 'desktop_windows' },
        macos: { name: 'macOS', icon: 'laptop_mac' },
        linux: { name: 'Linux', icon: 'terminal' },
        android: { name: 'Android', icon: 'smartphone' }
    };
    return Object.keys(links).map(os => ({
        id: os,
        ...osMap[os],
        ...links[os]
    })).filter(os => os.name);
}

function formatFileSize(size) {
    if (!size || size === '—') return '—';
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
    osList,
    loadCategoriesFromDB,
    loadSoftwareFromDB,
    getSoftwareById,
    getSoftwareByCategory,
    getSoftwareByOS,
    searchSoftware,
    getSoftwareOSList,
    createSoftware,
    updateSoftware,
    deleteSoftware,
    getDownloadLogs,
    getStats,
    formatFileSize,
    formatDate
};
