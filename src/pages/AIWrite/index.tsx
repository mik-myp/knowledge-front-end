import { Button, Divider, Layout, theme } from "antd"
import {
  MDXEditor,
  headingsPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  BlockTypeSelect,
} from "@mdxeditor/editor"
import "@mdxeditor/editor/style.css"
import Markdown from "@/components/Markdown"
import { cn } from "@/lib/utils"
import { useState } from "react"

const { Header, Content } = Layout

const AIWrite = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const [markdownContent, setMarkdownContent] = useState("# Hello world")

  return (
    <Layout className="h-full bg-white">
      <Header
        style={{ background: colorBgContainer }}
        className="flex h-15 items-center justify-between border-b-(length:--ant-menu-active-bar-border-width) px-4"
      >
        <Button type="link">返回</Button>
      </Header>

      <Content className="flex h-full flex-row gap-4">
        <div
          className={cn(
            "m-4 flex-1 rounded-2xl",
            "[border-width:var(--ant-menu-active-bar-border-width)]"
          )}
        >
          <MDXEditor
            markdown={markdownContent}
            plugins={[
              headingsPlugin(),
              toolbarPlugin({
                toolbarClassName: "rounded-tl-2xl! rounded-tr-2xl!",
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <Divider orientation="vertical" />
                    <BoldItalicUnderlineToggles />
                    <Divider orientation="vertical" />
                    <BlockTypeSelect />
                  </>
                ),
              }),
            ]}
            onChange={setMarkdownContent}
          />
        </div>

        <div
          className={cn(
            "m-4 flex-1 rounded-2xl",
            "[border-width:var(--ant-menu-active-bar-border-width)]"
          )}
        >
          <Markdown content={markdownContent} className="p-3" />
        </div>
      </Content>
    </Layout>
  )
}

export default AIWrite
