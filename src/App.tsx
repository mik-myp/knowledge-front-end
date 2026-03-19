import { Button } from "@/components/ui/button"

export function App() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">项目已就绪</h1>
          <p>现在可以开始添加组件并继续开发了。</p>
          <p>按钮组件已经为你准备好了。</p>
          <Button className="mt-2">按钮示例</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          （按下 <kbd>d</kbd> 可切换深色模式）
        </div>
      </div>
    </div>
  )
}

export default App
