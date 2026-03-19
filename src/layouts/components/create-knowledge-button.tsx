import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateKnowledgeButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">创建知识库</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>创建知识库</DialogTitle>
          <DialogDescription>填写知识库名称和描述</DialogDescription>
          <form className="flex flex-col gap-6" id="create-knowledge">
            
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
