import { useRequest } from "ahooks"
import { useNavigate } from "react-router"

import AuthPageShell from "@/components/auth/AuthPageShell"
import { persistAuthSession } from "@/lib/auth"
import { userLogin } from "@/services/user"
import { Button, Form, Input } from "antd"
import { LockOutlined, MailOutlined } from "@ant-design/icons"

const Login = () => {
  const navigate = useNavigate()

  const { runAsync, loading } = useRequest(userLogin, {
    manual: true,
    onSuccess: (data) => persistAuthSession(data, navigate),
  })

  return (
    <AuthPageShell
      title="登录你的账号"
      description="请输入邮箱和密码，继续访问知识前台。"
      submitText="登录"
      footerText="还没有账号？"
      footerLinkText="立即注册"
      footerLinkTo="/register"
      imageAlt="登录页插图"
    >
      <Form
        name="login-form"
        initialValues={{ remember: true }}
        style={{ maxWidth: 360 }}
        onFinish={runAsync}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: "请输入邮箱" }]}
        >
          <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </AuthPageShell>
  )
}

export default Login
