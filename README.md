# MiniPM

MiniPM 是一个面向游戏美术 PM 的每日学习助手 MVP。当前版本包含 PRD PDF、手机端 PWA、网页后台、Demo 数据、Supabase schema、自动生成/提醒 API 骨架和 GitHub Actions 定时任务。

## 已落地内容

- PRD PDF：`docs/MiniPM_PRD.pdf`
- 手机端 PWA：`/app/today`
- PMP 挑战：`/app/quiz`
- 阅读页：`/app/read/[id]`
- 错题复习：`/app/review`
- 打卡统计：`/app/stats`
- 管理后台：`/admin`
- 今日内容 API：`/api/today`
- 学习进度 API：`/api/progress`
- 每日生成 API：`/api/admin/generate-daily`
- 提醒 API：`/api/admin/send-reminders`
- Supabase 数据库 schema：`supabase/schema.sql`

## 本地运行

```bash
npm install
npm run dev
```

打开：

- 手机端：<http://127.0.0.1:3000/app/today>
- 后台：<http://127.0.0.1:3000/admin>

未配置 Supabase 和 OpenAI 时，应用会使用 Demo 数据，方便先体验完整流程。

## 环境变量

复制 `.env.example` 为 `.env.local`，按需填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-nano
GITHUB_TOKEN=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Supabase Auth 需要把以下地址加入允许的 Redirect URLs：

```text
http://localhost:3000/auth/callback
https://你的域名/auth/callback
```

`GITHUB_TOKEN` 是可选项；不配置也能运行，配置后 GitHub 搜索接口额度更稳。

## 部署建议

第一版按低成本方案：

- Vercel 部署 Next.js
- Supabase 托管 Auth + Postgres
- GitHub Actions 触发定时任务
- OpenAI 使用低成本模型

当前项目已经包含 PWA 安装所需资源：

- Web App Manifest：`/manifest.webmanifest`
- Service Worker：`/sw.js`
- Android 图标：`/icon-192.png`、`/icon-512.png`
- Android 自适应图标：`/maskable-icon-192.png`、`/maskable-icon-512.png`
- iOS 主屏图标：`/apple-touch-icon.png`
- 手机端安装入口：满足浏览器安装条件时，`/app/*` 页面会出现安装提示

注意：手机真正安装 PWA 通常需要 HTTPS。`localhost` 可以用于电脑本机调试；`http://局域网IP:3000` 可以在手机预览，但多数手机浏览器不会把它当成可安装应用。部署到 Vercel 后会自动获得 HTTPS 地址。

### Vercel 部署步骤

1. 把项目推送到 GitHub。
2. 在 Vercel 新建项目并导入该 GitHub 仓库。
3. Framework Preset 选择 Next.js，Build Command 使用默认 `npm run build`。
4. 在 Vercel Project Settings → Environment Variables 填入 `.env.example` 中的变量。
5. 部署完成后，把 `NEXT_PUBLIC_APP_URL` 更新为 Vercel 的 HTTPS 域名，例如 `https://minipm.vercel.app`。
6. 在 Supabase Auth Redirect URLs 中加入 `https://你的域名/auth/callback`。
7. 手机打开 `https://你的域名/app/today`，按浏览器提示安装到桌面。

### 手机安装方式

Android Chrome / Edge：

1. 用手机打开 `https://你的域名/app/today`。
2. 如果页面底部出现“安装 MiniPM”，点击“安装”。
3. 如果没有出现，打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。

iPhone Safari：

1. 用 Safari 打开 `https://你的域名/app/today`。
2. 点击底部分享按钮。
3. 选择“添加到主屏幕”。
4. 确认名称为 MiniPM 后添加。

部署后可以运行 PWA 自检：

```bash
npm run pwa:check -- https://你的域名
```

自检会确认启动页、manifest、关键图标和 service worker 是否可访问。它不能代替手机浏览器的最终安装判断，但可以提前排除大多数配置问题。

### 临时手机试装

如果暂时还没有正式域名，可以用 Cloudflare Quick Tunnel 生成一个临时 HTTPS 地址：

```bash
npm run phone:install
```

这个命令会：

- 确认生产构建存在，必要时自动执行 `npm run build`
- 启动 `next start`
- 使用 `cloudflared` 创建临时 HTTPS 地址
- 自动执行 `pwa:check`
- 打印手机可打开的 `/app/today` 安装地址

第一次使用前如果系统没有 `cloudflared`，Windows 可执行：

```bash
winget install --id Cloudflare.cloudflared
```

临时地址依赖当前电脑和网络，关闭终端、电脑休眠或网络变化后可能失效；长期使用仍建议部署到固定 HTTPS 域名。

GitHub Actions secrets：

- `MINIPM_APP_URL`：部署后的应用地址
- `CRON_SECRET`：和 Vercel 环境变量 `CRON_SECRET` 保持一致

定时任务按北京时间：

- 08:30 生成今日内容
- 09:00 / 14:00 / 21:00 触发提醒

运行 `supabase/schema.sql` 后，应用会优先读写 Supabase；未配置 Supabase 时，手机端会回退到本地 Demo 模式，方便继续开发和体验。

## 验证命令

```bash
npm run lint
npm run typecheck
npm run build
```

## PRD PDF

PDF 已生成在 `docs/MiniPM_PRD.pdf`。如需重新生成，请先确保 Python 环境安装 `reportlab`，然后执行：

```bash
python scripts/build_prd_pdf.py
```
