import {
  MDXEditor,
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

const MarkdownEditor = ({
  toolbarClassName,
  ...props
}: {
  toolbarClassName?: string
} & MDXEditorProps) => {
  const language = useGlobal((state) => state.language)
  const { t } = useTranslation("editor")
  const localizedCodeBlockLanguages = {
    "": t("codeBlockLanguages.unspecified"),
    ...codeBlockLanguages,
  } as const

  return (
    <MDXEditor
      key={language}
      {...props}
      plugins={[
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
        directivesPlugin({
          directiveDescriptors: [AdmonitionDirectiveDescriptor],
        }),
        diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName,
          toolbarContents: () => <KitchenSinkToolbar />,
        }),
      ]}
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
}
export default MarkdownEditor
