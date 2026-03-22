import { App } from "antd"
import { setAntdFeedbackInstances } from "@/lib/antdNotification"

export const AntdAppBridge = () => {
  const app = App.useApp()

  setAntdFeedbackInstances(app)

  return null
}
