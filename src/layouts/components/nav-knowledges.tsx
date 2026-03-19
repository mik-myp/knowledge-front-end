import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useRequest } from "ahooks"
import { Link } from "react-router"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  createKnowledge,
  deleteKnowledgeById,
  getKnowledges,
  updateKnowledgeById,
} from "@/services/knowledge"
import type { TKnowledgeBaseRecord } from "@/types/knowledge"

const formSchema = z.object({
  name: z
    .string()
    .min(1, "知识库名称不能为空")
    .max(100, "知识库名称长度不能超过 100 个字符"),
  description: z.string().max(500, "知识库描述长度不能超过 500 个字符"),
})

const knowledgePageSize = 10

export function NavKnowledges() {
  const [knowledgeId, setKnowledgeId] = useState<string>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dataList, setDataList] = useState<TKnowledgeBaseRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const { runAsync: getKnowledgesAsync, loading } = useRequest(getKnowledges, {
    manual: true,
  })

  const { runAsync: createAsync, loading: createLoading } = useRequest(
    createKnowledge,
    {
      manual: true,
      onSuccess: () => loadKnowledges(1),
    }
  )

  const { runAsync: updateAsync, loading: updateLoading } = useRequest(
    updateKnowledgeById,
    {
      manual: true,
      onSuccess: () => loadKnowledges(1),
    }
  )

  const { runAsync: deleteAsync } = useRequest(deleteKnowledgeById, {
    manual: true,
    onSuccess: () => loadKnowledges(1),
  })

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        description: value.description.trim() || undefined,
      }

      if (knowledgeId) {
        await updateAsync({
          id: knowledgeId,
          ...payload,
        })
      } else {
        await createAsync(payload)
      }

      form.reset()
      setKnowledgeId(undefined)
      setDialogOpen(false)
    },
  })

  async function loadKnowledges(nextPage: number) {
    if (nextPage > 1) {
      setLoadingMore(true)
    }

    try {
      const result = await getKnowledgesAsync({
        page: nextPage,
        pageSize: knowledgePageSize,
      })

      setDataList((currentList) =>
        nextPage === 1 ? result.dataList : [...currentList, ...result.dataList]
      )
      setTotal(result.total)
      setPage(nextPage)
    } finally {
      if (nextPage > 1) {
        setLoadingMore(false)
      }
    }
  }

  useEffect(() => {
    void getKnowledgesAsync({
      page: 1,
      pageSize: knowledgePageSize,
    }).then((result) => {
      setDataList(result.dataList)
      setTotal(result.total)
      setPage(1)
    })
  }, [getKnowledgesAsync])

  const handleAdd = () => {
    setKnowledgeId(undefined)
    form.reset()
    setDialogOpen(true)
  }

  const handleUpdate = (item: TKnowledgeBaseRecord) => {
    setKnowledgeId(item.id)
    form.setFieldValue("name", item.name)
    form.setFieldValue("description", item.description || "")
    setDialogOpen(true)
  }

  const handleDelete = async (item: TKnowledgeBaseRecord) => {
    await deleteAsync({ id: item.id })
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      setKnowledgeId(undefined)
      form.reset()
    }
  }

  const hasMore = dataList.length < total
  const showSkeleton = loading && dataList.length === 0

  return (
    <div className="flex flex-col">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>知识库</SidebarGroupLabel>
        <div
          className="h-108 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {showSkeleton ? (
            <div className="flex flex-col gap-2 px-2">
              <Skeleton className="min-h-8" />
              <Skeleton className="min-h-8" />
              <Skeleton className="min-h-8" />
            </div>
          ) : (
            <SidebarMenu className="gap-2">
              {dataList.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/knowledge/${item.id}`} title={item.name}>
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">更多操作</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 rounded-lg"
                      side="right"
                      align="start"
                    >
                      <DropdownMenuItem onClick={() => handleUpdate(item)}>
                        <Pencil className="text-muted-foreground" />
                        <span>编辑</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="text-muted-foreground" />
                        <span>删除</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
              {hasMore && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-sidebar-foreground/70"
                    disabled={loadingMore}
                    onClick={() => void loadKnowledges(page + 1)}
                  >
                    {loadingMore ? <Spinner /> : <MoreHorizontal />}
                    <span>更多</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          )}
        </div>
      </SidebarGroup>
      <div className="px-2 pt-2">
        <Button className="w-full" onClick={handleAdd}>
          创建知识库
        </Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <form
          className="flex flex-col gap-6"
          id="create-or-update-knowledge"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {knowledgeId ? "编辑知识库" : "创建知识库"}
              </DialogTitle>
              <DialogDescription>填写知识库名称和描述</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>名称</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="名称"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>描述</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="描述（可选）"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button
                type="submit"
                form="create-or-update-knowledge"
                disabled={createLoading || updateLoading}
              >
                {createLoading || updateLoading ? <Spinner /> : null}
                确定
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  )
}
