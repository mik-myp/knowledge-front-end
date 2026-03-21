import { useState } from "react"
import { getAllKnowledges } from "@/services/knowledge"
import { useRequest } from "ahooks"
import { documnetsUpload } from "@/services/document"
import type { TDocumentRecord } from "@/types/documents"
import { Button, Form, Modal, Select, Spin, Upload } from "antd"
import { InboxOutlined, UploadOutlined } from "@ant-design/icons"

const { Dragger } = Upload

const UploadBtn = ({
  refreshAsync,
}: {
  refreshAsync: () => Promise<{
    list: TDocumentRecord[]
    total: number
  }>
}) => {
  const [modalOpen, setModalOpen] = useState(false)

  const [form] = Form.useForm<{
    knowledgeId: string
    file: { file: File; fileList: File & { originFileObj: File }[] }
  }>()

  const { runAsync: documnetsUploadAsync, loading: documnetsUploadLoading } =
    useRequest(documnetsUpload, {
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
      console.log(validate)
      const formData = new FormData()

      formData.append("file", validate.file.file)
      formData.append("knowledgeBaseId", validate.knowledgeId)

      try {
        await documnetsUploadAsync(formData)
        setModalOpen(false)
        await refreshAsync()
      } catch {
        /* empty */
      }
    }
  }

  return (
    <>
      <Button
        icon={<UploadOutlined />}
        type="primary"
        onClick={() => handleModalOpenChange(true)}
      >
        上传文件
      </Button>
      <Modal
        open={modalOpen}
        onCancel={() => handleModalOpenChange(false)}
        title="上传文件"
        onOk={handleOk}
        confirmLoading={documnetsUploadLoading}
        destroyOnHidden
        afterClose={handleAfterClose}
      >
        <div className="text-sm text-black/80">选择知识库并上传文件</div>
        <Form
          form={form}
          className="mt-6"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 18,
          }}
        >
          <Form.Item
            name="knowledgeId"
            label="知识库"
            rules={[
              {
                required: true,
                message: "请选择知识库",
              },
            ]}
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
            name="file"
            label="文件"
            rules={[
              {
                required: true,
                message: "请上传文件",
              },
            ]}
          >
            <Dragger name="file" beforeUpload={() => false} multiple>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">单击或拖动文件到此区域进行上传</p>
              <p className="ant-upload-hint">支持单次或批量上传</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default UploadBtn
