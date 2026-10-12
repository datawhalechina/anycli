# 开发者指南（Development）

本文件面向**本仓库贡献者/维护者**，介绍如何在本地开发与维护 AnyCLI（站点 + CLI）。

## 环境准备

- [Node.js](https://nodejs.org/)（建议使用仓库当前 `package.json` 兼容的版本）
- [MySQL](https://www.mysql.com/)（必需）
- [Redis](https://redis.io/)（可选，用于缓存与 PV 聚合写回；未配置时相关能力会降级/跳过）

## 安装依赖

```bash
npm install
```

## 环境变量

复制 [`.env.example`](.env.example) 为 `.env` 并填写：

```bash
cp .env.example .env
```

至少需要数据库相关变量（具体字段以 [`.env.example`](.env.example) 为准）。

## 数据库（[Prisma](https://www.prisma.io/)）

```bash
npx prisma migrate deploy
```

（如你在本地做了 schema 变更，需要自行按项目约定生成/应用迁移。）

## 启动站点

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## CLI（[packages/anycli](packages/anycli)）

开发/构建：

```bash
npm run -w anycli build
node packages/anycli/dist/index.js --help
```

自定义安装命令回归测试（先执行上面的 CLI 构建命令）：

```bash
node --import tsx --test packages/anycli/tests/custom-install-command.test.mjs
```

测试使用真实 CLI 子进程、本地 HTTP 目录桩和临时安装脚本，覆盖 search、dry-run、确认安装、工作目录与带空格的参数；不连接线上目录或安装第三方软件。发布表单的「其它 / 脚本」方式保存为 `script`，其 `installPackage` 应填写完整安装命令，命令生成器会原样返回。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run lint` | Lint 代码 |
| `npm run build` | 构建站点 |
| `npm run start` | 启动生产服务 |
| `npm run stars:sync` | 同步 GitHub Stars |

