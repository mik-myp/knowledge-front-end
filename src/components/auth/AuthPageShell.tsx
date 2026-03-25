import { useEffect, useRef, useState, type ReactNode } from "react"
import { Sparkles } from "lucide-react"
import { Link } from "react-router"

import EyeBall from "./EyeBall"
import Pupil from "./Pupil"

type AuthPageShellProps = {
  title: string
  description: string
  footerText: string
  footerLinkText: string
  footerLinkTo: string
  imageAlt: string
  children: ReactNode
  showPassword?: boolean
  password?: string
  isTyping?: boolean
}

type CharacterMotion = {
  faceX: number
  faceY: number
  bodySkew: number
}

const AuthPageShell = ({
  title,
  description,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
  showPassword = false,
  password = "",
  isTyping = false,
}: AuthPageShellProps) => {
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false)
  const [isBlackBlinking, setIsBlackBlinking] = useState(false)
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false)
  const [isPurplePeeking, setIsPurplePeeking] = useState(false)
  const [characterPositions, setCharacterPositions] = useState<{
    purple: CharacterMotion
    black: CharacterMotion
    yellow: CharacterMotion
    orange: CharacterMotion
  }>({
    purple: { faceX: 0, faceY: 0, bodySkew: 0 },
    black: { faceX: 0, faceY: 0, bodySkew: 0 },
    yellow: { faceX: 0, faceY: 0, bodySkew: 0 },
    orange: { faceX: 0, faceY: 0, bodySkew: 0 },
  })
  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true)
        setTimeout(() => {
          setIsPurpleBlinking(false)
          scheduleBlink()
        }, 150)
      }, getRandomBlinkInterval())

      return blinkTimeout
    }

    const timeout = scheduleBlink()
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true)
        setTimeout(() => {
          setIsBlackBlinking(false)
          scheduleBlink()
        }, 150)
      }, getRandomBlinkInterval())

      return blinkTimeout
    }

    const timeout = scheduleBlink()
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!isTyping) {
      const frameId = requestAnimationFrame(() => {
        setIsLookingAtEachOther(false)
      })

      return () => cancelAnimationFrame(frameId)
    }

    const startTimer = setTimeout(() => {
      setIsLookingAtEachOther(true)
    }, 0)
    const timer = setTimeout(() => {
      setIsLookingAtEachOther(false)
    }, 800)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(timer)
    }
  }, [isTyping])

  useEffect(() => {
    if (!(password.length > 0 && showPassword)) {
      const frameId = requestAnimationFrame(() => {
        setIsPurplePeeking(false)
      })

      return () => cancelAnimationFrame(frameId)
    }

    const peekDelay = Math.random() * 3000 + 2000
    let resetTimeout: ReturnType<typeof setTimeout> | undefined

    const peekTimeout = setTimeout(() => {
      setIsPurplePeeking(true)
      resetTimeout = setTimeout(() => {
        setIsPurplePeeking(false)
      }, 800)
    }, peekDelay)

    return () => {
      clearTimeout(peekTimeout)
      if (resetTimeout) {
        clearTimeout(resetTimeout)
      }
    }
  }, [password, showPassword])

  const calculatePosition = (
    element: HTMLDivElement | null,
    clientX: number,
    clientY: number
  ): CharacterMotion => {
    if (!element) {
      return { faceX: 0, faceY: 0, bodySkew: 0 }
    }

    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 3

    const deltaX = clientX - centerX
    const deltaY = clientY - centerY

    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    }
  }

  const purplePos = characterPositions.purple
  const blackPos = characterPositions.black
  const yellowPos = characterPositions.yellow
  const orangePos = characterPositions.orange

  useEffect(() => {
    const updateCharacterPositions = (clientX: number, clientY: number) => {
      setCharacterPositions({
        purple: calculatePosition(purpleRef.current, clientX, clientY),
        black: calculatePosition(blackRef.current, clientX, clientY),
        yellow: calculatePosition(yellowRef.current, clientX, clientY),
        orange: calculatePosition(orangeRef.current, clientX, clientY),
      })
    }

    const handleMouseMove = (event: MouseEvent) => {
      updateCharacterPositions(event.clientX, event.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)

    const frameId = requestAnimationFrame(() => {
      updateCharacterPositions(window.innerWidth / 2, window.innerHeight / 2)
    })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="grid min-h-svh bg-[#fff7ef] lg:grid-cols-2">
      <div className="relative hidden min-h-svh overflow-hidden bg-[linear-gradient(160deg,#0F3B2E_0%,#237A57_45%,#F6B85E_130%)] text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,215,150,0.22),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[24px_24px] opacity-30" />
        <div className="pointer-events-none absolute top-12 right-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 left-8 h-56 w-56 rounded-full bg-[#FFD38D]/20 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between px-12 pt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/12 backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium tracking-[0.28em] text-white/70 uppercase">
                Knowledge Base
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex h-107.5 items-end justify-center px-12">
          <div className="relative h-100 w-137.5 max-w-full">
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "70px",
                width: "180px",
                height:
                  isTyping || (password.length > 0 && !showPassword)
                    ? "440px"
                    : "400px",
                backgroundColor: "#6C3FF5",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : isTyping || (password.length > 0 && !showPassword)
                      ? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)`
                      : `skewX(${purplePos.bodySkew}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? "20px"
                      : isLookingAtEachOther
                        ? "55px"
                        : `${45 + purplePos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? "35px"
                      : isLookingAtEachOther
                        ? "65px"
                        : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 4
                        : -4
                      : isLookingAtEachOther
                        ? 3
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 5
                        : -4
                      : isLookingAtEachOther
                        ? 4
                        : undefined
                  }
                />
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 4
                        : -4
                      : isLookingAtEachOther
                        ? 3
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 5
                        : -4
                      : isLookingAtEachOther
                        ? 4
                        : undefined
                  }
                />
              </div>
            </div>

            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "240px",
                width: "120px",
                height: "310px",
                backgroundColor: "#2D2D2D",
                borderRadius: "8px 8px 0 0",
                zIndex: 2,
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : isLookingAtEachOther
                      ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(20px)`
                      : isTyping || (password.length > 0 && !showPassword)
                        ? `skewX(${blackPos.bodySkew * 1.5}deg)`
                        : `skewX(${blackPos.bodySkew}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? "10px"
                      : isLookingAtEachOther
                        ? "32px"
                        : `${26 + blackPos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? "28px"
                      : isLookingAtEachOther
                        ? "12px"
                        : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? 0
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? -4
                        : undefined
                  }
                />
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? 0
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? -4
                        : undefined
                  }
                />
              </div>
            </div>

            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "0px",
                width: "240px",
                height: "200px",
                zIndex: 3,
                backgroundColor: "#FF9B6B",
                borderRadius: "120px 120px 0 0",
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : `skewX(${orangePos.bodySkew}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? "50px"
                      : `${82 + orangePos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? "85px"
                      : `${90 + orangePos.faceY}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : undefined
                  }
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : undefined
                  }
                />
              </div>
            </div>

            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "310px",
                width: "140px",
                height: "230px",
                backgroundColor: "#E8D754",
                borderRadius: "70px 70px 0 0",
                zIndex: 4,
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : `skewX(${yellowPos.bodySkew}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? "20px"
                      : `${52 + yellowPos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? "35px"
                      : `${40 + yellowPos.faceY}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : undefined
                  }
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={
                    password.length > 0 && showPassword ? -5 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : undefined
                  }
                />
              </div>
              <div
                className="absolute h-1 w-20 rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? "10px"
                      : `${40 + yellowPos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? "88px"
                      : `${88 + yellowPos.faceY}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="h-10" />
      </div>

      <div className="flex min-h-svh flex-col bg-[#fffaf3] p-6 md:p-10">
        <div className="mx-auto flex w-full max-w-md flex-1 items-center">
          <div className="w-full rounded-4xl border border-black/10 bg-white px-6 py-8 shadow-[10px_10px_0_rgba(0,0,0,0.06)] md:px-8 md:py-10">
            <div className="mb-8 text-center">
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#1E1E1E]">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-black/55">
                {description}
              </p>
            </div>

            <div>{children}</div>

            <div className="mt-8 border-t border-black/8 pt-5 text-center text-sm text-black/55">
              {footerText}
              <Link
                to={footerLinkTo}
                className="font-medium text-[#237A57] underline decoration-[#237A57]/30 underline-offset-4"
              >
                {footerLinkText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPageShell
