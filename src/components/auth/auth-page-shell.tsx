import type { FormEvent, ReactNode } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { Link } from "react-router"

import placeholder from "@/assets/placeholder.svg"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

type AuthPageShellProps = {
  title: string
  description: string
  formId: string
  submitText: string
  footerText: string
  footerLinkText: string
  footerLinkTo: string
  imageAlt: string
  loading?: boolean
  children: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const AuthPageShell = ({
  title,
  description,
  formId,
  submitText,
  footerText,
  footerLinkText,
  footerLinkTo,
  imageAlt,
  loading = false,
  children,
  onSubmit,
}: AuthPageShellProps) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            知识前台
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form
              className="flex flex-col gap-6"
              id={formId}
              onSubmit={onSubmit}
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">{title}</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    {description}
                  </p>
                </div>
                {children}
                <Field>
                  <Button type="submit" form={formId} disabled={loading}>
                    {loading ? <Spinner /> : null}
                    {submitText}
                  </Button>
                </Field>
                <Field>
                  <FieldDescription className="text-center">
                    {footerText} <Link to={footerLinkTo}>{footerLinkText}</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
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
