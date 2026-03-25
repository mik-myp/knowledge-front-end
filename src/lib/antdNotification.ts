import type { useAppProps } from "antd/es/app/context"
import type { MessageInstance } from "antd/es/message/interface"
import type { ModalStaticFunctions } from "antd/es/modal/confirm"
import type { NotificationInstance } from "antd/es/notification/interface"

/**
 * 描述 Ant Design 反馈实例的缓存结构。
 */
type AntdFeedbackStore = {
  message: MessageInstance
  notification: NotificationInstance
  modal: ModalStaticFunctions
}

/**
 * 缓存已经挂载到应用中的反馈实例。
 */
const instances: Partial<AntdFeedbackStore> = {}

/**
 * 为反馈实例创建延迟访问代理。
 * @param key 需要读取的实例键名。
 * @param displayName 报错时展示的实例名称。
 * @returns 返回对应实例的代理对象，实际访问时再校验实例是否已初始化。
 */
const createInstanceProxy = <T extends object>(
  key: keyof AntdFeedbackStore,
  displayName: string
) =>
  new Proxy({} as T, {
    get: (_, propertyKey) => {
      const instance = instances[key]

      if (!instance) {
        throw new Error(
          `${displayName} 尚未初始化，请确保 AntdAppBridge 已在 <App /> 树中渲染。`
        )
      }

      const value = Reflect.get(instance, propertyKey)

      return typeof value === "function" ? value.bind(instance) : value
    },
  })

/**
 * 对外暴露的全局消息实例代理。
 */
export const message = createInstanceProxy<MessageInstance>(
  "message",
  "message"
)

/**
 * 对外暴露的全局通知实例代理。
 */
export const notification = createInstanceProxy<NotificationInstance>(
  "notification",
  "notification"
)

/**
 * 对外暴露的全局弹窗实例代理。
 */
export const modal = createInstanceProxy<ModalStaticFunctions>("modal", "modal")

/**
 * 写入当前应用提供的 Ant Design 反馈实例。
 * @param app Ant Design `App.useApp()` 返回的实例集合。
 * @returns 设置完成后不返回额外内容。
 */
export const setAntdFeedbackInstances = (app: useAppProps) => {
  instances.message = app.message
  instances.notification = app.notification
  instances.modal = {
    ...app.modal,
    warn: app.modal.warning,
  }
}
