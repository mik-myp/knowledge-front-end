import { RouterProvider } from "react-router"
import router from "./routers/index.ts"
import { ConfigProvider, App as AntdApp } from "antd"
import { StyleProvider } from "@ant-design/cssinjs"
import useIllustrationTheme from "@/lib/illustrationTheme.ts"

function App() {
  const configProps = useIllustrationTheme()

  return (
    <StyleProvider layer>
      <ConfigProvider {...configProps}>
        <AntdApp className="h-full">
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  )
}

export default App
