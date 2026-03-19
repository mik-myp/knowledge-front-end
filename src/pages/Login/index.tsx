import { useForm } from "@tanstack/react-form"
import { useRequest } from "ahooks"
import { useNavigate } from "react-router"
import * as z from "zod"

import AuthInputField from "@/components/auth/auth-input-field"
import AuthPageShell from "@/components/auth/auth-page-shell"
import { emailSchema, passwordSchema, persistAuthSession } from "@/lib/auth"
import { userLogin } from "@/services/user"

const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

const Login = () => {
  const navigate = useNavigate()

  const { runAsync, loading } = useRequest(userLogin, {
    manual: true,
    onSuccess: (data) => persistAuthSession(data, navigate),
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => await runAsync(value),
  })

  return (
    <AuthPageShell
      title="登录你的账号"
      description="请输入邮箱和密码，继续访问知识前台。"
      formId="login-form"
      submitText="登录"
      footerText="还没有账号？"
      footerLinkText="立即注册"
      footerLinkTo="/register"
      imageAlt="登录页插图"
      loading={loading}
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field name="email">
        {(field) => (
          <AuthInputField field={field} label="邮箱" placeholder="请输入邮箱" />
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <AuthInputField
            field={field}
            type="password"
            label="密码"
            placeholder="请输入密码"
          />
        )}
      </form.Field>
    </AuthPageShell>
  )
}

export default Login
