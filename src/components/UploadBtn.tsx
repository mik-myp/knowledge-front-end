import { useState } from "react"
import { getAllKnowledges } from "@/services/knowledge"
import { useRequest } from "ahooks"
import { documentsUpload } from "@/services/document"
import { App, Button, Form, Modal, Select, Spin, Upload } from "antd"
import { InboxOutlined, UploadOutlined } from "@ant-design/icons"
import type { UploadChangeParam, UploadFile } from "antd/es/upload"
import useDocumentsVersion from "@/stores/useDocumentsVersion"
import { useTranslation } from "react-i18next"

const { Dragger } = Upload
const uploadAccept = ".md,.pdf,.txt,.docx"
const maxUploadFileSize = 5 * 1024 * 1024

/**
 * 渲染上传Btn组件。
 * @param props 组件属性。
 * @param props.knowledgeId 知识库 ID。
 * @returns 返回组件渲染结果。
 */
const UploadBtn = ({
  knowledgeId,
  className,
}: {
  knowledgeId?: string
  className?: string
}) => {
  const { t } = useTranslation("document")
  const [modalOpen, setModalOpen] = useState(false)
  const { message } = App.useApp()

  const { invalidate } = useDocumentsVersion()

  const [form] = Form.useForm<{
    knowledgeId: string
    files: UploadFile<File>[]
  }>()

  const { runAsync: documentsUploadAsync, loading: documentsUploadLoading } =
    useRequest(documentsUpload, {
      manual: true,
    })

  const {
    data,
    runAsync: getAllKnowledgesAsync,
    loading: getAllKnowledgesLoading,
  } = useRequest(getAllKnowledges, {
    manual: true,
  })

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open)
  }

  const handleAfterClose = () => {
    form.resetFields()
  }

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      await getAllKnowledgesAsync()
    }
  }

  const handleOk = async () => {
    const validate = await form.validateFields()
    if (validate) {
      try {
        await documentsUploadAsync({
          knowledgeBaseId: validate.knowledgeId,
          files: validate.files.flatMap((item) =>
            item.originFileObj ? [item.originFileObj] : []
          ),
        })
        setModalOpen(false)
        invalidate()
      } catch {
        /* empty */
      }
    }
  }

  const normFile = (e?: UploadChangeParam) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  const beforeUpload = (file: File) => {
    const lowerCaseName = file.name.toLowerCase()
    const isSupportedFile =
      lowerCaseName.endsWith(".md") ||
      lowerCaseName.endsWith(".pdf") ||
      lowerCaseName.endsWith(".txt") ||
      lowerCaseName.endsWith(".docx")

    if (!isSupportedFile) {
      message.error(t("upload.errors.unsupportedFile"))
      return Upload.LIST_IGNORE
    }

    if (file.size > maxUploadFileSize) {
      message.error(t("upload.errors.fileTooLarge"))
      return Upload.LIST_IGNORE
    }

    return false
  }

  return (
    <>
      <Button
        icon={<UploadOutlined />}
        type="primary"
        onClick={() => handleModalOpenChange(true)}
        className={className}
      >
        {t("upload.button")}
      </Button>
      <Modal
        open={modalOpen}
        onCancel={() => handleModalOpenChange(false)}
        title={t("upload.modalTitle")}
        onOk={handleOk}
        confirmLoading={documentsUploadLoading}
        destroyOnHidden
        afterClose={handleAfterClose}
        width={700}
        centered
      >
        <div className="text-sm text-black/80">
          {knowledgeId ? "" : t("upload.helper")}
        </div>
        <Form
          form={form}
          className="mt-6"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 18,
          }}
          initialValues={{
            knowledgeId,
          }}
        >
          <Form.Item
            name="knowledgeId"
            label={t("upload.form.knowledgeBase.label")}
            rules={[
              {
                required: !knowledgeId,
                message: t("upload.form.knowledgeBase.required"),
              },
            ]}
            hidden={!!knowledgeId}
          >
            <Select
              onOpenChange={handleOpenChange}
              options={data}
              fieldNames={{
                label: "name",
                value: "id",
              }}
              loading={getAllKnowledgesLoading}
              popupRender={(originNode) => {
                return getAllKnowledgesLoading ? (
                  <Spin className="flex min-h-64 items-center justify-center" />
                ) : (
                  originNode
                )
              }}
            ></Select>
          </Form.Item>
          <Form.Item
            name="files"
            label={t("upload.form.file.label")}
            rules={[
              {
                required: true,
                message: t("upload.form.file.required"),
              },
            ]}
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Dragger
              name="files"
              accept={uploadAccept}
              beforeUpload={beforeUpload}
              multiple
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{t("upload.dragger.text")}</p>
              <p className="ant-upload-hint">{t("upload.dragger.hint")}</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default UploadBtn
