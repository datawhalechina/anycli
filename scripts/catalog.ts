/**
 * 一次性导入本站策展目录（非自动种子）。
 * 运行：npm run catalog:load
 *
 * 热度由站内 viewCount（详情页 PV）决定，本脚本不写访问量。
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type CliFixture = {
  slug: string;
  name: string;
  description: string;
  version?: string;
  homepage?: string;
  repository: string;
  license?: string;
  categories: string[];
  tags: string[];
  installMethod: string;
  installPackage: string;
  binaryName: string;
  runExample?: string;
  agentHints?: Record<string, unknown>;
  verified?: boolean;
};

const CATALOG_USER_EMAIL = "admin@datawhale.cn";
const CATALOG_USER_HANDLE = "admin";
const DEFAULT_AUTHOR_HANDLE = "admin";

/**
 * categories：按「使用场景」划分（slug 小写，与浏览页下拉一致）。
 * 3d / design 暂无条目，加新 CLI 时挂上即可出现在分类筛选里。
 *
 * - collaboration：办公、IM、企业协作
 * - dev：开发、工程、代码与仓库
 * - ai：LLM、本地推理、AI 结对编程
 * - terminal：终端交互、模糊查找等工作流
 * - video / music：视频、音频处理（可与 media 类工具重叠）
 * - design / 3d：设计、三维内容管线（预留）
 */
/** 官方 Lark/Feishu CLI：https://github.com/larksuite/cli */
/** 企业微信 CLI：https://github.com/WecomTeam/wecom-cli */
const FIXTURES: CliFixture[] = [
  {
    slug: "lark-cli",
    name: "Lark CLI (lark-cli)",
    description:
      "飞书/Lark 开放平台官方命令行工具（larksuite 维护）。面向人类与 AI Agent，覆盖消息、文档、多维表格、日历、邮件、会议等 11+ 业务域，200+ 命令、19 个 Agent Skills；支持 npm 全局安装与结构化输出（--format json 等）。MIT 协议。",
    homepage: "https://github.com/larksuite/cli",
    repository: "https://github.com/larksuite/cli",
    license: "MIT",
    categories: ["collaboration"],
    tags: ["lark", "feishu", "飞书", "npm", "agent-skills", "oauth", "calendar", "im"],
    installMethod: "npm",
    installPackage: "@larksuite/cli",
    binaryName: "lark-cli",
    runExample: "lark-cli auth login --recommend",
    verified: true, // 精选：飞书官方
    agentHints: {
      when_to_use:
        "需要让 Agent 或脚本操作飞书/Lark Open Platform（日历、消息、文档、多维表格、会议等）时使用；安装后需 `lark-cli config init` 与 `lark-cli auth login` 完成凭证。",
      example_usage: [
        "npm install -g @larksuite/cli && npx skills add larksuite/cli -y -g",
        "lark-cli config init",
        "lark-cli auth login --recommend",
        "lark-cli calendar +agenda",
        'lark-cli im +messages-send --chat-id "oc_xxx" --text "Hello"',
      ],
      docs_urls: ["https://github.com/larksuite/cli"],
      output_formats: ["json", "pretty", "table", "ndjson", "csv"],
    },
  },
  {
    slug: "wecom-cli",
    name: "wecom-cli",
    description:
      "企业微信开放平台命令行工具（WecomTeam）。覆盖通讯录、待办、会议、消息、日程、文档、智能表格等；面向人类与 AI Agent，提供 12 个 Agent Skills。通过 npm 安装 @wecom/cli，并需 `npx skills add WecomTeam/wecom-cli -y -g` 安装 CLI SKILL。MIT 协议。",
    homepage: "https://github.com/WecomTeam/wecom-cli",
    repository: "https://github.com/WecomTeam/wecom-cli",
    license: "MIT",
    categories: ["collaboration"],
    tags: ["wecom", "企业微信", "npm", "agent-skills", "bot", "rust-core"],
    installMethod: "npm",
    installPackage: "@wecom/cli",
    binaryName: "wecom-cli",
    runExample: "wecom-cli init",
    verified: true, // 精选：企业微信
    agentHints: {
      when_to_use:
        "需要在终端由 Agent 操作企业微信（通讯录、待办、会议、消息、日程、文档、智能表格）时使用；先 `wecom-cli init` 配置机器人凭证。",
      example_usage: [
        "npm install -g @wecom/cli && npx skills add WecomTeam/wecom-cli -y -g",
        "wecom-cli init",
        "wecom-cli contact get_userlist '{}'",
      ],
      docs_urls: ["https://github.com/WecomTeam/wecom-cli"],
    },
  },
  {
    slug: "gh",
    name: "GitHub CLI",
    description:
      "GitHub 官方 gh 命令行。管理 issue、PR、Actions、Codespaces、Release 等，适合 Agent 自动化 repo 工作流；支持 JSON 输出 (--json)。",
    homepage: "https://cli.github.com",
    repository: "https://github.com/cli/cli",
    license: "MIT",
    categories: ["dev"],
    tags: ["github", "git", "agent", "json-output", "automation"],
    installMethod: "brew",
    installPackage: "gh",
    binaryName: "gh",
    runExample: 'gh pr list --repo owner/repo --json number,title',
    verified: false,
    agentHints: {
      when_to_use:
        "与 GitHub 仓库交互、列 PR/Issue、触发 workflow、发布 Release 时优先使用 gh；官方入口见 https://cli.github.com/ 。",
      example_usage: [
        "gh auth status",
        "gh issue list --json title,number",
        "gh pr create --fill",
        "gh api repos/:owner/:repo --method GET",
      ],
      docs_urls: ["https://cli.github.com/", "https://cli.github.com/manual/"],
    },
  },
  {
    slug: "ripgrep",
    name: "ripgrep (rg)",
    description: "极快的递归 grep，默认尊重 .gitignore；Agent 检索代码库时的首选文本搜索工具。",
    homepage: "https://github.com/BurntSushi/ripgrep",
    repository: "https://github.com/BurntSushi/ripgrep",
    license: "MIT",
    categories: ["dev"],
    tags: ["grep", "search", "codebase", "agent", "rust"],
    installMethod: "brew",
    installPackage: "ripgrep",
    binaryName: "rg",
    runExample: "rg -n --glob '*.ts' 'useEffect' ./src",
    verified: false,
    agentHints: {
      when_to_use: "在仓库中按模式搜索、批量定位符号或字符串；比 grep 更快且过滤更智能。",
      example_usage: ["rg 'TODO' --type-add 'config:*.{toml,yaml}' -t config"],
    },
  },
  {
    slug: "fzf",
    name: "fzf",
    description: "命令行模糊查找器，可与 ripgrep、git 等管道组合；人类交互与脚本筛选都常用。",
    homepage: "https://github.com/junegunn/fzf",
    repository: "https://github.com/junegunn/fzf",
    license: "MIT",
    categories: ["terminal"],
    tags: ["fuzzy", "terminal", "interactive", "pipeline"],
    installMethod: "brew",
    installPackage: "fzf",
    binaryName: "fzf",
    runExample: "rg --files | fzf",
    verified: false,
    agentHints: {
      when_to_use: "需要交互式从列表中挑选文件或行时在终端使用；非交互脚本可换用固定参数。",
      example_usage: ["history | fzf", "find . -type f | fzf"],
    },
  },
  {
    slug: "uv",
    name: "uv",
    description:
      "Astral 出品的极速 Python 包/项目管理器（pip + venv + lockfile 一体化）。近年 Agent 与科学计算场景常用，替代 pip/poetry  many workflows。",
    homepage: "https://github.com/astral-sh/uv",
    repository: "https://github.com/astral-sh/uv",
    license: "Apache-2.0 / MIT",
    categories: ["dev"],
    tags: ["python", "pip", "venv", "agent", "fast"],
    installMethod: "brew",
    installPackage: "uv",
    binaryName: "uv",
    runExample: "uv pip install ruff && uv run ruff check .",
    verified: false,
    agentHints: {
      when_to_use: "需要安装 Python 依赖、创建虚拟环境或锁版本时；比传统 pip 更快、可重复性更好。",
      example_usage: ["uv init", "uv add requests", "uv run python main.py"],
    },
  },
  {
    slug: "bun",
    name: "Bun",
    description: "一体化 JavaScript 运行时/打包/包管理器；npm 兼容，冷启动快，适合脚本与小型工具链。",
    homepage: "https://bun.sh",
    repository: "https://github.com/oven-sh/bun",
    license: "MIT",
    categories: ["dev"],
    tags: ["nodejs", "npm", "typescript", "agent", "speed"],
    installMethod: "brew",
    installPackage: "bun",
    binaryName: "bun",
    runExample: "bunx eslint .",
    verified: false,
    agentHints: {
      when_to_use: "需要运行/安装 JS 工具链且希望低延迟时；可用 bunx 代替 npx。",
      example_usage: ["bun install", "bun run build", "bunx prettier --write ."],
    },
  },
  {
    slug: "aider",
    name: "aider",
    description:
      "终端 AI 结对编程助手，对接多种大模型，在本地 git 仓库中编辑代码；Agent / 人类都常用的开源 CLI 工作流工具。",
    homepage: "https://aider.chat",
    repository: "https://github.com/Aider-AI/aider",
    license: "Apache-2.0",
    categories: ["ai", "dev"],
    tags: ["llm", "pair-programming", "git", "agent", "python"],
    installMethod: "pip",
    installPackage: "aider-chat",
    binaryName: "aider",
    runExample: "aider --model sonnet src/main.py",
    verified: false,
    agentHints: {
      when_to_use: "需要在仓库内由 LLM 直接改文件、多文件编辑并走 git diff 审查时使用。",
      example_usage: ["pip install aider-chat", 'aider "add error handling to fetch()"'],
    },
  },
  {
    slug: "ollama",
    name: "Ollama",
    description: "本地拉取与运行大模型（llama、mistral、qwen 等）的 CLI + 服务；隐私与不依赖云厂商推理时常用。",
    homepage: "https://ollama.com",
    repository: "https://github.com/ollama/ollama",
    license: "MIT",
    categories: ["ai"],
    tags: ["llm", "local", "inference", "agent"],
    installMethod: "brew",
    installPackage: "ollama",
    binaryName: "ollama",
    runExample: "ollama run qwen2.5:7b",
    verified: false,
    agentHints: {
      when_to_use: "需要在离线或本机运行小模型、为 Agent 提供本地 HTTP API 时使用。",
      example_usage: ["ollama pull llama3.2", "ollama run mistral", "curl localhost:11434/api/generate"],
    },
  },
  {
    slug: "ruff",
    name: "Ruff",
    description: "用 Rust 编写的极速 Python linter + formatter（flake8/isort/black 等多合一）。Agent 改 Python 时代码质量检查标配。",
    homepage: "https://docs.astral.sh/ruff",
    repository: "https://github.com/astral-sh/ruff",
    license: "MIT",
    categories: ["dev"],
    tags: ["python", "lint", "format", "agent", "fast"],
    installMethod: "brew",
    installPackage: "ruff",
    binaryName: "ruff",
    runExample: "ruff check . && ruff format .",
    verified: false,
    agentHints: {
      when_to_use: "对 Python 项目做静态检查、自动排序 import、格式化时应优先于多工具链拼装。",
      example_usage: ["ruff check . --fix", "ruff format src/"],
    },
  },
  {
    slug: "jq",
    name: "jq",
    description:
      "命令行 JSON 处理器；过滤、映射、聚合 API 输出与结构化日志。Agent 常与 curl、gh 管道组合处理接口返回。",
    homepage: "https://jqlang.github.io/jq",
    repository: "https://github.com/jqlang/jq",
    license: "MIT",
    categories: ["dev"],
    tags: ["json", "agent", "pipeline", "shell"],
    installMethod: "brew",
    installPackage: "jq",
    binaryName: "jq",
    runExample: 'curl -s https://api.github.com/repos/cli/cli | jq ".stargazers_count"',
    verified: false,
    agentHints: {
      when_to_use: "需要解析、筛选或重组 JSON（HTTP API、日志、配置片段）时使用。",
      example_usage: ['echo \'{"a":1}\' | jq .a', 'jq -r ".items[].full_name" out.json'],
      docs_urls: ["https://jqlang.github.io/jq/manual/"],
    },
  },
  {
    slug: "git",
    name: "Git",
    description:
      "分布式版本控制事实标准；分支、提交、diff、rebase、bisect 等是 Agent 在代码库内操作的基础能力。",
    homepage: "https://git-scm.com",
    repository: "https://github.com/git/git",
    license: "GPL-2.0",
    categories: ["dev"],
    tags: ["vcs", "agent", "diff", "branch"],
    installMethod: "brew",
    installPackage: "git",
    binaryName: "git",
    runExample: "git status && git log -1 --oneline",
    verified: false,
    agentHints: {
      when_to_use: "需要查看历史、暂存/提交更改、切换分支、变基或比对差异时使用。",
      example_usage: ["git diff --stat", "git checkout -b feat/x", "git rebase -i HEAD~3"],
      docs_urls: ["https://git-scm.com/doc"],
    },
  },
  {
    slug: "ffmpeg",
    name: "FFmpeg",
    description: "音视频转码、裁剪、拼接事实标准 CLI；Agent 处理媒体管道、生成缩略图时常用。",
    homepage: "https://ffmpeg.org",
    repository: "https://github.com/ffmpeg/ffmpeg",
    license: "GPL / LGPL",
    categories: ["video", "music"],
    tags: ["video", "audio", "transcode", "agent"],
    installMethod: "brew",
    installPackage: "ffmpeg",
    binaryName: "ffmpeg",
    runExample: "ffmpeg -i input.mp4 -c copy out.mkv",
    verified: true, // 精选
    agentHints: {
      when_to_use: "任何需要转换容器/编码、抽帧、混音、字幕烧录等媒体操作时。",
      example_usage: ["ffmpeg -i a.wav -codec libmp3lame b.mp3"],
    },
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(
    "__catalog_system_account_" + Math.random().toString(36),
    12,
  );
  // 优先把策展目录导入为 @admin 发布；找不到再回退到系统策展账号 @catalog
  const admin = await prisma.user.findUnique({ where: { handle: DEFAULT_AUTHOR_HANDLE } });
  const user =
    admin ??
    (await prisma.user.upsert({
      where: { email: CATALOG_USER_EMAIL },
      update: {},
      create: {
        email: CATALOG_USER_EMAIL,
        password: passwordHash,
        handle: CATALOG_USER_HANDLE,
        name: "AnyCLI 策展",
        bio: "系统策展账号，条目来自公开仓库与常用 Agent 工具链。",
      },
    }));

  for (const f of FIXTURES) {
    await prisma.cliTool.upsert({
      where: { slug: f.slug },
      create: {
        slug: f.slug,
        name: f.name,
        description: f.description,
        version: f.version ?? null,
        homepage: f.homepage ?? null,
        repository: f.repository,
        license: f.license ?? null,
        categories: JSON.stringify(f.categories),
        tags: JSON.stringify(f.tags),
        installMethod: f.installMethod,
        installPackage: f.installPackage,
        binaryName: f.binaryName,
        runExample: f.runExample ?? null,
        agentHints: f.agentHints ? JSON.stringify(f.agentHints) : null,
        verified: f.verified ?? false,
        published: true,
        authorId: user.id,
      },
      update: {
        name: f.name,
        description: f.description,
        version: f.version ?? null,
        homepage: f.homepage ?? null,
        repository: f.repository,
        license: f.license ?? null,
        categories: JSON.stringify(f.categories),
        tags: JSON.stringify(f.tags),
        installMethod: f.installMethod,
        installPackage: f.installPackage,
        binaryName: f.binaryName,
        runExample: f.runExample ?? null,
        agentHints: f.agentHints ? JSON.stringify(f.agentHints) : null,
        verified: f.verified ?? false,
        published: true,
        authorId: user.id,
      },
    });
  }

  console.log(`Catalog: using @${user.handle} and upserted ${FIXTURES.length} CLI entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
