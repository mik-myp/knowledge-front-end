import Markdown from "@/components/Markdown"
import type { TChatListMessageItem } from "@/types/ai-chat"
import { Actions, type ActionsProps } from "@ant-design/x"
import { Drawer } from "antd"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const ActionsFooter = ({
  messageItem,
}: {
  messageItem: TChatListMessageItem
}) => {
  const { t } = useTranslation("chat")
  const [open, setOpen] = useState(false)
  const [childOpen, setChildOpen] = useState(false)
  const [sourceContent, setSourceContent] = useState("")
  const sources = messageItem.message.sources ?? []
  const canCopy =
    Boolean(messageItem.message.content.trim()) &&
    messageItem.message.streamStatus !== "progress"
  const actionItems: NonNullable<ActionsProps["items"]> = []

  if (canCopy) {
    actionItems.push({
      key: "copy",
      label: t("list.copy"),
      actionRender: () => {
        return <Actions.Copy text={messageItem.message.content} />
      },
    })
  }

  if (sources.length > 0) {
    actionItems.push({
      key: "sources",
      actionRender: () => {
        return (
          <div
            className="h-full cursor-pointer text-black/45"
            onClick={() => setOpen(true)}
          >
            {t("list.sources", { count: sources.length })}
          </div>
        )
      },
    })
  }

  if (actionItems.length === 0) {
    return null
  }

  return (
    <>
      <Actions items={actionItems} />
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false)
          setChildOpen(false)
        }}
        title={t("list.sourcesTitle")}
        closable={{ placement: "end" }}
        classNames={{
          body: "p-5 pr-1 scrollbar-thin",
        }}
        resizable
      >
        <div className="flex flex-col gap-4">
          {sources.map((source) => {
            return (
              <div
                className="w-full cursor-pointer px-3 py-2 hover:rounded-2xl hover:bg-black/5"
                key={`${source.documentId}-${source.chunkSequence}`}
                onClick={() => {
                  setChildOpen(true)
                  setSourceContent(source.text || "")
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="text-lg">{source.documentName}</div>
                  <div className="line-clamp-2 overflow-hidden text-sm text-ellipsis text-black/45">
                    {source.text}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Drawer
          title={t("list.sourcesContentTitle")}
          onClose={() => setChildOpen(false)}
          open={childOpen}
          closable={{ placement: "end" }}
          classNames={{
            body: "scrollbar-thin",
          }}
          resizable
        >
          <Markdown>{sourceContent}</Markdown>
        </Drawer>
      </Drawer>
    </>
  )
}

export default ActionsFooter
