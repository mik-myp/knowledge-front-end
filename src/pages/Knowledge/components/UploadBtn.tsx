import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react"
import { useForm } from "@tanstack/react-form"
import { Plus, Upload } from "lucide-react"
import * as z from "zod"

import { SearchSelect } from "@/components/search-select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getAllKnowledges } from "@/services/knowledge"
import { cn } from "@/lib/utils"
import { useRequest } from "ahooks"
import { documnetsUpload } from "@/services/document"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  knowledgeId: z.string().min(1, "请选择知识库"),
  file: z.custom<File>((value) => value instanceof File, {
    message: "请先选择文件",
  }),
})

const UploadBtn = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { runAsync: documnetsUploadAsync, loading } = useRequest(
    documnetsUpload,
    {
      manual: true,
    }
  )

  const form = useForm({
    defaultValues: {
      knowledgeId: "",
      file: undefined as File | undefined,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData()

      formData.append("file", value.file!)
      formData.append("knowledgeBaseId", value.knowledgeId)

      try {
        await documnetsUploadAsync(formData)

        form.reset()
        if (inputRef.current) {
          inputRef.current.value = ""
        }
        setDialogOpen(false)
      } catch {
        /* empty */
      }
    },
  })

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      form.reset()
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  const handleChooseFile = () => {
    inputRef.current?.click()
  }

  const handleFileTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    handleChooseFile()
  }

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: File | undefined) => void,
    onBlur: () => void
  ) => {
    onChange(event.target.files?.[0])
    onBlur()
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <form
        className="flex flex-col gap-6"
        id="upload-file-form"
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Upload />
            上传
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>上传文件</DialogTitle>
            <DialogDescription>选择知识库并上传文件</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <form.Field
              name="knowledgeId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>知识库</FieldLabel>
                    <SearchSelect
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      service={getAllKnowledges}
                      fieldNames={{
                        label: "name",
                        value: "id",
                      }}
                      placeholder="请选择知识库"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="file"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>文件</FieldLabel>
                    <Input
                      ref={inputRef}
                      type="file"
                      className="hidden"
                      onChange={(event) =>
                        handleFileChange(
                          event,
                          field.handleChange,
                          field.handleBlur
                        )
                      }
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={handleChooseFile}
                      onKeyDown={handleFileTriggerKeyDown}
                      className={cn(
                        "mt-1 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:border-chart-2",
                        isInvalid && "border-destructive"
                      )}
                    >
                      <Plus />
                      <span>{field.state.value ? "重新选择文件" : "上传"}</span>
                      {field.state.value ? (
                        <span className="mt-2 text-xs text-muted-foreground">
                          {field.state.value.name}
                        </span>
                      ) : null}
                    </div>
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
            <Button type="submit" form="upload-file-form" disabled={loading}>
              {loading ? <Spinner /> : null}
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default UploadBtn
