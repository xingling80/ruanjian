-- ============================================================
-- Installer Hub 数据库表结构 + Storage 配置
-- 在 Supabase SQL Editor 中运行此脚本
-- 
-- 存储方案：完全免费
--   - Supabase 数据库（500MB, 免费）
--   - Cloudflare R2 存储（10GB, 完全免费, 无出站费）
--   - Cloudflare Worker（每天10万次, 免费）
-- ============================================================

-- 1. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建软件表
CREATE TABLE IF NOT EXISTS software (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    icon VARCHAR(50),
    version VARCHAR(50),
    platform VARCHAR(100),
    size VARCHAR(50),
    category_id INT REFERENCES categories(id),
    license VARCHAR(100),
    description TEXT,
    downloads_count INT DEFAULT 0,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    sha256 VARCHAR(64),
    system_requirements JSONB,
    release_notes JSONB,
    features TEXT[],
    -- R2 下载链接数组: [{"name":"Setup.exe","size":"2.1GB","url":"https://...","r2_key":"xxx"}]
    download_urls JSONB DEFAULT '[]'
);

-- 3. 创建下载记录表
CREATE TABLE IF NOT EXISTS download_logs (
    id SERIAL PRIMARY KEY,
    software_id INT REFERENCES software(id),
    filename VARCHAR(255),
    file_size VARCHAR(50),
    download_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    user_agent TEXT
);

-- 4. 创建管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 5. 插入初始分类数据
INSERT INTO categories (name, icon) VALUES
('创意设计', 'design_services'),
('开发工具', 'code'),
('视频剪辑', 'movie_edit'),
('数据分析', 'analytics'),
('安全加密', 'security'),
('云存储', 'cloud')
ON CONFLICT DO NOTHING;

-- 6. 插入初始软件数据（download_urls 为空，部署后通过后台添加）
INSERT INTO software (name, icon, version, platform, size, category_id, license, description, downloads_count, upload_date, is_verified, system_requirements, release_notes, download_urls, features) VALUES
(
    'Creative Suite Pro',
    'design_services',
    'v24.5.1 LTS',
    'Multi-Platform',
    '4.2 GB',
    (SELECT id FROM categories WHERE name = '创意设计'),
    '企业订阅',
    '数字创作者的终极工具包。体验硬件加速渲染、AI驱动的自动化工具。',
    3521,
    '2024-06-01',
    TRUE,
    '{"cpu": "Intel Core i7-9700K", "gpu": "NVIDIA RTX 2060", "ram": "16 GB RAM", "storage": "20 GB"}',
    '[{"icon": "star", "title": "性能优化", "detail": "启动速度提升40%"}]',
    '[]'::jsonb,
    ARRAY['64位原生', '认证发行商', '多语言支持']
),
(
    'DevStudio Enterprise',
    'code',
    'v2024.2',
    'Windows / macOS / Linux',
    '1.8 GB',
    (SELECT id FROM categories WHERE name = '开发工具'),
    '商业软件',
    '专业级集成开发环境，支持100+编程语言，智能代码补全。',
    2156,
    '2024-06-10',
    TRUE,
    '{"cpu": "Intel Core i5", "gpu": "集成显卡", "ram": "8 GB RAM", "storage": "5 GB"}',
    '[{"icon": "zap", "title": "性能提升", "detail": "编译速度提升30%"}]',
    '[]'::jsonb,
    ARRAY['64位原生', '智能代码补全', 'Git集成']
),
(
    'VideoStudio Ultimate',
    'movie_edit',
    'v18.0',
    'Windows / macOS',
    '3.5 GB',
    (SELECT id FROM categories WHERE name = '视频剪辑'),
    '商业软件',
    '专业视频编辑软件，支持8K视频编辑，AI智能剪辑。',
    1892,
    '2024-06-15',
    TRUE,
    '{"cpu": "Intel Core i9-10900K", "gpu": "NVIDIA RTX 3060", "ram": "32 GB RAM", "storage": "50 GB"}',
    '[{"icon": "video_library", "title": "8K支持", "detail": "完整8K编辑流程"}]',
    '[]'::jsonb,
    ARRAY['8K编辑', 'AI智能剪辑', '多机位剪辑']
),
(
    'DataAnalytics Pro',
    'analytics',
    'v12.3',
    'Windows / macOS',
    '1.2 GB',
    (SELECT id FROM categories WHERE name = '数据分析'),
    '企业订阅',
    '强大的数据分析与可视化工具，支持海量数据处理。',
    1567,
    '2024-06-05',
    TRUE,
    '{"cpu": "Intel Core i7", "gpu": "集成显卡", "ram": "16 GB RAM", "storage": "10 GB"}',
    '[{"icon": "bar_chart", "title": "图表更新", "detail": "新增20+图表类型"}]',
    '[]'::jsonb,
    ARRAY['大数据处理', '智能图表', '数据安全']
),
(
    'SecureVault Premium',
    'security',
    'v8.2',
    'Multi-Platform',
    '280 MB',
    (SELECT id FROM categories WHERE name = '安全加密'),
    '商业软件',
    '军事级数据加密软件，端到端加密保护您的敏感数据。',
    876,
    '2024-06-20',
    TRUE,
    '{"cpu": "任意现代CPU", "gpu": "无需", "ram": "4 GB RAM", "storage": "1 GB"}',
    '[{"icon": "lock", "title": "加密升级", "detail": "AES-256-GCM"}]',
    '[]'::jsonb,
    ARRAY['AES-256加密', '生物识别', '多设备同步']
),
(
    'CloudSync Business',
    'cloud',
    'v5.1',
    'Multi-Platform',
    '450 MB',
    (SELECT id FROM categories WHERE name = '云存储'),
    '企业订阅',
    '企业级云存储同步工具，智能增量同步，完整审计日志。',
    2243,
    '2024-06-18',
    TRUE,
    '{"cpu": "任意现代CPU", "gpu": "无需", "ram": "8 GB RAM", "storage": "5 GB"}',
    '[{"icon": "cloud_upload", "title": "上传加速", "detail": "多线程上传"}]',
    '[]'::jsonb,
    ARRAY['无限存储', '增量同步', '审计日志']
)
ON CONFLICT DO NOTHING;

-- 7. 创建索引
CREATE INDEX IF NOT EXISTS idx_software_category ON software(category_id);
CREATE INDEX IF NOT EXISTS idx_software_name ON software(name);
CREATE INDEX IF NOT EXISTS idx_download_logs_software ON download_logs(software_id);

-- 8. RLS 策略
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories" ON categories
FOR SELECT USING (true);

CREATE POLICY "Allow public read access to software" ON software
FOR SELECT USING (true);

CREATE POLICY "Allow public read access to download_logs" ON download_logs
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write access to software" ON software
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access to download_logs" ON download_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access to categories" ON categories
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access to software" ON software
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete access to software" ON software
FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read access to admin_users" ON admin_users
FOR SELECT USING (auth.role() = 'authenticated');

-- 9. 递增下载量函数
CREATE OR REPLACE FUNCTION increment_download_count(software_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE software
    SET downloads_count = downloads_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = software_id
    RETURNING downloads_count INTO new_count;
    RETURN new_count;
END;
$$;

-- ============================================================
-- Cloudflare R2 完全免费存储说明
-- ============================================================
-- 1. 前往 cloudflare.com 注册免费账号
-- 2. 在 R2 中创建存储桶: installer-files
-- 3. 部署 worker/ 目录下的 Worker 代码
-- 4. Worker 会处理文件上传/下载的预签名 URL
-- 5. 安装包存储在 R2（10GB 免费），元数据在 Supabase
