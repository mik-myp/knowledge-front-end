import { useRequest } from "ahooks"
import { useEffect, useRef, useState } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Spinner } from "./ui/spinner"

type SearchSelectItem = Record<string, unknown>

type SearchSelectFieldNames<T extends SearchSelectItem> = {
  label: keyof T & string
  value: keyof T & string
}

type SearchSelectProps<
  T extends SearchSelectItem,
  P extends Record<string, unknown> = Record<string, never>,
> = {
  service: (params: P) => Promise<T[]>
  params?: P
  fieldNames?: SearchSelectFieldNames<T>
  disabled?: boolean
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function SearchSelect<
  T extends SearchSelectItem,
  P extends Record<string, unknown> = Record<string, never>,
>({
  service,
  params,
  fieldNames = {
    label: "label" as keyof T & string,
    value: "value" as keyof T & string,
  },
  disabled,
  placeholder = "请选择",
  value,
  onValueChange,
}: SearchSelectProps<T, P>) {
  const [open, setOpen] = useState(false)
  const hasRequestedRef = useRef(false)
  const paramsKey = JSON.stringify(params ?? null)

  const {
    data = [],
    loading,
    error,
    run,
    cancel,
    mutate,
  } = useRequest(service, {
    manual: true,
  })

  useEffect(() => {
    cancel()
    mutate([])
    hasRequestedRef.current = false
  }, [service, paramsKey, cancel, mutate])

  useEffect(() => {
    if (!open || loading || hasRequestedRef.current) {
      return
    }

    hasRequestedRef.current = true
    run((params ?? {}) as P)
  }, [open, loading, run, params, paramsKey])

  useEffect(() => {
    if (!open && error) {
      hasRequestedRef.current = false
    }
  }, [open, error])

  return (
    <Select
      disabled={disabled}
      open={open}
      value={value}
      onOpenChange={setOpen}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          {loading ? (
            <div className="flex h-28 items-center justify-center">
              <Spinner />
            </div>
          ) : data.length > 0 ? (
            data.map((item) => {
              const itemValue = String(item[fieldNames.value])
              const itemLabel = String(item[fieldNames.label])

              return (
                <SelectItem key={itemValue} value={itemValue}>
                  {itemLabel}
                </SelectItem>
              )
            })
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              暂无数据
            </div>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
