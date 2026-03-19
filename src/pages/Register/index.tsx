import { useForm } from "@tanstack/react-form"
import { useRequest } from "ahooks"
import { useNavigate } from "react-router"
import * as z from "zod"

import AuthInputField from "@/components/auth/auth-input-field"
import AuthPageShell from "@/components/auth/auth-page-shell"
import {
  emailSchema,
  passwordSchema,
  persistAuthSession,
  usernameSchema,
} from "@/lib/auth"
import { userRegister } from "@/services/user"

const formSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
})

const Register = () => {
  const navigate = useNavigate()

  const { runAsync, loading } = useRequest(userRegister, {
    manual: true,
    onSuccess: (data) => persistAuthSession(data, navigate),
  })

  const form = useForm({
    defaultValues: { username: "", email: "", password: "" },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => await runAsync(value),
  })

  return (
    <AuthPageShell
      title="创建新账号"
      description="填写下面的信息，快速创建你的知识前台账号。"
      formId="register-form"
      submitText="注册"
      footerText="已经有账号了？"
      footerLinkText="去登录"
      footerLinkTo="/login"
      imageAlt="注册页插图"
      loading={loading}
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field name="username">
        {(field) => (
          <AuthInputField
            field={field}
            label="用户名"
            placeholder="请输入用户名"
          />
        )}
      </form.Field>
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

export default Register
