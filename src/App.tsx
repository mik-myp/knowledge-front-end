import { RouterProvider } from "react-router"
import router from "./routers/index.ts"
import { App as AntdApp } from "antd"
import { StyleProvider } from "@ant-design/cssinjs"
import { XProvider } from "@ant-design/x"
import useIllustrationTheme from "@/lib/illustrationTheme.ts"
import { AntdAppBridge } from "@/lib/antdApp"
import zhCN from "antd/locale/zh_CN"
import enUS from "antd/locale/en_US"
import zhCN_X from "@ant-design/x/locale/zh_CN"
import enUS_X from "@ant-design/x/locale/en_US"
import { useGlobal } from "./stores/useGlobal.ts"
import { useMemo } from "react"

const antdLocales = {
  en: {
    ...enUS,
    ...enUS_X,
  },
  "zh-cn": {
    ...zhCN,
    ...zhCN_X,
  },
}
/**
 * 渲染App组件。
 * @returns 返回组件渲染结果。
 */
function App() {
  const configProps = useIllustrationTheme()
  const { language } = useGlobal()

  const locale = useMemo(() => antdLocales[language], [language])

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
