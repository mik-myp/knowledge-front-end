import { RouterProvider } from "react-router"
import router from "./routers/index.ts"
import { App as AntdApp } from "antd"
import { StyleProvider } from "@ant-design/cssinjs"
import useIllustrationTheme from "@/lib/illustrationTheme.ts"
import { AntdAppBridge } from "@/lib/antdApp"
import zhCN from "antd/locale/zh_CN"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import XProvider from "@ant-design/x/es/x-provider"

dayjs.locale("zh-cn")

function App() {
  const configProps = useIllustrationTheme()

  return (
    <StyleProvider layer>
      <XProvider {...configProps} locale={zhCN}>
        <AntdApp className="h-full">
          <AntdAppBridge />
          <RouterProvider router={router} />
        </AntdApp>
      </XProvider>
    </StyleProvider>
  )
}

export default App
