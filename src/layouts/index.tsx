import { Outlet } from "react-router"
import { Button, Layout, theme } from "antd"
import { useState } from "react"
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  TranslationOutlined,
} from "@ant-design/icons"

import UserInfo from "./components/UserInfo"
import NavSider from "./components/NavSider"
import { useGlobal } from "@/stores/useGlobal"

const { Header, Content } = Layout

/**
 * 渲染基础Layout组件。
 * @returns 返回组件渲染结果。
 */
const BaseLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const { language, setLanguage } = useGlobal()

  const handleChangeLanguage = () => {
    setLanguage(language === "zh-cn" ? "en" : "zh-cn")
  }

  return (
    <Layout className="h-full">
      <NavSider collapsed={collapsed} />
      <Layout>
        <Header
          style={{ background: colorBgContainer }}
          className="flex items-center justify-between px-4"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-base"
          />
          <div className="flex items-center gap-4">
            <Button
              icon={<TranslationOutlined />}
              type="text"
              onClick={handleChangeLanguage}
            />
            <UserInfo />
          </div>
        </Header>
        <Content
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          className="m-4 min-h-70 p-6"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BaseLayout
