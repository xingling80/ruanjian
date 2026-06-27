// ============================================================
// Cloudflare Worker - Installer Hub 文件服务
// ============================================================
// 功能：
//   1. 生成 R2 预签名上传 URL（管理员上传安装包到 R2）
//   2. 公开下载（通过 R2 自定义域名或 Worker 代理下载）
//
// 部署步骤：
//   1. 创建 R2 存储桶：npx wrangler r2 bucket create installer-files
//   2. 配置 wrangler.toml，绑定 R2
//   3. 部署：npx wrangler deploy
//
// 费用：完全免费（10GB 存储 + 无出站费 + 每天10万次 Worker 请求）
// ============================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-file-name, x-file-size',
      'Access-Control-Max-Age': '86400',
    };

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ========== 管理端：获取预签名上传 URL ==========
    if (request.method === 'POST' && path === '/admin/upload-url') {
      // 简易认证：检查预设的管理密钥
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.UPLOAD_SECRET}`) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const { fileName, fileSize, contentType } = await request.json();
        if (!fileName) {
          return new Response(JSON.stringify({ error: '缺少文件名' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // 生成唯一文件名：时间戳_原始文件名
        const key = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        // 生成 R2 预签名上传 URL（1小时有效）
        const uploadUrl = await env.INSTALLER_BUCKET.createUploadUrl(key, {
          expirationTtl: 3600,
        });

        // 构建公开下载 URL（配合自定义域名或 R2 公开访问）
        const downloadUrl = `https://files.你的域名.com/${key}`;

        return new Response(JSON.stringify({
          success: true,
          key: key,
          uploadUrl: uploadUrl,
          downloadUrl: downloadUrl,
          fileName: fileName,
          fileSize: fileSize
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: '生成上传链接失败: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ========== 管理端：删除文件 ==========
    if (request.method === 'DELETE' && path.startsWith('/admin/delete/')) {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.UPLOAD_SECRET}`) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const key = path.replace('/admin/delete/', '');
      try {
        await env.INSTALLER_BUCKET.delete(key);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: '删除失败: ' + err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ========== 列表文件 ==========
    if (request.method === 'GET' && path === '/admin/list') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || authHeader !== `Bearer ${env.UPLOAD_SECRET}`) {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const objects = await env.INSTALLER_BUCKET.list();
        const files = objects.objects.map(obj => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
        }));
        return new Response(JSON.stringify({ success: true, files }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ========== 公开下载（代理模式 - 如果不绑自定义域名） ==========
    if (request.method === 'GET' && path.startsWith('/download/')) {
      const key = path.replace('/download/', '');
      try {
        const object = await env.INSTALLER_BUCKET.get(key);
        if (!object) {
          return new Response('文件不存在', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Content-Disposition', `attachment; filename="${key.split('_').slice(1).join('_')}"`);
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(object.body, {
          headers
        });
      } catch (err) {
        return new Response('下载失败', { status: 500 });
      }
    }

    // 其他请求
    return new Response(JSON.stringify({
      service: 'Installer Hub File Service',
      version: '1.0.0',
      endpoints: {
        upload: 'POST /admin/upload-url',
        delete: 'DELETE /admin/delete/:key',
        list: 'GET /admin/list',
        download: 'GET /download/:key'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
