import { cn } from "@/lib/utils"
import { getAllKnowledges } from "@/services/knowledge"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"
import type { TKnowledgeSelectModalProps } from "@/types/ai-chat"
import { SearchOutlined } from "@ant-design/icons"
import { useDebounce, useRequest } from "ahooks"
import { Empty, Input, Modal } from "antd"
import { useEffect, useState } from "react"

/**
 * 渲染知识库Select弹窗组件。
 * @param props 组件属性。
 * @param props.open open。
 * @param props.onCancel onCancel。
 * @param props.onConfirm onConfirm。
 * @returns 返回组件渲染结果。
 */
const KnowledgeSelectModal = ({
  open,
  onCancel,
  onConfirm,
}: TKnowledgeSelectModalProps) => {
  const [searchValue, setSearchValue] = useState("")
  const [selectedKnowledge, setSelectedKnowledge] = useState<
    TKnowledgeBaseRecord | undefined
  >(undefined)

  const { data, run, loading, cancel } = useRequest(getAllKnowledges, {
    manual: true,
  })

  const debouncedValue = useDebounce(searchValue, { wait: 500 })

  const filteredKnowledges = data?.filter((item) =>
    item.name.includes(debouncedValue)
  )

  useEffect(() => {
    if (open) {
      run()
    }

    return () => {
      cancel()
    }
  }, [cancel, open, run])

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="新建会话"
      width={700}
      centered
      afterClose={() => {
        setSearchValue("")
        setSelectedKnowledge(undefined)
      }}
      onOk={() => onConfirm(selectedKnowledge)}
    >
      <div>
        <div className="mb-4 flex flex-col gap-2 text-sm text-black/45">
          <div>选择知识库：创建知识库会话</div>
          <div>不选择知识库：创建普通会话</div>
        </div>
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="搜索并选择知识库后创建新会话"
          prefix={<SearchOutlined />}
          disabled={loading}
        />
        <div className="mt-4">
          {filteredKnowledges?.length ? (
            <div className="scrollbar-thin flex h-60 flex-col gap-2 overflow-y-auto">
              {filteredKnowledges.map((item) => {
                return (
                  <div
                    onClick={() => setSelectedKnowledge(item)}
                    className={cn(
                      "rounded-lg px-2 py-1.5 text-base text-black hover:bg-[rgba(0,0,0,0.06)]",
                      {
                        "bg-[rgba(0,0,0,0.06)]":
                          item.id === selectedKnowledge?.id,
                      }
                    )}
                    key={item.id}
                  >
                    {item.name}
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty
              rootClassName="h-full"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default KnowledgeSelectModal
