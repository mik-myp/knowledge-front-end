import { App } from "antd"
import { setAntdFeedbackInstances } from "@/lib/antdNotification"

/**
 * 渲染AntdAppBridge组件。
 * @returns 返回组件渲染结果。
 */
export const AntdAppBridge = () => {
  const app = App.useApp()

  setAntdFeedbackInstances(app)

  return null
}
