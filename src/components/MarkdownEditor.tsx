import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  toolbarPlugin,
  quotePlugin,
  listsPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  markdownShortcutPlugin,
  type MDXEditorProps,
  imagePlugin,
  KitchenSinkToolbar,
  sandpackPlugin,
  type SandpackConfig,
} from "@mdxeditor/editor"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import i18n from "@/lib/i18n"
import { useGlobal } from "@/stores/useGlobal"
import { useTranslation } from "react-i18next"

const codeBlockLanguages = {
  txt: "Plain Text",
  text: "Text",
  plaintext: "Plain Text",
  md: "Markdown",
  markdown: "Markdown",
  html: "HTML",
  xml: "XML",
  css: "CSS",
  scss: "SCSS",
  less: "Less",
  js: "JavaScript",
  jsx: "JavaScript React",
  ts: "TypeScript",
  tsx: "TypeScript React",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  powershell: "PowerShell",
  ps1: "PowerShell",
  python: "Python",
  py: "Python",
  java: "Java",
  kotlin: "Kotlin",
  kt: "Kotlin",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  c: "C",
  cpp: "C++",
  cxx: "C++",
  cs: "C#",
  sql: "SQL",
  php: "PHP",
  ruby: "Ruby",
  rb: "Ruby",
  swift: "Swift",
  dart: "Dart",
  dockerfile: "Dockerfile",
  nginx: "Nginx",
  ini: "INI",
  toml: "TOML",
  graphql: "GraphQL",
} as const

const virtuosoSampleSandpackConfig: SandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live react",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
    },
    {
      label: "React",
      name: "react",
      meta: "live",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
    },
    {
      label: "Virtuoso",
      name: "virtuoso",
      meta: "live virtuoso",
      sandpackTemplate: "react-ts",
      sandpackTheme: "light",
      snippetFileName: "/App.tsx",
      dependencies: {
        "react-virtuoso": "latest",
        "@ngneat/falso": "latest",
      },
    },
  ],
}

const MarkdownEditor = forwardRef<
  MDXEditorMethods,
  {
    toolbarClassName?: string
  } & MDXEditorProps
>(({ toolbarClassName, markdown, onChange, ...props }, ref) => {
  const language = useGlobal((state) => state.language)
  const { t } = useTranslation("editor")
  const localizedCodeBlockLanguages = {
    "": t("codeBlockLanguages.unspecified"),
    ...codeBlockLanguages,
  } as const
  const editorRef = useRef<MDXEditorMethods>(null)
  const latestMarkdownRef = useRef(markdown)

  useImperativeHandle(ref, () => editorRef.current as MDXEditorMethods, [])

  useEffect(() => {
    if (markdown === latestMarkdownRef.current) {
      return
    }

    editorRef.current?.setMarkdown(markdown)
    latestMarkdownRef.current = markdown
  }, [markdown])

  const plugins = [
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    sandpackPlugin({ sandpackConfig: virtuosoSampleSandpackConfig }),
    codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
    codeMirrorPlugin({
      codeBlockLanguages: localizedCodeBlockLanguages,
    }),
    diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
    markdownShortcutPlugin(),
    directivesPlugin({
      directiveDescriptors: [AdmonitionDirectiveDescriptor],
    }),
    toolbarPlugin({
      toolbarClassName,
      toolbarContents: () => <KitchenSinkToolbar />,
    }),
  ]

  return (
    <MDXEditor
      key={language}
      ref={editorRef}
      {...props}
      markdown={markdown}
      onChange={(nextMarkdown, initialMarkdownNormalize) => {
        latestMarkdownRef.current = nextMarkdown
        onChange?.(nextMarkdown, initialMarkdownNormalize)
      }}
      plugins={plugins}
      translation={(key, defaultValue, interpolations): string => {
        return i18n.t(key, {
          lng: language,
          ns: "editor",
          defaultValue,
          ...(interpolations ?? {}),
        })
      }}
    />
  )
})

MarkdownEditor.displayName = "MarkdownEditor"

export default MarkdownEditor
