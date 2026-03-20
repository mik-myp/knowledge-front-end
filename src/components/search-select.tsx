import { useRequest } from "ahooks"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "./ui/spinner"
import type { Options, Service } from "ahooks/lib/useRequest/src/types"

export function SearchSelect({
  service,
  options,
  fieldNames = {
    label: "label",
    value: "value",
  },
  placeholder = "请选择",
  disabled,
}: {
  service: Service<unknown, unknown[]>
  options?: Options<unknown, unknown[]>
  fieldNames?: {
    label: string
    value: string
  }
  disabled?: boolean
  placeholder?: string
}) {
  const { data = [], loading = false } = useRequest(service, options)

  return (
    <Select disabled={disabled}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          {loading ? (
            <Spinner />
          ) : Array.isArray(data) ? (
            data.map((item) => {
              return (
                <SelectItem value={item[fieldNames.label]}>
                  {item[fieldNames.value]}
                </SelectItem>
              )
            })
          ) : (
            <></>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
