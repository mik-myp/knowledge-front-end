import request from "@/lib/request"

export async function documnetsUpload(data: FormData) {
  return await request("/documnets/upload", {
    method: "POST",
    data,
  })
}
