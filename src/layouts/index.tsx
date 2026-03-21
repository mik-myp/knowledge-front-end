import { Outlet } from "react-router"
import { Button, Layout, theme } from "antd"
import { useState } from "react"
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons"

import UserInfo from "./components/UserInfo"
import NavSider from "./components/NavSider"

const { Header, Content } = Layout

const BaseLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

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
          <UserInfo />
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
