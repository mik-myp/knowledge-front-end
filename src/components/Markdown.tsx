import { CodeHighlighter } from "@ant-design/x"
import XMarkdown, {
  type ComponentProps,
  type XMarkdownProps,
} from "@ant-design/x-markdown"
import "@ant-design/x-markdown/themes/light.css"

const getCodeContent = (children: ComponentProps["children"]) => {
  if (typeof children === "string") {
    return children
  }

  if (Array.isArray(children)) {
    return children.join("")
  }

  return ""
}

const MarkdownCode = ({ block, children, className, lang }: ComponentProps) => {
  const content = getCodeContent(children).replace(/\n$/, "")
  const normalizedLang = lang?.trim().split(/\s+/)[0] || ""

  if (!block) {
    return <code className={className}>{children}</code>
  }

  if (!content) {
    return null
  }

  return (
    <CodeHighlighter
      lang={normalizedLang}
      header={false}
      classNames={{
        code: "border-none",
      }}
      prismLightMode
    >
      {content}
    </CodeHighlighter>
  )
}

const Markdown = ({ className, components, ...restProps }: XMarkdownProps) => {
  return (
    <XMarkdown
      {...restProps}
      paragraphTag="div"
      openLinksInNewTab
      escapeRawHtml
      className={["x-markdown-light", className].filter(Boolean).join(" ")}
      components={{
        ...components,
        code: MarkdownCode,
      }}
    />
  )
}

export default Markdown
