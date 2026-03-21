import { cn } from "@/lib/utils"
import {
  createKnowledge,
  getAllKnowledges,
  updateKnowledgeById,
} from "@/services/knowledge"
import { BookOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons"
import { useRequest } from "ahooks"
import {
  Button,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Skeleton,
  Spin,
  theme,
  type MenuProps,
} from "antd"
import { useMemo, useState, type CSSProperties } from "react"
import { useLocation, useNavigate } from "react-router"

const { Sider } = Layout

type MenuItem = Required<MenuProps>["items"][number]

type CSSVariableStyle = CSSProperties &
  Record<
    | "--ant-menu-active-bar-border-width"
    | "--ant-line-type"
    | "--ant-color-split"
    | "--knowledge-collapsed-inline-start"
    | "--knowledge-collapsed-inline-end",
    string
  >

const items: MenuItem[] = [
  {
    key: "/",
    label: "首页",
    icon: <HomeOutlined />,
  },
  {
    key: "/documents",
    label: "文档",
    icon: <BookOutlined />,
  },
  {
    type: "divider",
  },
]

const collapsedSiderWidth = 80

const actionButtonSize = 32

const NavSider = ({ collapsed }: { collapsed: boolean }) => {
  const { pathname } = useLocation()

  const navigate = useNavigate()

  const {
    token: { colorSplit, lineType, lineWidth },
  } = theme.useToken()
  const [form] = Form.useForm()

  const [mainSelectedKeys, setMainSelectedKeys] = useState<string[]>([pathname])
  const [knowledgeSelectedKeys, setKnowledgeSelectedKeys] = useState<string[]>([
    pathname,
  ])
  const [knowledgeId, setKnowledgeId] = useState<string | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    data,
    refreshAsync: getAllKnowledgesAsync,
    loading: getAllKnowledgesLoading,
  } = useRequest(getAllKnowledges)

  const { runAsync: createKnowledgeAsync, loading: createKnowledgeLoading } =
    useRequest(createKnowledge, { manual: true })

  const {
    runAsync: updateKnowledgeByIdAsync,
    loading: cupdateKnowledgeByIdLoading,
  } = useRequest(updateKnowledgeById, { manual: true })

  const knowledgeItems = useMemo<MenuItem[]>(() => {
    return (data ?? []).map((item) => ({
      key: `/knowledges/${item.id}`,
      label: item.name,
    }))
  }, [data])

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

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="light"
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
          title="知识库"
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
              知识库
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
            className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]"
            theme="light"
            mode="inline"
            items={knowledgeItems}
            selectedKeys={knowledgeSelectedKeys}
            onClick={handleKnowledgeClick}
          />
        </Skeleton>
      </section>
      <Modal
        title={`${knowledgeId ? "编辑" : "新增"}知识库`}
        open={modalOpen}
        onCancel={() => handleModalOpenChange(false)}
        afterClose={handleAfterClose}
        onOk={handleOk}
        confirmLoading={createKnowledgeLoading || cupdateKnowledgeByIdLoading}
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
            label="名称"
            name="name"
            rules={[
              {
                required: true,
                message: "请输入名称",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Sider>
  )
}

export default NavSider
