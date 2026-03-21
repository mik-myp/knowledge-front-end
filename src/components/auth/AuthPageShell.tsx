import type { ReactNode } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { Link } from "react-router"

import placeholder from "@/assets/placeholder.svg"

type AuthPageShellProps = {
  title: string
  description: string
  submitText: string
  footerText: string
  footerLinkText: string
  footerLinkTo: string
  imageAlt: string
  children: ReactNode
}

const AuthPageShell = ({
  title,
  description,
  footerText,
  footerLinkText,
  footerLinkTo,
  imageAlt,
  children,
}: AuthPageShellProps) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            知识前台
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {description}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-6">{children}</div>
            <div>
              {footerText} <Link to={footerLinkTo}>{footerLinkText}</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={placeholder}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

export default AuthPageShell
