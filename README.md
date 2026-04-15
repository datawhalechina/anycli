<div align="center">
  <img src="public/logo.png" alt="AnyCLI Logo" width="168" height="168" />

  <h1>🚀 AnyCLI</h1>
  <p><strong>面向 Agent 的 CLI 原生平台</strong></p>
  <p><em>让每一个 CLI 工具都成为 AI Agent 可调用的能力单元</em></p>

  <p>
    <a href="https://www.npmjs.com/package/@lightcity/anycli"><img src="https://img.shields.io/npm/v/@lightcity/anycli?style=flat-square&logo=npm&logoColor=white&label=npm&color=CB3837" alt="npm version" /></a>
    <a href="https://github.com/datawhalechina/anycli/stargazers"><img src="https://img.shields.io/github/stars/datawhalechina/anycli?style=flat-square&logo=github&color=yellow" alt="GitHub Stars" /></a>
    <a href="https://github.com/datawhalechina/anycli/blob/main/LICENSE"><img src="https://img.shields.io/github/license/datawhalechina/anycli?style=flat-square&color=blue" alt="License" /></a>
    <a href="https://github.com/datawhalechina/anycli/issues"><img src="https://img.shields.io/github/issues/datawhalechina/anycli?style=flat-square&color=orange" alt="Issues" /></a>
    <a href="https://github.com/datawhalechina/anycli/pulls"><img src="https://img.shields.io/github/issues-pr/datawhalechina/anycli?style=flat-square&color=green" alt="Pull Requests" /></a>
  </p>

  <p>
    <a href="README.en.md">English</a> | <a href="http://anycli.linklearner.com/">🌐 在线体验</a>
  </p>

  <p>
    <a href="#-快速开始">⚡ 快速开始</a> ·
    <a href="#-核心特性">✨ 核心特性</a> ·
    <a href="#-站点预览">📸 站点预览</a> ·
    <a href="#-agent-如何使用">🤖 Agent 使用</a> ·
    <a href="#-开发指南">🔧 开发指南</a>
  </p>
</div>

---

## 💡 这是什么

> **AnyCLI = CLI 工具的统一注册中心 + AI Agent 的能力调度层**

传统 CLI 工具散落在不同包管理器中，安装方式各异、文档格式不统一。AnyCLI 将它们统一收录，让 AI Agent **一句话就能搜索、安装、调用**任何 CLI 工具。

<table>
<tr>
<td width="50%">

### 🏗️ 统一平台
- 统一注册与索引 CLI 工具
- 提供「探索 / 发布 / 详情 / 文档」页面
- 结构化元数据：安装方式、二进制名、运行示例、Agent 提示

</td>
<td width="50%">

### 🤖 Agent 原生
- `anycli search/install --json` 获取结构化 JSON
- Agent "只对 AnyCLI 说话"，屏蔽下游差异
- 安全优先：默认 dry-run，确认后再执行

</td>
</tr>
</table>

## ⚡ 快速开始

```bash
# 全局安装 AnyCLI
npm i -g @lightcity/anycli

# 搜索工具 → 结构化 JSON
anycli search <slug> --json

# 安装（默认 dry-run，只显示将执行的命令）
anycli install <slug> --json

# 确认安全后执行安装
anycli install <slug> --yes --json
```

## ✨ 核心特性

| 特性 | 说明 |
| :---: | --- |
| 🔍 **统一搜索** | 一个命令搜索所有已注册 CLI 工具，返回结构化 JSON |
| 📦 **统一安装** | 屏蔽 brew / npm / pip / script 等下游差异 |
| 🛡️ **安全优先** | 默认 dry-run，Agent 先拿到"将要执行的命令"，由人/策略确认后执行 |
| 🧩 **元数据驱动** | 安装方式、二进制名、运行示例、Agent 提示——标准化的能力入口 |
| 🌐 **Web 平台** | 在线探索、发布、管理 CLI 工具 |

## 📸 站点预览

> 🔗 **在线体验**：[anycli.linklearner.com](http://anycli.linklearner.com/)

<table>
<tr>
<td width="50%" align="center">
<strong>首页</strong><br/>
<img src="docs/screenshots/home.png" alt="首页预览" />
</td>
<td width="50%" align="center">
<strong>搜索 / 探索</strong><br/>
<img src="docs/screenshots/search.png" alt="搜索预览" />
</td>
</tr>
<tr>
<td width="50%" align="center">
<strong>发布</strong><br/>
<img src="docs/screenshots/publish.png" alt="发布预览" />
</td>
<td width="50%" align="center">
<strong>后台管理</strong><br/>
<img src="docs/screenshots/console.png" alt="后台预览" />
</td>
</tr>
</table>

## 🤖 Agent 如何使用

AnyCLI 面向 Agent 的核心流程：**search → 结构化 JSON → install（dry-run）→ 确认 → 执行**。

### 提示词模板（给 AI Agent 直接用）

把这段提示词直接给 Agent，让它按最安全路径执行：

```text
Please install and verify a CLI tool using AnyCLI safely. Follow these steps:
1) Make sure AnyCLI is installed:
   npm i -g @lightcity/anycli
2) Search for the tool:
   anycli search {{slug}} --json
3) Review the output and check example_usage. Pick the safest command for verification.
4) Install the tool safely:
   anycli install {{slug}} --json   # confirm this command is safe
   anycli install {{slug}} --yes    # execute installation
5) Run a minimal verification command to ensure the tool works
   (e.g., <binary> --help or a safe command from example_usage).
6) Summarize the output of the verification command.
```

> 📖 站内文档 [`/docs`](http://anycli.linklearner.com/docs) 提供了更完整的 Agent 提示词模板与可复制代码块。

## 🌐 站点导航

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 🔍 探索 CLI | [`/clis`](http://anycli.linklearner.com/clis) | 浏览所有已注册的 CLI 工具 |
| 📤 发布 CLI | [`/publish`](http://anycli.linklearner.com/publish) | 提交新工具（需管理员审核） |
| 📖 文档 | [`/docs`](http://anycli.linklearner.com/docs) | Agent 优先的使用方式 + Prompt 模板 |
| ℹ️ 关于 | [`/about`](http://anycli.linklearner.com/about) | 项目介绍 |

## 🔧 开发指南

请查看 [DEVELOPMENT.md](DEVELOPMENT.md)。

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

<div align="center">
  <p>
    <sub>由 <a href="https://github.com/datawhalechina">Datawhale</a> 社区 ❤️ 构建</sub>
  </p>
</div>
