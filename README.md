<div align="center">
  <img src="public/logo.png" alt="AnyCLI Logo" width="168" height="168" />
  <h1>AnyCLI</h1>
  <p>面向 Agent 的 CLI 原生平台</p>
  <p>
    <a href="README.en.md">English</a>
  </p>
  <p>
    <a href="#agent-如何使用推荐从这里开始">Agent 如何使用</a> ·
    <a href="#站点使用">站点使用</a> ·
    <a href="#开发者开发本仓库">开发者指南</a>
  </p>
</div>

## 这是什么

AnyCLI 的目标是把 CLI 工具沉淀为**结构化、可被 Agent 调用的能力单元**：

- **站点**：统一注册与索引，提供「探索 / 发布 / 详情 / 文档」等页面
- **统一的元数据与示例**：以统一的元数据与示例，将 CLI 工具沉淀为可复用的能力入口（安装方式、二进制名、运行示例、Agent 提示等）
- **Agent/终端工作流**：通过 `anycli search/install --json` 获取最小 JSON，再由 Agent 决定是否执行安装与后续命令
- **Proxy/适配层（屏蔽下游差异）**：AnyCLI 提供一个面向 Agent 的统一入口，让 Agent “只对 AnyCLI 说话”：
  - 上游统一：`anycli search/install`（可 `--json` 结构化输出）
  - 下游屏蔽：不同工具的安装方式（brew / npm / pip / script…）、字段差异、文档链接与示例命令组织方式
  - 结果更安全：Agent 先拿到“将要执行的命令”（dry-run），再由人/策略确认后执行

## 站点预览

- **预览地址**：`http://anycli.linklearner.com/`

### 预览截图

**首页**

![首页预览](docs/screenshots/home.png)

**搜索 / 探索**

![搜索预览](docs/screenshots/search.png)

**发布**

![发布预览](docs/screenshots/publish.png)

**后台**

![后台预览](docs/screenshots/console.png)

## Agent 如何使用（推荐从这里开始）

AnyCLI 面向 Agent 的核心流程是：**先 search 得到结构化 JSON，再 install 得到安装命令（默认不执行）**。

安装：

```bash
npm i -g @lightcity/anycli
```

```bash
# 1) 精确查询：slug -> 最小 JSON
anycli search <slug> --json

# 2) 安装：默认 dry-run（只返回将执行的命令，不执行）
anycli install <slug> --json

# 3) 确认后再执行安装
anycli install <slug> --yes --json
```

### 提示词模板（给 AI Agent 直接用）

你可以把这段提示词直接给 Agent，让它按最安全路径执行：

```bash
Please install and verify a CLI tool using AnyCLI safely. Follow these steps:
1) Make sure AnyCLI is installed:
   npm i -g @lightcity/anycli
2) Search for the tool:
   anycli search {{slug}} --json
3) Review the output and check example_usage. Pick the safest command for verification.
4) Install the tool safely:
   anycli install {{slug}} --json   # confirm this command is safe
   anycli install {{slug}} --yes    # execute installation
5) Run a minimal verification command to ensure the tool works (e.g., <binary> --help or a safe command from example_usage).
6) Summarize the output of the verification command.
```

> 站内文档 `/docs` 提供了更完整的 Agent 提示词模板与可复制代码块。

## 站点使用

- **探索 CLI**：`/clis`
- **发布 CLI**：`/publish`（提交后需管理员审核才公开）
- **文档**：`/docs`（Agent 优先的使用方式 + Prompt 模板）
- **关于**：`/about`

## 开发者开发本仓库

请查看 `DEVELOPMENT.md`。