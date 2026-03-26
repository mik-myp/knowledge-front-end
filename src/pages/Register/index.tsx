import { useState } from "react"
import { useRequest } from "ahooks"
import { useNavigate } from "react-router"
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Form, Input } from "antd"

import AuthPageShell from "@/components/auth/AuthPageShell"
import { persistAuthSession } from "@/lib/auth"
import { userRegister } from "@/services/user"

/**
 * 渲染注册组件。
 * @returns 返回组件渲染结果。
 */
const Register = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const { runAsync, loading } = useRequest(userRegister, {
    manual: true,
    onSuccess: (data) => persistAuthSession(data, navigate),
  })

  return (
    <AuthPageShell
      title="创建新账号"
      description="填写下面的信息，快速创建你的知识库工作台账号。"
      footerText="已经有账号了？"
      footerLinkText="去登录"
      footerLinkTo="/login"
      imageAlt="注册页互动插画"
      password={password}
      showPassword={showPassword}
      isTyping={isTyping}
    >
      <Form
        form={form}
        name="register-form"
        layout="vertical"
        onFinish={runAsync}
        onValuesChange={(changedValues) => {
          if ("password" in changedValues) {
            setPassword(changedValues.password ?? "")
          }
        }}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            {
              required: true,
              type: "string",
              min: 2,
              max: 30,
              message: "请输入用户名，且长度必须在 2 到 30 个字符之间",
            },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
            autoComplete="username"
            maxLength={30}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            {
              required: true,
              type: "email",
              message: "请输入合法邮箱",
            },
            {
              type: "string",
              max: 100,
              message: "邮箱长度不能超过 100 个字符",
            },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder="请输入邮箱"
            autoComplete="email"
            maxLength={100}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            {
              required: true,
              type: "string",
              min: 8,
              max: 32,
              message: "请输入密码，且长度必须在 8 到 32 个字符之间",
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="请输入密码"
            autoComplete="new-password"
            maxLength={32}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            visibilityToggle={{
              visible: showPassword,
              onVisibleChange: (visible) => setShowPassword(visible),
            }}
          />
        </Form.Item>

        <Form.Item className="mt-6 mb-0">
          <Button
            block
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
          >
            注册
          </Button>
        </Form.Item>
      </Form>
    </AuthPageShell>
  )
}

export default Register
