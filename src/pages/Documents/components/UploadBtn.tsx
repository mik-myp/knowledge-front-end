import { useState } from "react"
import { ensureObjectId } from "@/contracts/api-contracts"
import { getAllKnowledges } from "@/services/knowledge"
import { useRequest } from "ahooks"
import { documentsUpload } from "@/services/document"
import { Button, Form, Modal, Select, Spin, Upload } from "antd"
import { InboxOutlined, UploadOutlined } from "@ant-design/icons"
import type { UploadChangeParam, UploadFile } from "antd/es/upload"
import useDocumentsVersion from "@/stores/useDocumentsVersion"

const { Dragger } = Upload

/**
 * 渲染上传Btn组件。
 * @param props 组件属性。
 * @param props.knowledgeId 知识库 ID。
 * @returns 返回组件渲染结果。
 */
const UploadBtn = ({ knowledgeId }: { knowledgeId?: string }) => {
  const [modalOpen, setModalOpen] = useState(false)

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
          knowledgeBaseId: ensureObjectId(
            validate.knowledgeId,
            "knowledgeBaseId"
          ),
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
        confirmLoading={documentsUploadLoading}
        destroyOnHidden
        afterClose={handleAfterClose}
        width={700}
        centered
      >
        <div className="text-sm text-black/80">
          {knowledgeId ? "" : "请选择知识库并上传文件"}
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
            label="知识库"
            rules={[
              {
                required: !knowledgeId,
                message: "请选择知识库",
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
            label="文件"
            rules={[
              {
                required: true,
                message: "请上传文件",
              },
            ]}
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Dragger name="files" beforeUpload={() => false} multiple>
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
