import { useRequest } from "ahooks"
import { useNavigate } from "react-router"

import AuthPageShell from "@/components/auth/AuthPageShell"
import { persistAuthSession } from "@/lib/auth"
import { userRegister } from "@/services/user"
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Form, Input } from "antd"

const Register = () => {
  const navigate = useNavigate()

  const { runAsync, loading } = useRequest(userRegister, {
    manual: true,
    onSuccess: (data) => persistAuthSession(data, navigate),
  })

  return (
    <AuthPageShell
      title="创建新账号"
      description="填写下面的信息，快速创建你的知识前台账号。"
      submitText="注册"
      footerText="已经有账号了？"
      footerLinkText="去登录"
      footerLinkTo="/login"
      imageAlt="注册页插图"
    >
      <Form name="register-form" style={{ maxWidth: 360 }} onFinish={runAsync}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
        </Form.Item>
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
            注册
          </Button>
        </Form.Item>
      </Form>
    </AuthPageShell>
  )
}

export default Register
