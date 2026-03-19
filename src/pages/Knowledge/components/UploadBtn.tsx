import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Upload } from "lucide-react"
import { useRef } from "react"

const UploadBtn = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("选中的文件：", file)
    console.log("文件名：", file.name)
    console.log("文件大小：", file.size)
    console.log("文件类型：", file.type)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Upload />
          上传
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传文件</DialogTitle>
          <DialogDescription>点击上传文件或者拖拽上传</DialogDescription>
          <Input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            onClick={() => inputRef.current?.click()}
            className="mt-4 flex h-50 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-gray-500 hover:border-chart-2"
          >
            <Plus />
            上传
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
export default UploadBtn
