/**
 * 汇总前端参数校验和分页使用的约束配置。
 */
export const API_CONSTRAINTS = {
  objectIdPattern: /^[a-f\d]{24}$/i,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
  knowledgeBase: {
    nameMinLength: 1,
    nameMaxLength: 100,
    descriptionMaxLength: 500,
    pageMin: 1,
    pageSizeMin: 1,
    pageSizeMax: 50,
  },
  user: {
    emailMaxLength: 100,
    passwordMinLength: 8,
    passwordMaxLength: 32,
    usernameMinLength: 2,
    usernameMaxLength: 30,
    refreshTokenMaxLength: 2000,
  },
  document: {
    pageDefault: 1,
    pageMin: 1,
    pageSizeDefault: 10,
    pageSizeMin: 1,
    pageSizeMax: 50,
    nameMinLength: 1,
    nameMaxLength: 200,
    contentMinLength: 1,
  },
  chat: {
    sessionTitleMinLength: 1,
    sessionTitleMaxLength: 50,
    askTopKMin: 1,
    askTopKMax: 10,
  },
} as const

/**
 * 定义对话请求消息ROLES常量。
 */
export const CHAT_REQUEST_MESSAGE_ROLES = ["system", "human", "tool"] as const

/**
 * 定义对话请求消息Role的类型结构。
 */
export type ChatRequestMessageRole = (typeof CHAT_REQUEST_MESSAGE_ROLES)[number]

/**
 * 定义创建知识库基础的输入结构。
 */
export type CreateKnowledgeBaseInput = {
  name: string
  description?: string
}

/**
 * 定义更新知识库基础的输入结构。
 */
export type UpdateKnowledgeBaseInput = {
  name?: string
  description?: string
}

/**
 * 定义列表知识库Bases的查询参数结构。
 */
export type ListKnowledgeBasesQuery = {
  page?: number
  pageSize?: number
}

/**
 * 定义注册的输入结构。
 */
export type RegisterInput = {
  username: string
  email: string
  password: string
}

/**
 * 定义登录的输入结构。
 */
export type LoginInput = {
  email: string
  password: string
}

/**
 * 定义刷新令牌的输入结构。
 */
export type RefreshTokenInput = {
  refreshToken: string
}

/**
 * 定义上传文档的输入结构。
 */
export type UploadDocumentsInput<FileValue = File> = {
  knowledgeBaseId: string
  files: FileValue[]
}

/**
 * 定义创建Editor文档的输入结构。
 */
export type CreateEditorDocumentInput = {
  knowledgeBaseId: string
  name: string
  content: string
}

/**
 * 定义列表文档的查询参数结构。
 */
export type ListDocumentsQuery = {
  page?: number
  pageSize?: number
  knowledgeBaseId?: string
  keyword?: string
}

/**
 * 定义删除文档的输入结构。
 */
export type RemoveDocumentsInput = {
  documentIds: string[]
}

/**
 * 定义创建对话会话的输入结构。
 */
export type CreateChatSessionInput = {
  knowledgeBaseId?: string
  title?: string
}

/**
 * 定义更新对话会话的输入结构。
 */
export type UpdateChatSessionInput = {
  title: string
}

/**
 * 定义查询对话消息的查询参数结构。
 */
export type FindChatMessagesQuery = {
  sessionId: string
}

/**
 * 定义问答对话消息的输入结构。
 */
export type AskChatMessageInput = {
  role: ChatRequestMessageRole
  content: string
  name?: string
  toolCallId?: string
}

/**
 * 定义问答对话的输入结构。
 */
export type AskChatInput = {
  messages: AskChatMessageInput[]
  sessionId?: string
  knowledgeBaseId?: string
  topK?: number
}

/**
 * 表示前端参数契约校验失败时抛出的错误。
 */
export class ApiContractError extends Error {
  /**
   * 创建参数契约校验错误实例。
   * @param message 具体的校验失败原因。
   * @returns 返回带有固定错误名称的异常对象。
   */
  constructor(message: string) {
    super(message)
    this.name = "ApiContractError"
  }
}

/**
 * 判断是否为ObjectId。
 * @param value 待处理的值。
 * @returns 返回布尔值，表示是否满足ObjectId。
 */
export const isObjectId = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    API_CONSTRAINTS.objectIdPattern.test(value.trim())
  )
}

/**
 * 校验并返回ObjectId。
 * @param value 待处理的值。
 * @param fieldName 字段名称。
 * @returns 返回字符串结果。
 */
export const ensureObjectId = (value: unknown, fieldName: string): string => {
  if (!isObjectId(value)) {
    throw new ApiContractError(`${fieldName} 必须是合法 ObjectId`)
  }

  return value.trim()
}

/**
 * 校验并返回TrimmedString。
 * @param value 待处理的值。
 * @param options 配置项。
 * @param options.fieldName 字段名称。
 * @param options.minLength minLength。
 * @param options.maxLength maxLength。
 * @returns 返回字符串结果。
 */
export const ensureTrimmedString = (
  value: unknown,
  options: {
    fieldName: string
    minLength?: number
    maxLength?: number
  }
): string => {
  if (typeof value !== "string") {
    throw new ApiContractError(`${options.fieldName} 必须是字符串`)
  }

  const normalizedValue = value.trim()

  if (
    typeof options.minLength === "number" &&
    normalizedValue.length < options.minLength
  ) {
    throw new ApiContractError(
      `${options.fieldName} 长度不能少于 ${options.minLength}`
    )
  }

  if (
    typeof options.maxLength === "number" &&
    normalizedValue.length > options.maxLength
  ) {
    throw new ApiContractError(
      `${options.fieldName} 长度不能超过 ${options.maxLength}`
    )
  }

  return normalizedValue
}

/**
 * 校验并返回OptionalTrimmedString。
 * @param value 待处理的值。
 * @param options 配置项。
 * @param options.fieldName 字段名称。
 * @param options.minLength minLength。
 * @param options.maxLength maxLength。
 * @returns 返回字符串或undefined。
 */
export const ensureOptionalTrimmedString = (
  value: unknown,
  options: {
    fieldName: string
    minLength?: number
    maxLength?: number
  }
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  const normalizedValue = ensureTrimmedString(value, options)

  if (!normalizedValue) {
    return undefined
  }

  return normalizedValue
}

/**
 * 对字符串值执行 `trim`，其他类型保持原样。
 * @param value 需要处理的值。
 * @returns 返回去除首尾空白后的字符串，或原始值本身。
 */
export const trimStringValue = (value: unknown): unknown => {
  return typeof value === "string" ? value.trim() : value
}

/**
 * 对可选字符串执行 `trim`，空字符串转为 `undefined`。
 * @param value 需要处理的值。
 * @returns 返回规范化后的字符串、`undefined` 或原始值。
 */
export const trimOptionalStringValue = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value
  }

  const normalizedValue = value.trim()

  return normalizedValue ? normalizedValue : undefined
}

/**
 * 校验并返回Integer。
 * @param value 待处理的值。
 * @param options 配置项。
 * @param options.fieldName 字段名称。
 * @param options.min min。
 * @param options.max max。
 * @param options.defaultValue 默认Value。
 * @returns 返回数值结果。
 */
export const ensureInteger = (
  value: unknown,
  options: {
    fieldName: string
    min?: number
    max?: number
    defaultValue?: number
  }
): number => {
  if (value === undefined || value === null || value === "") {
    if (typeof options.defaultValue === "number") {
      return options.defaultValue
    }

    throw new ApiContractError(`${options.fieldName} 必须是整数`)
  }

  const normalizedValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10)

  if (!Number.isInteger(normalizedValue)) {
    throw new ApiContractError(`${options.fieldName} 必须是整数`)
  }

  if (typeof options.min === "number" && normalizedValue < options.min) {
    throw new ApiContractError(`${options.fieldName} 不能小于 ${options.min}`)
  }

  if (typeof options.max === "number" && normalizedValue > options.max) {
    throw new ApiContractError(`${options.fieldName} 不能大于 ${options.max}`)
  }

  return normalizedValue
}

/**
 * 校验并返回邮箱。
 * @param value 待处理的值。
 * @param fieldName 字段名称。
 * @returns 返回字符串结果。
 */
export const ensureEmail = (value: unknown, fieldName: string): string => {
  const normalizedValue = ensureTrimmedString(value, {
    fieldName,
    maxLength: API_CONSTRAINTS.user.emailMaxLength,
  })

  if (!API_CONSTRAINTS.emailPattern.test(normalizedValue)) {
    throw new ApiContractError(`${fieldName} 格式不正确`)
  }

  return normalizedValue
}

/**
 * 规范化创建知识库基础Input。
 * @param value 待处理的值。
 * @returns 返回创建知识库基础Input。
 */
export const normalizeCreateKnowledgeBaseInput = (
  value: CreateKnowledgeBaseInput
): CreateKnowledgeBaseInput => {
  return {
    name: ensureTrimmedString(value.name, {
      fieldName: "name",
      minLength: API_CONSTRAINTS.knowledgeBase.nameMinLength,
      maxLength: API_CONSTRAINTS.knowledgeBase.nameMaxLength,
    }),
    description: ensureOptionalTrimmedString(value.description, {
      fieldName: "description",
      maxLength: API_CONSTRAINTS.knowledgeBase.descriptionMaxLength,
    }),
  }
}

/**
 * 规范化更新知识库基础Input。
 * @param value 待处理的值。
 * @returns 返回更新知识库基础Input。
 */
export const normalizeUpdateKnowledgeBaseInput = (
  value: UpdateKnowledgeBaseInput
): UpdateKnowledgeBaseInput => {
  return {
    name: ensureOptionalTrimmedString(value.name, {
      fieldName: "name",
      minLength: API_CONSTRAINTS.knowledgeBase.nameMinLength,
      maxLength: API_CONSTRAINTS.knowledgeBase.nameMaxLength,
    }),
    description: ensureOptionalTrimmedString(value.description, {
      fieldName: "description",
      maxLength: API_CONSTRAINTS.knowledgeBase.descriptionMaxLength,
    }),
  }
}

/**
 * 规范化列表知识库Bases查询参数。
 * @param value 待处理的值。
 * @returns 返回列表知识库Bases查询参数。
 */
export const normalizeListKnowledgeBasesQuery = (
  value: ListKnowledgeBasesQuery
): ListKnowledgeBasesQuery => {
  const page =
    value.page === undefined
      ? undefined
      : ensureInteger(value.page, {
          fieldName: "page",
          min: API_CONSTRAINTS.knowledgeBase.pageMin,
        })
  const pageSize =
    value.pageSize === undefined
      ? undefined
      : ensureInteger(value.pageSize, {
          fieldName: "pageSize",
          min: API_CONSTRAINTS.knowledgeBase.pageSizeMin,
          max: API_CONSTRAINTS.knowledgeBase.pageSizeMax,
        })

  return {
    page,
    pageSize,
  }
}

/**
 * 规范化注册Input。
 * @param value 待处理的值。
 * @returns 返回注册Input。
 */
export const normalizeRegisterInput = (value: RegisterInput): RegisterInput => {
  return {
    username: ensureTrimmedString(value.username, {
      fieldName: "username",
      minLength: API_CONSTRAINTS.user.usernameMinLength,
      maxLength: API_CONSTRAINTS.user.usernameMaxLength,
    }),
    email: ensureEmail(value.email, "email"),
    password: ensureTrimmedString(value.password, {
      fieldName: "password",
      minLength: API_CONSTRAINTS.user.passwordMinLength,
      maxLength: API_CONSTRAINTS.user.passwordMaxLength,
    }),
  }
}

/**
 * 规范化登录Input。
 * @param value 待处理的值。
 * @returns 返回登录Input。
 */
export const normalizeLoginInput = (value: LoginInput): LoginInput => {
  return {
    email: ensureEmail(value.email, "email"),
    password: ensureTrimmedString(value.password, {
      fieldName: "password",
      minLength: API_CONSTRAINTS.user.passwordMinLength,
      maxLength: API_CONSTRAINTS.user.passwordMaxLength,
    }),
  }
}

/**
 * 规范化刷新令牌Input。
 * @param value 待处理的值。
 * @returns 返回刷新令牌Input。
 */
export const normalizeRefreshTokenInput = (
  value: RefreshTokenInput
): RefreshTokenInput => {
  return {
    refreshToken: ensureTrimmedString(value.refreshToken, {
      fieldName: "refreshToken",
      minLength: 1,
      maxLength: API_CONSTRAINTS.user.refreshTokenMaxLength,
    }),
  }
}

/**
 * 规范化上传文档Input。
 * @param value 待处理的值。
 * @returns 返回上传文档Input<FileValue>。
 */
export const normalizeUploadDocumentsInput = <FileValue>(
  value: UploadDocumentsInput<FileValue>
): UploadDocumentsInput<FileValue> => {
  if (!Array.isArray(value.files) || value.files.length === 0) {
    throw new ApiContractError("files 至少需要一个文件")
  }

  return {
    knowledgeBaseId: ensureObjectId(value.knowledgeBaseId, "knowledgeBaseId"),
    files: value.files,
  }
}

/**
 * 规范化创建Editor文档Input。
 * @param value 待处理的值。
 * @returns 返回创建Editor文档Input。
 */
export const normalizeCreateEditorDocumentInput = (
  value: CreateEditorDocumentInput
): CreateEditorDocumentInput => {
  return {
    knowledgeBaseId: ensureObjectId(value.knowledgeBaseId, "knowledgeBaseId"),
    name: ensureTrimmedString(value.name, {
      fieldName: "name",
      minLength: API_CONSTRAINTS.document.nameMinLength,
      maxLength: API_CONSTRAINTS.document.nameMaxLength,
    }),
    content: ensureTrimmedString(value.content, {
      fieldName: "content",
      minLength: API_CONSTRAINTS.document.contentMinLength,
    }),
  }
}

/**
 * 规范化列表文档查询参数。
 * @param value 待处理的值。
 * @returns 返回列表文档查询参数。
 */
export const normalizeListDocumentsQuery = (
  value: ListDocumentsQuery
): ListDocumentsQuery => {
  return {
    page: ensureInteger(value.page, {
      fieldName: "page",
      min: API_CONSTRAINTS.document.pageMin,
      defaultValue: API_CONSTRAINTS.document.pageDefault,
    }),
    pageSize: ensureInteger(value.pageSize, {
      fieldName: "pageSize",
      min: API_CONSTRAINTS.document.pageSizeMin,
      max: API_CONSTRAINTS.document.pageSizeMax,
      defaultValue: API_CONSTRAINTS.document.pageSizeDefault,
    }),
    knowledgeBaseId: value.knowledgeBaseId
      ? ensureObjectId(value.knowledgeBaseId, "knowledgeBaseId")
      : undefined,
    keyword: ensureOptionalTrimmedString(value.keyword, {
      fieldName: "keyword",
    }),
  }
}

/**
 * 规范化删除文档Input。
 * @param value 待处理的值。
 * @returns 返回删除文档Input。
 */
export const normalizeRemoveDocumentsInput = (
  value: RemoveDocumentsInput
): RemoveDocumentsInput => {
  if (!Array.isArray(value.documentIds) || value.documentIds.length === 0) {
    throw new ApiContractError("documentIds 至少需要一个文档 ID")
  }

  return {
    documentIds: value.documentIds.map((item) =>
      ensureObjectId(item, "documentIds")
    ),
  }
}

/**
 * 规范化创建对话会话Input。
 * @param value 待处理的值。
 * @returns 返回创建对话会话Input。
 */
export const normalizeCreateChatSessionInput = (
  value: CreateChatSessionInput
): CreateChatSessionInput => {
  return {
    knowledgeBaseId: value.knowledgeBaseId
      ? ensureObjectId(value.knowledgeBaseId, "knowledgeBaseId")
      : undefined,
    title: ensureOptionalTrimmedString(value.title, {
      fieldName: "title",
      minLength: API_CONSTRAINTS.chat.sessionTitleMinLength,
      maxLength: API_CONSTRAINTS.chat.sessionTitleMaxLength,
    }),
  }
}

/**
 * 规范化更新对话会话Input。
 * @param value 待处理的值。
 * @returns 返回更新对话会话Input。
 */
export const normalizeUpdateChatSessionInput = (
  value: UpdateChatSessionInput
): UpdateChatSessionInput => {
  return {
    title: ensureTrimmedString(value.title, {
      fieldName: "title",
      minLength: API_CONSTRAINTS.chat.sessionTitleMinLength,
      maxLength: API_CONSTRAINTS.chat.sessionTitleMaxLength,
    }),
  }
}

/**
 * 规范化查询对话消息查询参数。
 * @param value 待处理的值。
 * @returns 返回查询对话消息查询参数。
 */
export const normalizeFindChatMessagesQuery = (
  value: FindChatMessagesQuery
): FindChatMessagesQuery => {
  return {
    sessionId: ensureObjectId(value.sessionId, "sessionId"),
  }
}

/**
 * 规范化问答对话消息Input。
 * @param value 待处理的值。
 * @returns 返回问答对话消息Input。
 */
export const normalizeAskChatMessageInput = (
  value: AskChatMessageInput
): AskChatMessageInput => {
  if (!CHAT_REQUEST_MESSAGE_ROLES.includes(value.role)) {
    throw new ApiContractError("role 取值不合法")
  }

  return {
    role: value.role,
    content: ensureTrimmedString(value.content, {
      fieldName: "content",
      minLength: 1,
    }),
    name: ensureOptionalTrimmedString(value.name, {
      fieldName: "name",
    }),
    toolCallId: ensureOptionalTrimmedString(value.toolCallId, {
      fieldName: "toolCallId",
    }),
  }
}

/**
 * 规范化问答对话Input。
 * @param value 待处理的值。
 * @returns 返回问答对话Input。
 */
export const normalizeAskChatInput = (value: AskChatInput): AskChatInput => {
  if (!Array.isArray(value.messages) || value.messages.length === 0) {
    throw new ApiContractError("messages 至少需要一条消息")
  }

  return {
    messages: value.messages.map(normalizeAskChatMessageInput),
    sessionId: value.sessionId
      ? ensureObjectId(value.sessionId, "sessionId")
      : undefined,
    knowledgeBaseId: value.knowledgeBaseId
      ? ensureObjectId(value.knowledgeBaseId, "knowledgeBaseId")
      : undefined,
    topK:
      value.topK === undefined
        ? undefined
        : ensureInteger(value.topK, {
            fieldName: "topK",
            min: API_CONSTRAINTS.chat.askTopKMin,
            max: API_CONSTRAINTS.chat.askTopKMax,
          }),
  }
}
