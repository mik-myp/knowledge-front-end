import { useEffect, useRef, useState } from "react"

/**
 * 描述眼球组件的属性。
 */
interface EyeBallProps {
  size?: number
  pupilSize?: number
  maxDistance?: number
  eyeColor?: string
  pupilColor?: string
  isBlinking?: boolean
  forceLookX?: number
  forceLookY?: number
}

/**
 * 渲染EyeBall组件。
 * @param props 组件属性。
 * @param props.size 大小。
 * @param props.pupilSize pupil大小。
 * @param props.maxDistance maxDistance。
 * @param props.eyeColor eyeColor。
 * @param props.pupilColor pupilColor。
 * @param props.isBlinking isBlinking。
 * @param props.forceLookX forceLookX。
 * @param props.forceLookY forceLookY。
 * @returns 返回组件渲染结果。
 */
const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 })
  const eyeRef = useRef<HTMLDivElement>(null)
  const currentPupilPosition =
    forceLookX !== undefined && forceLookY !== undefined
      ? { x: forceLookX, y: forceLookY }
      : pupilPosition

  useEffect(() => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return
    }

    const updatePupilPosition = (clientX: number, clientY: number) => {
      const eye = eyeRef.current

      if (!eye) {
        setPupilPosition({ x: 0, y: 0 })
        return
      }

      const eyeRect = eye.getBoundingClientRect()
      const eyeCenterX = eyeRect.left + eyeRect.width / 2
      const eyeCenterY = eyeRect.top + eyeRect.height / 2

      const deltaX = clientX - eyeCenterX
      const deltaY = clientY - eyeCenterY
      const distance = Math.min(
        Math.sqrt(deltaX ** 2 + deltaY ** 2),
        maxDistance
      )

      const angle = Math.atan2(deltaY, deltaX)
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      setPupilPosition({ x, y })
    }

    const handleMouseMove = (event: MouseEvent) => {
      updatePupilPosition(event.clientX, event.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)

    const frameId = requestAnimationFrame(() => {
      updatePupilPosition(window.innerWidth / 2, window.innerHeight / 2)
    })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [forceLookX, forceLookY, maxDistance])

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${currentPupilPosition.x}px, ${currentPupilPosition.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  )
}

export default EyeBall
