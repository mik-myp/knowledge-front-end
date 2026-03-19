import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FieldErrorItem = { message?: string } | undefined

type AuthInputFieldProps = {
  field: {
    name: string
    state: {
      value: string
      meta: {
        isTouched: boolean
        isValid: boolean
        errors?: FieldErrorItem[]
      }
    }
    handleBlur: () => void
    handleChange: (value: string) => void
  }
  label: string
  placeholder: string
  type?: React.ComponentProps<typeof Input>["type"]
}

const AuthInputField = ({
  field,
  label,
  placeholder,
  type = "text",
}: AuthInputFieldProps) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  )
}

export default AuthInputField
