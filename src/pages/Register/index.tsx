import { useState } from "react"
import { useRequest } from "ahooks"
import { useNavigate } from "react-router"
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Form, Input } from "antd"

import AuthPageShell from "@/components/auth/AuthPageShell"
import { persistAuthSession } from "@/lib/auth"
import { userRegister } from "@/services/user"
import { useTranslation } from "react-i18next"

/**
 * 渲染注册组件。
 * @returns 返回组件渲染结果。
 */
const Register = () => {
  const { t } = useTranslation("auth")
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
      title={t("register.title")}
      description={t("register.description")}
      footerText={t("register.footerText")}
      footerLinkText={t("register.footerLinkText")}
      footerLinkTo="/login"
      imageAlt={t("register.imageAlt")}
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
          label={t("form.username.label")}
          rules={[
            {
              required: true,
              type: "string",
              min: 2,
              max: 30,
              message: t("form.username.range"),
            },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder={t("form.username.placeholder")}
            autoComplete="username"
            maxLength={30}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
        </Form.Item>

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
            {t("register.button")}
          </Button>
        </Form.Item>
      </Form>
    </AuthPageShell>
  )
}

export default Register
