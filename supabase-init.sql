-- ============================================================
-- Installer Hub 数据库表结构
-- 在 Supabase SQL Editor 中运行此脚本
-- 可重复运行，不会报错
-- ============================================================

-- 1. 清理可能存在的重复分类
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT name, COUNT(*) as cnt FROM categories GROUP BY name HAVING COUNT(*) > 1 LOOP
        DELETE FROM categories WHERE id IN (
            SELECT id FROM categories WHERE name = r.name 
            ORDER BY id OFFSET 1
        );
    END LOOP;
END $$;

-- 2. 添加唯一约束（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
END $$;

-- 3. 插入/更新分类（幂等操作）
INSERT INTO categories (name, icon) VALUES
('创意设计', 'design_services'),
('开发工具', 'code'),
('视频剪辑', 'movie_edit'),
('数据分析', 'analytics'),
('安全加密', 'security'),
('云存储', 'cloud')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon;

-- 4. 插入初始软件（幂等操作 - 按名称去重）
INSERT INTO software (name, icon, version, platform, size, category_id, license, description, downloads_count, upload_date, is_verified, system_requirements, release_notes, download_urls, features) 
SELECT * FROM (VALUES
(
    'Creative Suite Pro',
    'design_services', 'v24.5.1 LTS', 'Multi-Platform', '4.2 GB',
    (SELECT id FROM categories WHERE name = '创意设计' LIMIT 1),
    '企业订阅', '数字创作者的终极工具包。',
    3521, '2024-06-01', TRUE,
    '{"cpu":"Intel Core i7-9700K","gpu":"NVIDIA RTX 2060","ram":"16 GB","storage":"20 GB"}'::jsonb,
    '[{"icon":"star","title":"性能优化","detail":"启动速度提升40%"}]'::jsonb,
    '[]'::jsonb,
    ARRAY['64位原生','认证发行商','多语言支持']
),
(
    'DevStudio Enterprise',
    'code', 'v2024.2', 'Windows / macOS / Linux', '1.8 GB',
    (SELECT id FROM categories WHERE name = '开发工具' LIMIT 1),
    '商业软件', '专业级集成开发环境。',
    2156, '2024-06-10', TRUE,
    '{"cpu":"Intel Core i5","gpu":"集成显卡","ram":"8 GB","storage":"5 GB"}'::jsonb,
    '[{"icon":"zap","title":"性能提升","detail":"编译速度提升30%"}]'::jsonb,
    '[]'::jsonb,
    ARRAY['64位原生','智能代码补全','Git集成']
),
(
    'VideoStudio Ultimate',
    'movie_edit', 'v18.0', 'Windows / macOS', '3.5 GB',
    (SELECT id FROM categories WHERE name = '视频剪辑' LIMIT 1),
    '商业软件', '专业视频编辑软件。',
    1892, '2024-06-15', TRUE,
    '{"cpu":"Intel Core i9-10900K","gpu":"NVIDIA RTX 3060","ram":"32 GB","storage":"50 GB"}'::jsonb,
    '[{"icon":"video_library","title":"8K支持","detail":"完整8K编辑流程"}]'::jsonb,
    '[]'::jsonb,
    ARRAY['8K编辑','AI智能剪辑','多机位剪辑']
),
(
    'DataAnalytics Pro',
    'analytics', 'v12.3', 'Windows / macOS', '1.2 GB',
    (SELECT id FROM categories WHERE name = '数据分析' LIMIT 1),
    '企业订阅', '强大的数据分析与可视化工具。',
    1567, '2024-06-05', TRUE,
    '{"cpu":"Intel Core i7","gpu":"集成显卡","ram":"16 GB","storage":"10 GB"}'::jsonb,
    '[{"icon":"bar_chart","title":"图表更新","detail":"新增20+图表类型"}]'::jsonb,
    '[]'::jsonb,
    ARRAY['大数据处理','智能图表','数据安全']
),
(
    'SecureVault Premium',
    'security', 'v8.2', 'Multi-Platform', '280 MB',
    (SELECT id FROM categories WHERE name = '安全加密' LIMIT 1),
    '商业软件', '军事级数据加密软件。',
    876, '2024-06-20', TRUE,
    '{"cpu":"任意现代CPU","gpu":"无需","ram":"4 GB","storage":"1 GB"}'::jsonb,
    '[{"icon":"lock","title":"加密升级","detail":"AES-256-GCM"}]'::jsonb,
    '[]'::jsonb,
    ARRAY['AES-256加密','生物识别','多设备同步']
),
(
    'CloudSync Business',
    'cloud', 'v5.1', 'Multi-Platform', '450 MB',
    (SELECT id FROM categories WHERE name = '云存储' LIMIT 1),
    '企业订阅', '企业级云存储同步工具。',
    2243, '2024-06-18', TRUE,
    '{"cpu":"任意现代CPU","gpu":"无需","ram":"8 GB","storage":"5 GB"}'::jsonb,
    '[{"icon":"cloud_upload","title":"上传加速","detail":"多线程上传"}]'::jsonb,
    '[]'::jsonb,
    ARRAY['无限存储','增量同步','审计日志']
)
) AS t(name, icon, version, platform, size, category_id, license, description, downloads_count, upload_date, is_verified, system_requirements, release_notes, download_urls, features)
WHERE NOT EXISTS (SELECT 1 FROM software s WHERE s.name = t.name)
ON CONFLICT DO NOTHING;

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_software_category ON software(category_id);
CREATE INDEX IF NOT EXISTS idx_software_name ON software(name);
CREATE INDEX IF NOT EXISTS idx_download_logs_software ON download_logs(software_id);

-- 6. RLS 策略（幂等操作）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Allow public read access to software" ON software FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Allow public read access to download_logs" ON download_logs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Allow auth write to software" ON software FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Allow auth write to download_logs" ON download_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Allow auth write to categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Allow auth update to software" ON software FOR UPDATE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Allow auth delete to software" ON software FOR DELETE USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7. 递增下载量函数
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

-- 8. 联系留言表
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    type TEXT DEFAULT '软件安装咨询',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Allow public insert to contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Allow auth read contact_messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
