import { useState } from "react"
import { useRequest } from "ahooks"
import { useNavigate } from "react-router"
import { LockOutlined, MailOutlined } from "@ant-design/icons"
import { Button, Form, Input } from "antd"

import AuthPageShell from "@/components/auth/AuthPageShell"
import { API_CONSTRAINTS } from "@/contracts/api-contracts"
import { persistAuthSession } from "@/lib/auth"
import {
  FORM_LIMITS,
  createEmailRule,
  createRequiredStringRule,
} from "@/lib/formRules"
import { userLogin } from "@/services/user"

/**
 * 渲染登录组件。
 * @returns 返回组件渲染结果。
 */
const Login = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const { runAsync, loading } = useRequest(userLogin, {
    manual: true,
    onSuccess: (data) => persistAuthSession(data, navigate),
  })

  return (
    <AuthPageShell
      title="登录你的账号"
      description="输入邮箱和密码，继续访问知识库工作台。"
      footerText="还没有账号？"
      footerLinkText="立即注册"
      footerLinkTo="/register"
      imageAlt="登录页互动插画"
      password={password}
      showPassword={showPassword}
      isTyping={isTyping}
    >
      <Form
        form={form}
        name="login-form"
        layout="vertical"
        onFinish={runAsync}
        onValuesChange={(changedValues) => {
          if ("password" in changedValues) {
            setPassword(changedValues.password ?? "")
          }
        }}
      >
        <Form.Item
          name="email"
          label="邮箱"
          rules={[createEmailRule("请输入邮箱")]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder="请输入邮箱"
            autoComplete="email"
            maxLength={FORM_LIMITS.email}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            createRequiredStringRule({
              fieldName: "password",
              minLength: API_CONSTRAINTS.user.passwordMinLength,
              maxLength: API_CONSTRAINTS.user.passwordMaxLength,
              requiredMessage: "请输入密码",
            }),
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="请输入密码"
            autoComplete="current-password"
            maxLength={FORM_LIMITS.password}
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
            登录
          </Button>
        </Form.Item>
      </Form>
    </AuthPageShell>
  )
}

export default Login
