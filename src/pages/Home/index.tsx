import { useRequest } from "ahooks"
import { useNavigate } from "react-router"
import dayjs from "dayjs"
import {
  ArrowRightOutlined,
  BookOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ReloadOutlined,
  RobotOutlined,
} from "@ant-design/icons"
import { Button, Empty, Progress, Spin, theme, Typography } from "antd"

import { findAllSession } from "@/services/chat"
import { findAllDocuments } from "@/services/document"
import { getAllKnowledges } from "@/services/knowledge"
import { userMe } from "@/services/user"
import { useStyles } from "@/lib/illustrationTheme"
import { cn } from "@/lib/utils"

const { Paragraph, Text, Title } = Typography

/**
 * 并行加载首页概览所需的数据。
 * @returns 返回首页展示需要的用户、知识库、文档和会话信息。
 */
const loadHomeOverview = async () => {
  const [user, knowledges, documentResult, sessions] = await Promise.all([
    userMe(),
    getAllKnowledges(),
    findAllDocuments({
      page: 1,
      pageSize: 6,
    }),
    findAllSession(),
  ])

  return {
    user,
    knowledges,
    documentResult,
    sessions,
  }
}

/**
 * 格式化首页展示的时间文本。
 * @param value 需要格式化的时间字符串。
 * @returns 返回适合首页展示的时间文案。
 */
const formatDateTime = (value?: string) => {
  if (!value) {
    return "刚刚进入工作台"
  }

  return dayjs(value).format("YYYY-MM-DD HH:mm")
}

/**
 * 获取文档来源类型对应的展示文案。
 * @param sourceType 文档来源类型。
 * @returns 返回前端展示使用的来源名称。
 */
const getSourceTypeLabel = (sourceType: "upload" | "editor") => {
  return sourceType === "upload" ? "上传文档" : "编辑器文档"
}

/**
 * 根据当前时间生成首页问候语。
 * @returns 返回早上、下午或晚上的问候文本。
 */
const getGreeting = () => {
  const hour = dayjs().hour()

  if (hour < 12) {
    return "早上好"
  }

  if (hour < 18) {
    return "下午好"
  }

  return "晚上好"
}

/**
 * 渲染Home组件。
 * @returns 返回组件渲染结果。
 */
const Home = () => {
  const navigate = useNavigate()
  const { styles } = useStyles()
  const {
    token: { colorBorder, colorPrimary, colorTextSecondary },
  } = theme.useToken()

  const { data, loading, refreshAsync } = useRequest(loadHomeOverview)

  const knowledges = data?.knowledges ?? []
  const documents = data?.documentResult.dataList ?? []
  const documentCount = data?.documentResult.total ?? 0
  const sessions = data?.sessions ?? []
  const user = data?.user

  const knowledgeCount = knowledges.length
  const conversationCount = sessions.length
  const completedSteps = [
    knowledgeCount > 0,
    documentCount > 0,
    conversationCount > 0,
  ].filter(Boolean).length
  const readinessPercent = Math.round((completedSteps / 3) * 100)

  const knowledgeNameMap = new Map(
    knowledges.map((item) => [item.id, item.name])
  )

  const recentSessions = sessions.slice(0, 5).map((item) => ({
    ...item,
    knowledgeName: item.knowledgeBaseId
      ? (knowledgeNameMap.get(item.knowledgeBaseId) ?? "知识库会话")
      : "普通会话",
  }))

  const statCards = [
    {
      key: "knowledge",
      label: "知识库",
      value: knowledgeCount,
      caption: "用于组织主题、文档和问答范围。",
      icon: <DatabaseOutlined />,
      background: "#FFF2E8",
    },
    {
      key: "document",
      label: "文档总量",
      value: documentCount,
      caption: "首页展示最近 6 份，其余文档可在文档页继续管理。",
      icon: <FileTextOutlined />,
      background: "#E6F4FF",
    },
    {
      key: "conversation",
      label: "AI 会话",
      value: conversationCount,
      caption: "包含普通会话和绑定知识库的问答记录。",
      icon: <RobotOutlined />,
      background: "#F6FFED",
    },
    {
      key: "readiness",
      label: "工作台进度",
      value: `${readinessPercent}%`,
      caption: `已完成 ${completedSteps} / 3 个关键准备动作。`,
      icon: <BookOutlined />,
      background: "#FFFBE6",
    },
  ]

  const summaryTitle =
    completedSteps === 0
      ? "从知识库、文档和会话这三步开始，把工作台真正跑起来。"
      : completedSteps === 1
        ? "基础骨架已经有了，继续补齐文档或会话，首页就会更有内容。"
        : completedSteps === 2
          ? "离完整工作流只差一步，现在最适合开始沉淀问答记录。"
          : "工作台已经成型，可以继续扩充知识库或回到 AI 对话里深入提问。"

  return (
    <Spin spinning={loading}>
      <div className="scrollbar-none h-[calc(100vh-176px)] overflow-y-auto pr-1">
        <div className="flex flex-col gap-5 pb-2">
          <section
            className={cn(
              styles.illustrationBox,
              "relative overflow-hidden rounded-4xl p-8"
            )}
            style={{
              background:
                "linear-gradient(135deg, #FFF8D8 0%, #FFE7D6 46%, #DDF2FF 100%)",
            }}
          >
            <div className="pointer-events-none absolute -top-13 -right-6.5 h-40 w-40 rounded-full bg-white/55 blur-2xl" />
            <div className="pointer-events-none absolute right-10 bottom-6 h-28 w-28 rounded-4xl border-2 border-black/10 bg-white/25" />
            <div className="pointer-events-none absolute top-6 right-28 h-10 w-10 rounded-full bg-black/6" />

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
              <div className="relative z-1">
                <Title
                  level={1}
                  className="mb-3 max-w-4xl text-[40px]! leading-[1.08]!"
                >
                  {getGreeting()}
                  {user ? `，${user.username}` : ""}。
                  <br />
                  知识库工作台已经准备好继续推进。
                </Title>

                <Paragraph className="mb-0 max-w-3xl text-base leading-8 text-black/70">
                  {summaryTitle}
                </Paragraph>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    type="primary"
                    size="large"
                    icon={<RobotOutlined />}
                    onClick={() => navigate("/ai")}
                  >
                    进入 AI 对话
                  </Button>
                  <Button
                    size="large"
                    icon={<FileTextOutlined />}
                    onClick={() => navigate("/documents")}
                  >
                    查看文档
                  </Button>
                  <Button
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={() => void refreshAsync()}
                  >
                    刷新首页
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  styles.illustrationBox,
                  "relative z-1 rounded-[28px] bg-white/78 p-6 backdrop-blur-sm"
                )}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium tracking-[0.18em] text-black/45 uppercase">
                      工作流进度
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-black">
                      {readinessPercent}%
                    </div>
                  </div>
                  <div className="w-22">
                    <Progress
                      type="circle"
                      percent={readinessPercent}
                      strokeColor={colorPrimary}
                      size={88}
                      format={() => `${completedSteps}/3`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    {
                      key: "knowledge",
                      done: knowledgeCount > 0,
                      title: "建立知识库",
                      detail:
                        knowledgeCount > 0
                          ? `当前已有 ${knowledgeCount} 个知识库`
                          : "先创建一个主题入口，后续文档和问答都围绕它展开",
                    },
                    {
                      key: "document",
                      done: documentCount > 0,
                      title: "导入文档",
                      detail:
                        documentCount > 0
                          ? `当前已收录 ${documentCount} 份文档`
                          : "上传 PDF、Markdown 或文本，让知识库真正有内容可检索",
                    },
                    {
                      key: "conversation",
                      done: conversationCount > 0,
                      title: "开始问答",
                      detail:
                        conversationCount > 0
                          ? `当前已有 ${conversationCount} 个问答会话`
                          : "发起第一轮问答，让文档内容进入实际使用阶段",
                    },
                  ].map((step, index) => (
                    <div
                      key={step.key}
                      className="rounded-[22px] border border-black/10 bg-white/70 px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
                          style={{
                            background: step.done ? "#2C2C2C" : "transparent",
                            color: step.done ? "#ffffff" : colorTextSecondary,
                            borderColor: colorBorder,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <Text strong>{step.title}</Text>
                            <Text type={step.done ? undefined : "secondary"}>
                              {step.done ? "已完成" : "待完成"}
                            </Text>
                          </div>
                          <div className="mt-1 text-sm leading-6 text-black/55">
                            {step.detail}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.key}
                className={cn(
                  styles.illustrationBox,
                  "rounded-[26px] p-5 transition-transform duration-200 hover:-translate-y-1"
                )}
                style={{
                  background: card.background,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-medium tracking-[0.18em] text-black/45 uppercase">
                      {card.label}
                    </div>
                    <div className="mt-4 text-4xl leading-none font-semibold text-black">
                      {card.value}
                    </div>
                    <div className="mt-3 text-sm leading-6 text-black/60">
                      {card.caption}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white/80 text-lg text-black">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.3fr_0.95fr]">
            <div
              className={cn(
                styles.illustrationBox,
                "rounded-[28px] bg-white p-6"
              )}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-medium tracking-[0.18em] text-black/45 uppercase">
                    最近文档
                  </div>
                  <Title level={3} className="mt-2 mb-0!">
                    最近导入的知识内容
                  </Title>
                </div>
                <Button onClick={() => navigate("/documents")}>查看全部</Button>
              </div>

              {documents.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="还没有文档，先上传一份试试。"
                />
              ) : (
                <div className="grid gap-3">
                  {documents.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(`/documents/${item.id}`)}
                      className="w-full rounded-[22px] border border-black/10 bg-[#FFFDF8] px-5 py-4 text-left transition-colors duration-150 hover:bg-[#FFF6EA]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white uppercase">
                              {item.extension}
                            </span>
                            <span className="rounded-full bg-black/6 px-3 py-1 text-xs text-black/60">
                              {getSourceTypeLabel(item.sourceType)}
                            </span>
                            <span className="rounded-full bg-black/6 px-3 py-1 text-xs text-black/60">
                              {item.knowledgeBaseName}
                            </span>
                          </div>

                          <div className="truncate text-base font-semibold text-black">
                            {item.originalName}
                          </div>

                          <div className="mt-2 text-sm text-black/55">
                            收录时间 {formatDateTime(item.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-black/45">
                          查看详情
                          <ArrowRightOutlined />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div
                className={cn(
                  styles.illustrationBox,
                  "rounded-[28px] bg-[#F8FBFF] p-6"
                )}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium tracking-[0.18em] text-black/45 uppercase">
                      最近会话
                    </div>
                    <Title level={3} className="mt-2 mb-0!">
                      AI 对话轨迹
                    </Title>
                  </div>
                  <Button onClick={() => navigate("/ai")}>进入对话</Button>
                </div>

                {recentSessions.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="还没有问答记录，去开始第一轮对话。"
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentSessions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate("/ai")}
                        className="w-full rounded-[20px] border border-black/10 bg-white px-4 py-4 text-left transition-colors duration-150 hover:bg-[#F2F8FF]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-black">
                              {item.title}
                            </div>
                            <div className="mt-1 text-sm text-black/55">
                              {item.knowledgeName}
                            </div>
                          </div>
                          <div className="text-xs text-black/40">
                            {dayjs(item.updatedAt).format("MM-DD HH:mm")}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={cn(
                  styles.illustrationBox,
                  "rounded-[28px] bg-[#FFF9F3] p-6"
                )}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium tracking-[0.18em] text-black/45 uppercase">
                      知识库清单
                    </div>
                    <Title level={3} className="mt-2 mb-0!">
                      当前内容骨架
                    </Title>
                  </div>
                  <Button
                    onClick={() =>
                      navigate(
                        knowledges[0]
                          ? `/knowledges/${knowledges[0].id}`
                          : "/documents"
                      )
                    }
                  >
                    继续完善
                  </Button>
                </div>

                {knowledges.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="还没有知识库，先建立主题容器。"
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {knowledges.slice(0, 4).map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(`/knowledges/${item.id}`)}
                        className="w-full rounded-[20px] border border-black/10 bg-white px-4 py-4 text-left transition-colors duration-150 hover:bg-[#FFF3E5]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-black">
                              {item.name}
                            </div>
                            <div className="mt-1 line-clamp-2 text-sm leading-6 text-black/55">
                              {item.description?.trim() ||
                                "还没有描述，建议补充这个知识库要解决的问题。"}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Spin>
  )
}

export default Home
