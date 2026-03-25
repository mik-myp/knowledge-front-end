import { useEffect, useRef, useState } from "react"

interface PupilProps {
  size?: number
  maxDistance?: number
  pupilColor?: string
  forceLookX?: number
  forceLookY?: number
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 })
  const pupilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      setPupilPosition({ x: forceLookX, y: forceLookY })
      return
    }

    const updatePupilPosition = (clientX: number, clientY: number) => {
      const pupil = pupilRef.current

      if (!pupil) {
        setPupilPosition({ x: 0, y: 0 })
        return
      }

      const pupilRect = pupil.getBoundingClientRect()
      const pupilCenterX = pupilRect.left + pupilRect.width / 2
      const pupilCenterY = pupilRect.top + pupilRect.height / 2

      const deltaX = clientX - pupilCenterX
      const deltaY = clientY - pupilCenterY
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
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  )
}
export default Pupil
