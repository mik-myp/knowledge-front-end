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

const codeBlockLanguages = {
  "": "未指定",
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
  return (
    <MDXEditor
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
          codeBlockLanguages,
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
    />
  )
}
export default MarkdownEditor
