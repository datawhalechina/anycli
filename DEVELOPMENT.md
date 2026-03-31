# 开发者指南（Development）

本文件面向**本仓库贡献者/维护者**，介绍如何在本地开发与维护 AnyCLI（站点 + CLI）。

## 环境准备

- Node.js（建议使用仓库当前 `package.json` 兼容的版本）
- MySQL（必需）
- Redis（可选，用于缓存与 PV 聚合写回；未配置时相关能力会降级/跳过）

## 安装依赖

```bash
npm install
```

## 环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

至少需要数据库相关变量（具体字段以 `.env.example` 为准）。

## 数据库（Prisma）

```bash
npx prisma migrate deploy
```

（如你在本地做了 schema 变更，需要自行按项目约定生成/应用迁移。）

## 启动站点

```bash
npm run dev
```

打开 `http://localhost:3000`。

## CLI（packages/anycli）

开发/构建：

```bash
npm run -w anycli build
node packages/anycli/dist/index.js --help
```

## 常用脚本

- Lint：`npm run lint`
- Build：`npm run build`
- Start：`npm run start`
- Sync GitHub Stars：`npm run stars:sync`

