-- 创建 increment_download_count RPC 函数
CREATE OR REPLACE FUNCTION increment_download_count(software_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE software
    SET downloads_count = downloads_count + 1
    WHERE id = software_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION increment_download_count(INT) TO anon, authenticated;
