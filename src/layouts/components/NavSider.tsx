import { cn } from "@/lib/utils"
import useDocumentsVersion from "@/stores/useDocumentsVersion"
import {
  createKnowledge,
  deleteKnowledgeById,
  getAllKnowledges,
  updateKnowledgeById,
} from "@/services/knowledge"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  HomeOutlined,
  PlusOutlined,
  RobotOutlined,
} from "@ant-design/icons"
import { useRequest, useUpdateEffect } from "ahooks"
import {
  App,
  Button,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Skeleton,
  theme,
  type MenuProps,
} from "antd"
import { useCallback, useMemo, useState, type CSSProperties } from "react"
import { useLocation, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

const { Sider } = Layout

/**
 * 表示侧边栏菜单项的类型。
 */
type MenuItem = Required<MenuProps>["items"][number]

/**
 * 描述侧边栏使用的 CSS 变量样式对象。
 */
type CSSVariableStyle = CSSProperties &
  Record<
    | "--ant-menu-active-bar-border-width"
    | "--ant-line-type"
    | "--ant-color-split"
    | "--knowledge-collapsed-inline-start"
    | "--knowledge-collapsed-inline-end",
    string
  >

/**
 * 侧边栏折叠时的固定宽度。
 */
const collapsedSiderWidth = 80

/**
 * 侧边栏操作按钮的统一尺寸。
 */
const actionButtonSize = 32

/**
 * 渲染NavSider组件。
 * @param props 组件属性。
 * @param props.collapsed collapsed。
 * @returns 返回组件渲染结果。
 */
const NavSider = ({ collapsed }: { collapsed: boolean }) => {
  const { pathname } = useLocation()

  const navigate = useNavigate()

  const { t } = useTranslation(["common", "layout", "knowledge"])

  const {
    token: { colorSplit, lineType, lineWidth },
  } = theme.useToken()
  const [form] = Form.useForm()
  const { modal } = App.useApp()

  const [mainSelectedKeys, setMainSelectedKeys] = useState<string[]>([pathname])
  const [knowledgeSelectedKeys, setKnowledgeSelectedKeys] = useState<string[]>([
    pathname,
  ])
  const [knowledgeId, setKnowledgeId] = useState<string | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const { invalidate } = useDocumentsVersion()

  const {
    data,
    refreshAsync: getAllKnowledgesAsync,
    loading: getAllKnowledgesLoading,
  } = useRequest(getAllKnowledges)

  const { runAsync: createKnowledgeAsync, loading: createKnowledgeLoading } =
    useRequest(createKnowledge, { manual: true })

  const {
    runAsync: updateKnowledgeByIdAsync,
    loading: updateKnowledgeByIdLoading,
  } = useRequest(updateKnowledgeById, { manual: true, onSuccess: invalidate })

  const { runAsync: deleteKnowledgeByIdAsync } = useRequest(
    deleteKnowledgeById,
    { manual: true }
  )

  /**
   * 侧边栏主导航菜单项。
   */
  const items: MenuItem[] = [
    {
      key: "/",
      label: t("labels.home"),
      icon: <HomeOutlined />,
    },
    {
      key: "/documents",
      label: t("nav.documents", { ns: "layout" }),
      icon: <BookOutlined />,
    },
    {
      key: "/ai",
      label: t("nav.aiChat", { ns: "layout" }),
      icon: <RobotOutlined />,
    },
    {
      key: "/ai/write",
      label: t("nav.aiWrite", { ns: "layout" }),
      icon: <EditOutlined />,
    },
    {
      type: "divider",
    },
  ]

  const handleDelete = useCallback(
    async (knowledgeId: string) => {
      await deleteKnowledgeByIdAsync({
        id: knowledgeId,
      })
      if (pathname.includes(knowledgeId)) {
        navigate("/")
      }
      await getAllKnowledgesAsync()
      invalidate()
    },
    [
      deleteKnowledgeByIdAsync,
      getAllKnowledgesAsync,
      invalidate,
      pathname,
      navigate,
    ]
  )

  const handleEllipsisClick = useCallback(
    (
      {
        key,
        domEvent,
      }: Pick<
        Parameters<NonNullable<MenuProps["onClick"]>>[0],
        "key" | "domEvent"
      >,
      item: TKnowledgeBaseRecord
    ) => {
      domEvent.stopPropagation()
      if (key === "edit") {
        setModalOpen(true)
        setKnowledgeId(item.id)
        form.setFieldsValue({
          name: item.name,
          description: item.description,
        })
      } else if (key === "delete") {
        modal.confirm({
          title: t("sidebar.delete.title", { ns: "knowledge" }),
          content: t("sidebar.delete.content", { ns: "knowledge" }),
          okText: t("actions.delete"),
          onOk: async () => await handleDelete(item.id),
        })
      }
    },
    [form, modal, handleDelete]
  )

  const knowledgeItems = useMemo<MenuItem[]>(() => {
    return (data ?? []).map((item) => ({
      key: `/knowledges/${item.id}`,
      label: collapsed ? (
        item.name
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 overflow-hidden text-ellipsis">
            {item.name}
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: t("sidebar.menu.edit", { ns: "knowledge" }),
                  icon: <EditOutlined />,
                },
                {
                  key: "delete",
                  label: t("sidebar.menu.delete", { ns: "knowledge" }),
                  icon: <DeleteOutlined />,
                  danger: true,
                },
              ],
              onClick: ({ key, domEvent }) =>
                handleEllipsisClick({ key, domEvent }, item),
            }}
            trigger={["click"]}
          >
            <EllipsisOutlined
              className="text-base text-black"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
      title: item.name,
    }))
  }, [data, handleEllipsisClick, collapsed])

  const handleMainClick: NonNullable<MenuProps["onClick"]> = ({ key }) => {
    navigate(key)
    setMainSelectedKeys([key])
    setKnowledgeSelectedKeys([])
  }

  const handleKnowledgeClick: NonNullable<MenuProps["onClick"]> = ({ key }) => {
    navigate(key)
    setKnowledgeSelectedKeys([key])
    setMainSelectedKeys([])
  }

  const collapsedInlineStart = Math.ceil(
    (collapsedSiderWidth - lineWidth - actionButtonSize) / 2
  )
  const collapsedInlineEnd =
    collapsedSiderWidth - lineWidth - actionButtonSize - collapsedInlineStart

  const knowledgeSectionStyle: CSSVariableStyle = {
    "--ant-menu-active-bar-border-width": `${lineWidth}px`,
    "--ant-line-type": lineType,
    "--ant-color-split": colorSplit,
    "--knowledge-collapsed-inline-start": `${collapsedInlineStart}px`,
    "--knowledge-collapsed-inline-end": `${collapsedInlineEnd}px`,
  }

  const handleModalOpenChange = (open: boolean, knowledgeId?: string) => {
    setModalOpen(open)
    if (knowledgeId) {
      setKnowledgeId(knowledgeId)
    }
  }

  const handleAfterClose = () => {
    form.resetFields()
    setKnowledgeId(undefined)
  }

  const handleOk = async () => {
    const validate = await form.validateFields()
    if (validate) {
      try {
        if (knowledgeId) {
          await updateKnowledgeByIdAsync({ ...validate, id: knowledgeId })
        } else {
          await createKnowledgeAsync({ ...validate })
        }
        handleModalOpenChange(false)
        await getAllKnowledgesAsync()
      } catch {
        /* empty */
      }
    }
  }

  useUpdateEffect(() => {
    setMainSelectedKeys([pathname])
    setKnowledgeSelectedKeys([pathname])
  }, [pathname])

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="light"
      width={240}
      className="[&_.ant-layout-sider-children]:flex [&_.ant-layout-sider-children]:min-h-0 [&_.ant-layout-sider-children]:flex-col"
    >
      <Menu
        theme="light"
        mode="inline"
        items={items}
        onClick={handleMainClick}
        selectedKeys={mainSelectedKeys}
      />

      <section
        className="flex min-h-0 flex-1 flex-col"
        style={knowledgeSectionStyle}
      >
        <div
          className={cn(
            "shrink-0 bg-white",
            "[border-inline-end-width:var(--ant-menu-active-bar-border-width)]",
            "[border-inline-end-style:var(--ant-line-type)]",
            "border-e-(--ant-color-split)"
          )}
          title={t("sidebar.sectionTitle", { ns: "knowledge" })}
        >
          <div
            className={cn(
              "flex min-w-0 items-center overflow-hidden pt-3 pb-2 transition-[padding] duration-200 ease-out",
              collapsed
                ? "w-full justify-start ps-(--knowledge-collapsed-inline-start) pe-(--knowledge-collapsed-inline-end)"
                : "w-full pr-2 pl-4"
            )}
          >
            <div
              className={cn(
                "min-w-0 overflow-hidden text-sm leading-5.5 whitespace-nowrap text-black/45 transition-[max-width,opacity,transform] duration-200 ease-out",
                collapsed
                  ? "max-w-0 -translate-x-2 opacity-0"
                  : "max-w-24 translate-x-0 opacity-100"
              )}
            >
              {t("sidebar.sectionTitle", { ns: "knowledge" })}
            </div>
            <Button
              type="text"
              icon={<PlusOutlined />}
              className={cn(
                "size-8 min-w-8 shrink-0 p-0 text-base transition-transform duration-200 ease-out",
                collapsed ? "ml-0" : "ml-auto"
              )}
              onClick={() => handleModalOpenChange(true)}
            />
          </div>
        </div>

        <Skeleton
          active
          loading={getAllKnowledgesLoading}
          className={cn(
            "h-full",
            "[border-inline-end-width:var(--ant-menu-active-bar-border-width)]",
            "[border-inline-end-style:var(--ant-line-type)]",
            "border-e-(--ant-color-split)"
          )}
        >
          <Menu
            className="scrollbar-thin min-h-0 flex-1 overflow-y-auto"
            theme="light"
            mode="inline"
            items={knowledgeItems}
            selectedKeys={knowledgeSelectedKeys}
            onClick={handleKnowledgeClick}
          />
        </Skeleton>
      </section>
      <Modal
        title={t(
          knowledgeId
            ? "sidebar.modal.editTitle"
            : "sidebar.modal.createTitle",
          { ns: "knowledge" }
        )}
        open={modalOpen}
        onCancel={() => handleModalOpenChange(false)}
        afterClose={handleAfterClose}
        onOk={handleOk}
        confirmLoading={createKnowledgeLoading || updateKnowledgeByIdLoading}
        centered
        width={600}
      >
        <Form
          form={form}
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 18,
          }}
          className="mt-6"
        >
          <Form.Item
            label={t("sidebar.form.name.label", { ns: "knowledge" })}
            name="name"
            rules={[
              {
                required: true,
                min: 1,
                max: 100,
                type: "string",
                message: t("sidebar.form.name.range", { ns: "knowledge" }),
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={t("sidebar.form.description.label", { ns: "knowledge" })}
            name="description"
            rules={[
              {
                type: "string",
                max: 500,
                message: t("sidebar.form.description.max", {
                  ns: "knowledge",
                }),
              },
            ]}
          >
            <Input.TextArea maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </Sider>
  )
}

export default NavSider
