import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enAiWrite from "@/locales/en/aiWrite.json"
import enAuth from "@/locales/en/auth.json"
import enChat from "@/locales/en/chat.json"
import enCommon from "@/locales/en/common.json"
import enDocument from "@/locales/en/document.json"
import enEditor from "@/locales/en/editor.json"
import enHome from "@/locales/en/home.json"
import enKnowledge from "@/locales/en/knowledge.json"
import enLayout from "@/locales/en/layout.json"
import enRequest from "@/locales/en/request.json"
import zhcnAiWrite from "@/locales/zh-cn/aiWrite.json"
import zhcnAuth from "@/locales/zh-cn/auth.json"
import zhcnChat from "@/locales/zh-cn/chat.json"
import zhcnCommon from "@/locales/zh-cn/common.json"
import zhcnDocument from "@/locales/zh-cn/document.json"
import zhcnEditor from "@/locales/zh-cn/editor.json"
import zhcnHome from "@/locales/zh-cn/home.json"
import zhcnKnowledge from "@/locales/zh-cn/knowledge.json"
import zhcnLayout from "@/locales/zh-cn/layout.json"
import zhcnRequest from "@/locales/zh-cn/request.json"

const resources = {
  en: {
    aiWrite: enAiWrite,
    auth: enAuth,
    chat: enChat,
    common: enCommon,
    document: enDocument,
    editor: enEditor,
    home: enHome,
    knowledge: enKnowledge,
    layout: enLayout,
    request: enRequest,
  },
  "zh-cn": {
    aiWrite: zhcnAiWrite,
    auth: zhcnAuth,
    chat: zhcnChat,
    common: zhcnCommon,
    document: zhcnDocument,
    editor: zhcnEditor,
    home: zhcnHome,
    knowledge: zhcnKnowledge,
    layout: zhcnLayout,
    request: zhcnRequest,
  },
}

i18n.use(initReactI18next).init({
  resources,
  supportedLngs: ["en", "zh-cn"],
  lng: "zh-cn",
  fallbackLng: "zh-cn",
  lowerCaseLng: true,
  load: "currentOnly",
  defaultNS: "common",
  fallbackNS: "common",
  ns: [
    "aiWrite",
    "auth",
    "chat",
    "common",
    "document",
    "editor",
    "home",
    "knowledge",
    "layout",
    "request",
  ],
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
