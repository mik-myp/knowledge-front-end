import { useState } from "react"
import { useRequest } from "ahooks"
import { useNavigate } from "react-router"
import { LockOutlined, MailOutlined } from "@ant-design/icons"
import { Button, Form, Input } from "antd"

import AuthPageShell from "@/components/auth/AuthPageShell"
import { persistAuthSession } from "@/lib/auth"
import { userLogin } from "@/services/user"
import { useTranslation } from "react-i18next"

/**
 * 渲染登录组件。
 * @returns 返回组件渲染结果。
 */
const Login = () => {
  const { t } = useTranslation("auth")
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
      title={t("login.title")}
      description={t("login.description")}
      footerText={t("login.footerText")}
      footerLinkText={t("login.footerLinkText")}
      footerLinkTo="/register"
      imageAlt={t("login.imageAlt")}
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
          label={t("form.email.label")}
          rules={[
            {
              required: true,
              type: "email",
              message: t("form.email.invalid"),
            },
            {
              type: "string",
              max: 100,
              message: t("form.email.max"),
            },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            placeholder={t("form.email.placeholder")}
            autoComplete="email"
            maxLength={100}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={t("form.password.label")}
          rules={[
            {
              required: true,
              type: "string",
              min: 8,
              max: 32,
              message: t("form.password.range"),
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder={t("form.password.placeholder")}
            autoComplete="current-password"
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
            {t("login.button")}
          </Button>
        </Form.Item>
      </Form>
    </AuthPageShell>
  )
}

export default Login
