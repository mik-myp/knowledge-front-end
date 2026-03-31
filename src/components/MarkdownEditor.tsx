import {
  MDXEditor,
  headingsPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  BlockTypeSelect,
  quotePlugin,
  listsPlugin,
  Separator,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  CodeToggle,
  ListsToggle,
  InsertTable,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  HighlightToggle,
  StrikeThroughSupSubToggles,
  CreateLink,
  InsertThematicBreak,
  InsertCodeBlock,
  InsertAdmonition,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  markdownShortcutPlugin,
  DiffSourceToggleWrapper,
  ConditionalContents,
  ChangeAdmonitionType,
  ChangeCodeMirrorLanguage,
  ShowSandpackInfo,
  type EditorInFocus,
  DirectiveNode,
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

function whenInAdmonition(editorInFocus: EditorInFocus | null) {
  const node = editorInFocus?.rootNode
  if (!node || node.getType() !== "directive") {
    return false
  }

  return ["note", "tip", "danger", "info", "caution"].includes(
    (node as DirectiveNode).getMdastNode().name
  )
}

const MarkdownEditor = ({
  markdown,
  onChange,
}: {
  markdown: string
  onChange: (markdown: string, initialMarkdownNormalize: boolean) => void
}) => {
  const language = useGlobal((state) => state.language)
  const { t } = useTranslation("editor")
  const localizedCodeBlockLanguages = {
    "": t("codeBlockLanguages.unspecified"),
    ...codeBlockLanguages,
  } as const

  return (
    <MDXEditor
      key={language}
      markdown={markdown}
      onChange={onChange}
      plugins={[
        listsPlugin(),
        quotePlugin(),
        headingsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        frontmatterPlugin(),
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
          toolbarClassName: "rounded-tl-2xl! rounded-tr-2xl! top-19!",
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <ConditionalContents
                options={[
                  {
                    when: (editor) => editor?.editorType === "codeblock",
                    contents: () => <ChangeCodeMirrorLanguage />,
                  },
                  {
                    when: (editor) => editor?.editorType === "sandpack",
                    contents: () => <ShowSandpackInfo />,
                  },
                  {
                    fallback: () => (
                      <>
                        <UndoRedo />
                        <Separator />
                        <BoldItalicUnderlineToggles />
                        <CodeToggle />
                        <HighlightToggle />
                        <Separator />
                        <StrikeThroughSupSubToggles />
                        <Separator />
                        <ListsToggle />
                        <Separator />

                        <ConditionalContents
                          options={[
                            {
                              when: whenInAdmonition,
                              contents: () => <ChangeAdmonitionType />,
                            },
                            { fallback: () => <BlockTypeSelect /> },
                          ]}
                        />

                        <Separator />

                        <CreateLink />

                        <Separator />

                        <InsertTable />
                        <InsertThematicBreak />

                        <Separator />
                        <InsertCodeBlock />

                        <ConditionalContents
                          options={[
                            {
                              when: (editorInFocus) =>
                                !whenInAdmonition(editorInFocus),
                              contents: () => (
                                <>
                                  <Separator />
                                  <InsertAdmonition />
                                </>
                              ),
                            },
                          ]}
                        />

                        <Separator />
                      </>
                    ),
                  },
                ]}
              />
            </DiffSourceToggleWrapper>
          ),
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
