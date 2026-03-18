import { Button } from "@/components/ui/button"
import { SayHelloWorld } from "@/services"
import { useState } from "react"

const Home = () => {
  const [text, setText] = useState("")

  const handleClick = async () => {
    const res = await SayHelloWorld()
    setText(res)
  }

  return (
    <div>
      Home
      <Button onClick={handleClick}>测试{text}</Button>
    </div>
  )
}

export default Home
