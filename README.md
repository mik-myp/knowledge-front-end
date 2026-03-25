# knowledge-front-end

`knowledge-front-end` 是知识库项目的前端工作台，负责承接用户的完整操作链路：注册登录、知识库管理、文档上传与浏览、AI 会话创建、知识库问答与来源追踪。

当前项目已经不是模板工程，而是一个可直接联调和交付的业务前端。

## 项目定位

这个前端解决的是“让用户能够把资料整理成知识库，并围绕知识库进行 AI 问答”的问题。页面不是孤立存在的，而是围绕下面这条业务主线组织的：

1. 用户登录系统。
2. 创建知识库。
3. 上传文档到指定知识库。
4. 在文档页查看原始内容与预览效果。
5. 在 AI 页面发起普通会话或知识库会话。
6. 通过流式输出拿到回答，并查看回答引用了哪些文档片段。

## 核心功能

- 用户注册、登录、退出登录、自动续期登录态。
- 首页总览：展示当前用户、知识库数量、文档数量、AI 会话数量和最近动态。
- 知识库管理：新增、编辑、删除知识库，并从侧边栏直接进入知识库详情页。
- 文档管理：支持批量上传、列表查看、批量删除、单个删除、下载原文件。
- 文档详情预览：支持 `Markdown`、`TXT`、`PDF`、`DOCX` 预览。
- AI 会话系统：支持普通会话和绑定知识库的会话。
- AI 流式问答：前端通过 `SSE` 接收增量结果、进度提示和最终答案。
- 来源追踪：AI 回答可展示命中文档片段，并跳转到对应文档详情。

## 技术栈

- 框架：React 19、TypeScript、Vite 7
- UI：Ant Design 6、Ant Design X、Ant Design X Markdown、Ant Design X SDK
- 样式：Tailwind CSS v4、`antd-style`
- 状态与请求：Zustand、ahooks、Axios
- 路由：React Router 7
- 文档预览：`react-pdf`、`mammoth`
- 编译辅助：React Compiler Babel 插件

## 页面与路由

| 路由 | 页面说明 |
| --- | --- |
| `/login` | 登录页，完成邮箱密码登录 |
| `/register` | 注册页，注册后直接进入工作台 |
| `/` | 首页，展示项目总览和最近动态 |
| `/documents` | 文档列表页，支持分页、批量删除、下载 |
| `/documents/:id` | 文档详情页，支持原文预览与下载 |
| `/knowledges/:id` | 单个知识库详情页，展示该知识库下的文档瀑布流 |
| `/ai` | AI 会话页，支持普通会话和知识库问答 |

## 关键实现说明

### 1. 登录态与请求封装

前端请求层集中在 `src/lib/request.ts`：

- Axios 负责常规 JSON 接口请求。
- `authorizedFetch` 负责 `SSE` 和二进制文件下载场景。
- `accessToken`、`refreshToken` 保存在 `localStorage`。
- 当接口返回 `401` 时，会自动调用 `/users/refresh` 刷新令牌。
- 刷新失败时会清理本地登录态并跳回登录页。

这意味着业务页面本身不需要反复写鉴权逻辑，所有模块都复用同一套请求底座。

### 2. 工作台布局

工作台布局由 `src/layouts` 负责：

- 左侧 `NavSider` 负责主菜单和知识库菜单。
- 顶部 `UserInfo` 负责展示当前用户和退出登录。
- 中间 `Content` 承载首页、文档页、知识库页等业务内容。

知识库菜单不是写死的，而是实时从后端拉取数据，因此新增或删除知识库后，导航会立刻同步。

### 3. 文档模块

文档模块覆盖了“上传、浏览、预览、删除、下载”一整套流程：

- `UploadBtn` 负责弹窗上传，上传时必须绑定知识库。
- `Documents` 页面展示全部文档列表，支持分页与批量操作。
- `Knowledges` 页面只看某个知识库下的文档，采用瀑布流展示。
- `DocumentDetail` 页面根据文件类型决定预览方式：
  - `Markdown` / `TXT` 直接展示文本内容。
  - `PDF` 通过 `react-pdf` 分页预览。
  - `DOCX` 通过 `mammoth` 转成 HTML 后展示。

### 4. AI 会话模块

AI 页面是这个项目最有业务价值的部分，核心点在于“既要像聊天应用一样顺滑，又要和知识库检索结果联动”。

当前实现包含这些关键设计：

- 使用 `@ant-design/x-sdk` 管理会话列表和消息状态。
- 新建会话时先在前端创建“草稿会话”，首条消息真正发出后再让后端创建正式会话。
- 支持普通会话，也支持带 `knowledgeBaseId` 的知识库会话。
- 使用 `SSE` 接收后端流式输出，前端会把每个流片段转成聊天消息。
- 当后端返回命中文档来源时，前端会在消息下方渲染来源列表。
- 当知识库会话首次发问时，前端会展示“正在生成向量”“正在执行检索”“正在整理结果”这类阶段性进度。

### 5. 首页总览

首页不是静态欢迎页，而是当前用户的工作台概览：

- 拉取当前用户资料。
- 拉取全部知识库。
- 拉取最近文档。
- 拉取最近会话。
- 汇总成统计卡片、最近动态和下一步引导。

这样用户一进入系统，就能知道自己当前的内容建设进度。

## 目录结构

```text
src
├─ components
│  └─ auth                登录注册视觉组件
├─ layouts                工作台整体布局
├─ lib                    请求封装、鉴权、主题、工具方法
├─ pages
│  ├─ Home                首页总览
│  ├─ Documents           文档列表与详情
│  ├─ Knowledges          单个知识库详情
│  ├─ AIChat              AI 会话页
│  ├─ Login               登录页
│  └─ Register            注册页
├─ routers                路由配置
├─ services               接口调用层
├─ stores                 轻量状态管理
└─ types                  前端业务类型定义
```

## 本地开发

### 安装依赖

```bash
pnpm install
```

### 启动前端开发服务器

```bash
pnpm dev
```

### 其他常用命令

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm preview
```

## 联调说明

### 开发环境

Vite 已经配置了代理：

- 前端访问 `/api/*`
- 自动代理到 `http://localhost:3000`

因此本地联调时需要先启动后端项目 `knowledge-base-api`。

### 生产环境

生产环境接口基地址写在 `src/lib/request.ts` 中，目前通过 `getRequestBaseURL()` 返回固定地址。如果部署地址变化，需要同步修改这里。

## 与后端接口的对应关系

- 用户相关：`/users/register`、`/users/login`、`/users/refresh`、`/users/logout`、`/users/me`
- 知识库相关：`/knowledge-bases`
- 文档相关：`/documents`、`/documents/upload`、`/documents/:id/download`
- AI 会话相关：`/chat/sessions`、`/chat/messages`、`/chat/ask`

## 当前实现特点

- 前端已经完整覆盖“上传文档 + 浏览文档 + AI 问答”的主业务链路。
- AI 页面做了草稿会话和流式状态管理，用户体验比简单表单提交更接近真实聊天产品。
- 后端已经提供“编辑器文档”接口，但当前前端主流程仍以文件上传为主，这也是后续可以继续扩展的方向。
