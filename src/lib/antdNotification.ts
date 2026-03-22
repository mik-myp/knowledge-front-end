import type { useAppProps } from "antd/es/app/context"
import type { MessageInstance } from "antd/es/message/interface"
import type { ModalStaticFunctions } from "antd/es/modal/confirm"
import type { NotificationInstance } from "antd/es/notification/interface"

type AntdFeedbackStore = {
  message: MessageInstance
  notification: NotificationInstance
  modal: ModalStaticFunctions
}

const instances: Partial<AntdFeedbackStore> = {}

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

export const message = createInstanceProxy<MessageInstance>(
  "message",
  "message"
)

export const notification = createInstanceProxy<NotificationInstance>(
  "notification",
  "notification"
)

export const modal = createInstanceProxy<ModalStaticFunctions>("modal", "modal")

export const setAntdFeedbackInstances = (app: useAppProps) => {
  instances.message = app.message
  instances.notification = app.notification
  instances.modal = {
    ...app.modal,
    warn: app.modal.warning,
  }
}
