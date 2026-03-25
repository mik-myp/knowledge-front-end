import type { Rule } from "antd/es/form"
import {
  API_CONSTRAINTS,
  ensureEmail,
  ensureOptionalTrimmedString,
  ensureTrimmedString,
} from "@/contracts/api-contracts"

/**
 * 创建RequiredStringRule。
 * @param options 配置项。
 * @param options.fieldName 字段名称。
 * @param options.minLength minLength。
 * @param options.maxLength maxLength。
 * @param options.requiredMessage 必填提示文案。
 * @returns 返回Rule。
 */
export const createRequiredStringRule = (options: {
  fieldName: string
  minLength?: number
  maxLength?: number
  requiredMessage: string
}): Rule => {
  return {
    validator: async (_, value: unknown) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        throw new Error(options.requiredMessage)
      }

      ensureTrimmedString(value, {
        fieldName: options.fieldName,
        minLength: options.minLength,
        maxLength: options.maxLength,
      })
    },
  }
}

/**
 * 创建OptionalStringRule。
 * @param options 配置项。
 * @param options.fieldName 字段名称。
 * @param options.maxLength maxLength。
 * @returns 返回Rule。
 */
export const createOptionalStringRule = (options: {
  fieldName: string
  maxLength?: number
}): Rule => {
  return {
    validator: async (_, value: unknown) => {
      ensureOptionalTrimmedString(value, {
        fieldName: options.fieldName,
        maxLength: options.maxLength,
      })
    },
  }
}

/**
 * 创建邮箱Rule。
 * @param requiredMessage 必填提示文案。
 * @returns 返回Rule。
 */
export const createEmailRule = (requiredMessage: string): Rule => {
  return {
    validator: async (_, value: unknown) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        throw new Error(requiredMessage)
      }

      ensureEmail(value, "email")
    },
  }
}

/**
 * 汇总表单输入框可直接复用的长度上限。
 */
export const FORM_LIMITS = {
  username: API_CONSTRAINTS.user.usernameMaxLength,
  email: API_CONSTRAINTS.user.emailMaxLength,
  password: API_CONSTRAINTS.user.passwordMaxLength,
  knowledgeBaseName: API_CONSTRAINTS.knowledgeBase.nameMaxLength,
  knowledgeBaseDescription: API_CONSTRAINTS.knowledgeBase.descriptionMaxLength,
  chatSessionTitle: API_CONSTRAINTS.chat.sessionTitleMaxLength,
} as const
