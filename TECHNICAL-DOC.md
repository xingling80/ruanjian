# 安装中心 (Installer Hub) - 技术文档

## 1. 项目概述

安装中心是一个编程开发和人工智能工具的一站式下载平台，为用户提供按操作系统分类的官方软件下载链接。

**核心功能**：
- 软件浏览与搜索
- 按分类和操作系统筛选
- 软件详情展示与下载
- 管理后台（软件管理、上传、下载记录）
- 用户联系反馈

---

## 2. 技术栈

### 2.1 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| HTML5 | - | 页面结构 |
| CSS3 | - | 样式定义 |
| JavaScript (ES6+) | - | 交互逻辑 |
| Tailwind CSS | 3.x | 样式框架（CDN引入） |
| Material Symbols | - | 图标库 |
| Google Fonts | - | 字体（Inter, Geist） |

### 2.2 后端/服务技术

| 技术 | 用途 |
|------|------|
| Supabase | 数据库 + 用户认证 |
| Cloudflare Workers | API网关 + 文件上传代理 |
| Cloudflare R2 | 对象存储（安装包存储） |

### 2.3 部署平台

| 组件 | 部署位置 |
|------|----------|
| 前端静态资源 | Vercel |
| API代理 Worker | Cloudflare Workers |
| 文件存储 Worker | Cloudflare Workers |
| 数据库 | Supabase |
| 对象存储 | Cloudflare R2 |

---

## 3. 架构设计

### 3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端 (Browser)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────────┐     │
│  │  首页   │  │  浏览页  │  │ 详情页  │  │  管理后台    │     │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───────┬───────┘     │
└───────┼────────────┼────────────┼───────────────┼─────────────┘
        │            │            │               │
        ▼            ▼            ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel (前端托管)                         │
│  index.html | browse.html | detail.html | admin.html | login.html│
│  css/style.css | js/*.js                                        │
└───────┬────────────┬────────────┬───────┬───────────────────────┘
        │            │            │       │
        ▼            │            │       ▼
┌────────────────────┴────────────┴───────┴──────────────────────┐
│                   Cloudflare Workers                           │
│  ┌─────────────────────────────────┐  ┌─────────────────────┐  │
│  │  Proxy Worker (still-meadow-9abe)│  │ Files Worker        │  │
│  │  - Supabase API代理             │  │  - 预签名上传URL    │  │
│  │  - CORS处理                     │  │  - 文件删除/列表    │  │
│  │  - 响应缓存(5分钟TTL)           │  │  - Worker代理下载   │  │
│  │  - 故障回退(Stale Cache)        │  │                     │  │
│  └──────────────────┬──────────────┘  └──────────┬──────────┘  │
└─────────────────────┼─────────────────────────────┼─────────────┘
                      │                             │
                      ▼                             ▼
           ┌──────────────────┐         ┌──────────────────┐
           │   Supabase       │         │  Cloudflare R2   │
           │  - PostgreSQL    │         │  - 对象存储      │
           │  - Auth认证      │         │  - 安装包存储    │
           │  - Realtime      │         │  - 10GB免费额度  │
           └──────────────────┘         └──────────────────┘
```

### 3.2 核心数据流

**软件浏览流程**：
1. 用户访问页面 → Vercel 返回静态资源
2. 页面加载 → 请求 `loadSoftwareFromDB()`
3. 优先读取本地缓存 → 无缓存则请求 Supabase
4. Supabase 通过 Proxy Worker 返回数据
5. 渲染软件列表

**文件上传流程**（管理后台）：
1. 管理员选择文件 → 前端验证文件类型和大小
2. 请求 **文件存储 Worker** (`POST /admin/upload-url`) 获取预签名上传 URL
3. 使用预签名 URL 直接上传文件到 Cloudflare R2（不经过 Worker，降低带宽成本）
4. 将软件元数据（含下载 URL）通过 **API 代理 Worker** 保存到 Supabase

---

## 4. 项目结构

```
installer-hub/
├── css/
│   └── style.css                    # 自定义样式
├── js/
│   ├── data.js                      # 数据管理与缓存逻辑
│   ├── common.js                    # 通用工具函数
│   ├── supabase-client.js           # Supabase API封装
│   └── cache.js                     # 本地缓存管理
├── worker/                          # 文件存储 Worker
│   ├── index.js                     # Worker入口
│   └── wrangler.toml                # Cloudflare配置
├── worker-proxy/                    # API代理 Worker
│   ├── index.js                     # Worker入口
│   └── wrangler.toml                # Cloudflare配置
├── index.html                       # 首页
├── browse.html                      # 软件浏览页
├── detail.html                      # 软件详情页
├── about.html                       # 服务说明页
├── contact.html                     # 联系页
├── security.html                    # 安全说明页
├── pricing.html                     # 定价页
├── login.html                       # 登录页
├── admin.html                       # 管理后台
├── vercel.json                      # Vercel部署配置
├── supabase-init.sql                # 数据库初始化脚本
├── supabase-rpc.sql                 # RPC函数定义
└── .gitignore                       # Git忽略配置
```

---

## 5. 关键模块说明

### 5.1 数据层 (`js/data.js`)

负责软件数据的加载、缓存和转换：

- **缓存策略**：使用 `localStorage` 缓存软件列表和分类数据
- **数据转换**：将 Supabase 返回的数据转换为前端统一格式
- **数据源**：优先从 Supabase 读取，失败时使用内置默认数据

### 5.2 API层 (`js/supabase-client.js`)

封装 Supabase 客户端操作，通过 Cloudflare Worker 代理访问：

```javascript
// 连接配置
const SUPABASE_URL = '<YOUR_PROXY_WORKER_URL>';
const SUPABASE_ANON_KEY = '<YOUR_SUPABASE_ANON_KEY>';
```

> **安全警告**：`SUPABASE_ANON_KEY` 属于敏感信息，不应明文提交到版本控制，生产环境应通过环境变量管理。

- **认证**：`login()`, `logout()`, `isAuthenticated()`
- **CRUD**：软件的增删改查
- **日志**：下载记录管理
- **统计**：`getStats()` 获取软件总数和下载量

### 5.3 通用工具 (`js/common.js`)

提供全局工具函数：

- **粒子背景**：`initParticles()` Canvas动画
- **滚动动画**：`initScrollAnimations()` IntersectionObserver
- **导航**：`navigateTo()`, `goBack()`
- **Toast提示**：`showToast()`
- **日期格式化**：`formatDate()`

### 5.4 管理后台 (`admin.html`)

完整的后台管理界面：

| 页面 | 功能 |
|------|------|
| 数据概览 | 软件数、下载量统计 |
| 软件管理 | 列表展示、搜索、删除 |
| 上传安装包 | 文件拖拽上传到 R2 |
| 下载记录 | 查看下载日志 |
| 系统设置 | Worker URL、上传密钥配置 |

---

## 6. 数据库设计

### 6.1 表结构

**categories（分类表）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| name | TEXT | 分类名称 |
| icon | TEXT | Material图标名 |
| created_at | TIMESTAMPTZ | 创建时间 |

**software（软件表）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| name | TEXT | 软件名称 |
| icon | TEXT | 图标名 |
| version | TEXT | 版本号 |
| platform | TEXT | 支持平台 |
| size | TEXT | 文件大小 |
| category_id | BIGINT | 分类ID |
| license | TEXT | 许可类型 |
| description | TEXT | 描述 |
| downloads_count | INT | 下载次数 |
| upload_date | DATE | 上传日期 |
| is_verified | BOOLEAN | 是否验证 |
| system_requirements | JSONB | 系统要求 |
| release_notes | JSONB | 更新日志 |
| download_urls | JSONB | 下载链接列表 |
| features | TEXT[] | 功能标签 |

**download_logs（下载日志表）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| software_id | BIGINT | 软件ID |
| filename | TEXT | 文件名 |
| file_size | TEXT | 文件大小 |
| download_time | TIMESTAMPTZ | 下载时间 |

**contact_messages（留言表）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| name | TEXT | 称呼 |
| contact | TEXT | 联系方式 |
| type | TEXT | 咨询类型 |
| message | TEXT | 留言内容 |
| created_at | TIMESTAMPTZ | 创建时间 |
| is_read | BOOLEAN | 是否已读 |

### 6.2 RLS 策略

- **categories**：公开可读，认证可写
- **software**：公开可读，认证可写/更新/删除
- **download_logs**：公开可读，认证可写
- **contact_messages**：公开可写，认证可读

---

## 7. 部署配置

### 7.1 Vercel 部署 (`vercel.json`)

```json
{
  "version": 2,
  "name": "installer-hub",
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    { "src": "/css/(.*)", "dest": "/css/$1" },
    { "src": "/js/(.*)", "dest": "/js/$1" },
    { "src": "/(.*\\.html)", "dest": "/$1" },
    { "src": "/(.*)", "dest": "/$1.html" }
  ]
}
```

### 7.2 Cloudflare Worker 部署

**文件存储 Worker** (`worker/wrangler.toml`)：

```toml
name = "installer-hub-files"
main = "index.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "INSTALLER_BUCKET"
bucket_name = "installer-files"
```

**API端点**：

| 端点 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/admin/upload-url` | POST | 获取预签名上传 URL | Bearer Token |
| `/admin/delete/:key` | DELETE | 删除 R2 中的文件 | Bearer Token |
| `/admin/list` | GET | 列出 R2 中的文件 | Bearer Token |
| `/download/:key` | GET | 公开下载文件 | 无需认证 |

**API代理 Worker** (`worker-proxy/wrangler.toml`)：

```toml
name = "still-meadow-9abe"
main = "index.js"
compatibility_date = "2024-01-01"
```

**代理目标**：`<YOUR_SUPABASE_PROJECT_URL>`

**核心功能**：
- 代理 Supabase REST/Auth/Storage/Functions API
- 5分钟响应缓存，降低 Supabase 请求量
- 故障回退：后端不可用时返回过期缓存
- 自动添加 CORS 头

### 7.3 环境变量

| 变量名 | 说明 | 配置位置 |
|--------|------|----------|
| UPLOAD_SECRET | 文件上传密钥 | Worker Secret |
| worker_url | Worker URL | localStorage |
| upload_secret | 上传密钥 | localStorage |

---

## 8. 安全策略

### 8.1 认证机制

- 使用 Supabase Auth 进行管理员认证
- 管理后台路由需要登录验证
- 登录状态通过 Supabase Session 管理

### 8.2 文件上传安全

- 文件类型白名单验证（`.exe`, `.dmg`, `.zip`, `.msi` 等）
- 文件大小限制（5GB）
- 上传密钥验证（Bearer Token）

### 8.3 数据安全

- RLS（行级安全）限制数据访问
- Supabase 提供的 SSL/TLS 加密
- 数据库密码通过环境变量管理

---

## 9. 性能优化

### 9.1 缓存策略

**前端缓存** (`js/cache.js`)：
- 使用 `localStorage` 存储数据，TTL 为 5 分钟
- 缓存软件列表、分类数据、单个软件详情
- 二次访问无需网络请求，秒开

**Worker 端缓存** (`worker-proxy/index.js`)：
- 使用 Cloudflare Cache API 缓存 GET 请求响应
- TTL 为 5 分钟 (`CACHE_TTL = 300`)
- 故障回退：后端不可用时返回过期缓存（STALE）

### 9.2 资源优化

- 图片懒加载
- 滚动触发动画
- 预连接关键域名

### 9.3 加载优化

- 骨架屏（Skeleton）加载状态
- 并行请求分类和软件数据

---

## 10. 开发与部署流程

### 10.1 本地开发

```bash
# 1. 克隆项目
git clone <repository-url>
cd installer-hub

# 2. 启动本地服务器（推荐使用 Live Server）
# VS Code: 安装 Live Server 扩展，右键 index.html 选择 "Open with Live Server"

# 3. 配置 Worker（可选）
cd worker
npm install -g wrangler
wrangler login
wrangler deploy
```

### 10.2 部署步骤

**前端部署**：
1. 推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 自动构建部署

**Worker部署**：
```bash
# 文件存储 Worker
cd worker
wrangler secret put UPLOAD_SECRET
wrangler deploy

# API代理 Worker
cd worker-proxy
wrangler deploy
```

**数据库配置**：
1. 在 Supabase 创建项目
2. 运行 `supabase-init.sql` 初始化表结构
3. 运行 `supabase-rpc.sql` 创建 RPC 函数

---

## 11. 技术亮点

| 特性 | 说明 |
|------|------|
| 完全免费技术栈 | Vercel + Supabase + Cloudflare R2/Worker |
| 玻璃拟态设计 | 现代化 UI 风格，磨砂玻璃效果 |
| 响应式布局 | 支持移动端和桌面端 |
| 离线缓存 | 二次访问秒开 |
| 实时动画 | 粒子背景、滚动动画 |
| 文件直传 R2 | 不经过服务器，降低带宽成本 |

---

## 12. 优化方案

### 12.1 时间处理优化

**问题分析**：
- `formatDate` 函数在 `js/common.js` 和 `js/data.js` 中重复定义
- 前端时间展示依赖 `toLocaleDateString`，但数据库存储使用 `TIMESTAMPTZ`（UTC时间）
- 缺乏统一的时间工具模块，容易出现时区偏移问题

**优化方案**：

**时间存储规范**：
- 时间点字段（`created_at`, `download_time`）：使用数据库 `TIMESTAMPTZ` 类型，由数据库生成 `NOW()` 或前端使用 `toISOString()` 存储 UTC 时间
- 日期字段（`upload_date`）：使用本地日期字符串 `YYYY-MM-DD`，由前端按本地时区生成
- 展示层：统一使用 `toLocaleDateString/toLocaleString` 按用户时区格式化

创建统一的时间工具模块 `js/time-utils.js`：

```javascript
export function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

export function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getISO8601Timestamp() {
    return new Date().toISOString();
}
```

**迁移步骤**：
1. 创建 `js/time-utils.js`
2. 删除 `js/common.js` 和 `js/data.js` 中的重复 `formatDate` 函数
3. 在所有使用处导入 `time-utils.js`

### 12.2 代码去重优化

**问题分析**：
- `formatDate` 函数重复定义（2处）
- 缺少统一的工具模块管理

**优化方案**：

创建统一工具模块 `js/utils.js`：

```javascript
export function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
}

export function formatFileSize(size) {
    if (typeof size === 'number') {
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    return size;
}
```

### 12.3 安全优化

**问题分析**：
- 敏感配置（Worker URL、上传密钥）存储在 `localStorage`
- 管理后台登录状态直接依赖 Supabase Session

**优化方案**：

1. **环境变量管理**：
   - 使用 Vercel 环境变量管理敏感配置
   - 在 `supabase-client.js` 中通过 `import.meta.env` 读取

2. **增强认证**：
   - 添加管理后台路由守卫
   - 使用 JWT Token 验证管理员权限

3. **文件上传安全增强**：
   - 添加文件病毒扫描（集成 VirusTotal API）
   - 限制文件大小为 2GB（Cloudflare R2 免费额度限制）

### 12.4 性能优化

**问题分析**：
- 前端缓存 TTL 固定为 5 分钟，无法动态调整
- 缺少缓存失效机制

**优化方案**：

1. **动态缓存策略**：
   - 根据数据类型设置不同 TTL（分类：60分钟，软件列表：30分钟，详情：10分钟）
   - 添加缓存版本号，支持强制刷新

2. **Service Worker 集成**：
   - 使用 Workbox 实现离线缓存
   - 支持后台同步上传

3. **图片优化**：
   - 使用 WebP/AVIF 格式
   - 添加图片懒加载占位符

### 12.5 架构优化

**问题分析**：
- 项目结构扁平化，缺少模块化分层
- HTML 页面包含大量内联脚本

**优化方案**：

1. **模块分层**：
   ```
   js/
   ├── api/                    # API层
   │   ├── supabase-client.js
   │   └── worker-client.js
   ├── data/                   # 数据层
   │   ├── store.js            # 全局状态管理
   │   └── cache.js
   ├── utils/                  # 工具层
   │   ├── time.js
   │   ├── format.js
   │   └── common.js
   ├── components/             # UI组件
   │   ├── SoftwareCard.js
   │   ├── CategoryFilter.js
   │   └── Toast.js
   └── pages/                  # 页面逻辑
       ├── index.js
       ├── browse.js
       ├── detail.js
       └── admin.js
   ```

2. **状态管理**：
   - 使用简单的发布-订阅模式（Pub-Sub）管理全局状态
   - 封装数据变更事件，各组件按需订阅
   - 示例：
     ```javascript
     class Store {
         constructor() {
             this.state = {};
             this.listeners = {};
         }
         set(key, value) {
             this.state[key] = value;
             this.notify(key, value);
         }
         get(key) {
             return this.state[key];
         }
         subscribe(key, callback) {
             if (!this.listeners[key]) this.listeners[key] = [];
             this.listeners[key].push(callback);
         }
         notify(key, value) {
             (this.listeners[key] || []).forEach(cb => cb(value));
         }
     }
     const store = new Store();
     ```

### 12.6 可维护性优化

**问题分析**：
- 缺少代码注释和文档
- 缺少基础质量保障机制
- 函数命名和风格不一致

**优化方案**：

1. **代码注释**：
   - 为核心函数添加 JSDoc 注释（参数、返回值、用途）
   - 在复杂逻辑处添加行内注释
   - 示例：
     ```javascript
     /**
      * 格式化日期为中文显示格式
      * @param {string|Date} dateStr - 日期字符串或 Date 对象
      * @returns {string} 格式化后的日期字符串（如：2024年6月15日）
      */
     export function formatDate(dateStr) { ... }
     ```

2. **基础测试**：
   - 创建 `tests/` 目录，编写简单的测试脚本
   - 测试工具函数（`formatDate`, `formatFileSize` 等）
   - 使用 Node.js 内置 `assert` 模块进行基础断言

3. **代码规范**：
   - 使用 `prettier` 统一代码格式
   - 添加 `.prettierrc` 配置文件
   - 使用 `npx prettier --write .` 格式化所有文件

---

## 13. 版本信息

- **项目名称**：Installer Hub（安装中心）
- **当前版本**：v1.0
- **最后更新**：2026年7月
- **技术状态**：生产就绪