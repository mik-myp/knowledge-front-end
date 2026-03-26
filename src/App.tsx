import { RouterProvider } from "react-router"
import router from "./routers/index.ts"
import { App as AntdApp } from "antd"
import { StyleProvider } from "@ant-design/cssinjs"
import { XProvider } from "@ant-design/x"
import xZhCN from "@ant-design/x/locale/zh_CN"
import useIllustrationTheme from "@/lib/illustrationTheme.ts"
import { AntdAppBridge } from "@/lib/antdApp"
import zhCN from "antd/locale/zh_CN"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"

dayjs.locale("zh-cn")

/**
 * 渲染App组件。
 * @returns 返回组件渲染结果。
 */
function App() {
  const configProps = useIllustrationTheme()
  const locale = {
    ...zhCN,
    ...xZhCN,
  }

  return (
    <StyleProvider layer>
      <XProvider {...configProps} locale={locale}>
        <AntdApp className="h-full">
          <AntdAppBridge />
          <RouterProvider router={router} />
        </AntdApp>
      </XProvider>
    </StyleProvider>
  )
}

export default App
