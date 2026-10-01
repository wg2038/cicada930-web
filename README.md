# Cicada 930 Web (《史记》全本精读与数字人文系统)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy GitHub Pages](https://github.com/wg2038/cicada930-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/wg2038/cicada930-web/actions/workflows/deploy.yml)
[![Sync Upstream Database](https://github.com/wg2038/cicada930-web/actions/workflows/sync-db.yml/badge.svg)](https://github.com/wg2038/cicada930-web/actions/workflows/sync-db.yml)

> 《史记》全本精读与文史知识图谱独立 Web 版。采用纯前端无服务器架构（Serverless SPA），利用 WebAssembly 客户端驱动 24.89MB 完整 SQLite 数据库，实现零后端依赖、毫秒级检索、断网离线畅读。

---

## 🌟 在线体验入口

🔗 **网页端直达**：[https://wg2038.github.io/cicada930-web/](https://wg2038.github.io/cicada930-web/)  
📱 **Android 与语料主工程**：[wg2038/cicada930](https://github.com/wg2038/cicada930)

---

## 🏛️ 系统特性

- **客户端全量 SQLite WASM 运行**：
  无需搭建任何后端服务器。利用 `sql.js` (WebAssembly) 在独立的 **Web Worker** 中多线程运行整座 24.89MB 的典籍数据库，保障主线程 UI 渲染保持 60/120 FPS 丝滑帧率。
- **本地持久化与秒级启动**：
  首次打开通过 Cache API 自动完成本地持久化存储，二次加载零网络流量损耗，断网或离线模式下完全可用。
- **大屏三家注双栏联动**：
  PC 与平板端支持“正文-注疏”双栏对照排版，滚动或点击正文段落时，右侧自适应联动展示裴駰《史记集解》、司马贞《史记索隐》、张守节《史记正义》考释。
- **20,000+ 历史实体知识图谱**：
  自研人物、古地名、西汉官爵、战役、氏族标签高亮体系，悬浮/点击即可调阅历史生平百科、全书出现频次及跨篇章出场轨迹。
- **全卷穿透全文检索**：
  毫秒级穿透 130 篇、1.3 万个古籍段落，支持正文关键词、成语出处与历史实体的联合检索。
- **古典排版美学与护眼主题**：
  内置【宣纸·竹简】（默认古典暖黄）、【月白·素简】（纯净浅色）、【玄青·暗夜】（深色暗黑）三套精调配色，支持字号与行距自定义。
- **专项文史集锦**：
  汇集全书 126 篇《太史公曰》司马迁史论辑录、212 条成语典故出处考、736 场重大战役谱系。

---

## 📊 典籍数据库规格 (opusone.db)

本项目随工程独立内置单文件 SQLite 数据库（`public/opusone.db`，版本规范对齐主仓 `DB_VERSION=13`）：

| 数据维度 | 数量 / 规模 | 说明 |
| :--- | :--- | :--- |
| **卷帙章节 (`chapters`)** | 130 篇 | 十二本纪、十表、八书、三十世家、七十列传 |
| **结构化段落 (`sections`)** | 13,152 段 | 标点精校、段落编号（`pn_index`）、实体标签嵌入 |
| **现代白话译文 (`translation`)** | 全书覆盖 | 逐段现代白话对照与释文 |
| **三家注条目 (`sanjiazhu_notes`)** | 14,595 条 | 裴駰《集解》、司马贞《索隐》、张守节《正义》 |
| **历史实体库 (`entities`)** | 20,141 个 | 人物、地名、官制、战事、氏族等结构化词条 |
| **实体出现索引 (`entity_occurrences`)** | 35,359 处 | 实体与章节、段落的对应关联 |
| **成语典故 (`chengyu`)** | 212 条 | 出自《史记》的成语辞条、原文引证与释义 |
| **古战役谱 (`wars`)** | 736 场 | 春秋战国至楚汉战争各大战役 |
| **太史公曰 (`taishigongyue`)** | 126 篇 | 司马迁全书史论名篇归类汇编 |

---

## 🔬 数据来源与研发声明

1. **数据来源**：
   古籍原文底本与三家注（集解/索隐/正义）数据来源于互联网开源古籍数字化校勘成果。
2. **标注规范与体系**：
   正文段落结构划分、文史实体标注模型、注疏对齐算法及三家注索引关系均为团队自研设计。
3. **AI 深度协同研发**：
   本项目中海量非结构化古籍的文本清洗筛选、注疏句段对准、实体图谱抽取校验，以及大部分 React/TypeScript 纯前端代码架构与交互设计，均由 **Google Gemini 3.8 Flash** 模型深度协同完成。

---

## 🔄 跨仓自动化同步机制 (Data Automation Pipeline)

主工程 [wg2038/cicada930](https://github.com/wg2038/cicada930) 维护数据清洗流水线，当主仓生成新的 `opusone.db` 时：
1. 主仓 CI 触发 `repository_dispatch` 发送更新通知。
2. 本仓库的 `.github/workflows/sync-db.yml` 自动下载最新编译的 `opusone.db` 并比对 SHA-256 校验和。
3. 变更自动提交并触发 GitHub Pages 全自动构建与上线部署，实现零人工介入的数据热更新。

---

## 🛠️ 本地开发与构建

```bash
# 1. 克隆本仓库
git clone https://github.com/wg2038/cicada930-web.git
cd cicada930-web

# 2. 安装依赖
npm install

# 3. 启动本地开发服务 (支持 HMR)
npm run dev

# 4. 构建生产产物
npm run build
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
