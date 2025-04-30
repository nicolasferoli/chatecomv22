import { title } from 'process'
export type MessageType =
  | 'text'
  | 'question'
  | 'audio'
  | 'image'
  | 'buttons'
  | 'redirect'
  | 'section'
  | 'embed'

export type From = 'user' | 'bot'

export interface BaseMessage {
  id: string
  chatId: string
  from: From
  answer?: QuestionAnswer
  createdAt: Date
  updatedAt: Date
  isEditing?: boolean
}

export interface TextMessageType extends BaseMessage {
  type: 'text'
  content: {
    text: string
    hasDynamicDelay?: boolean
    delayValue?: number
  }
}

export interface QuestionMessageType extends BaseMessage {
  chatId: string
  id: string
  type: 'question'
  content: {
    text: string
    hasDynamicDelay?: boolean
    delayValue?: Number
    options: {
      type: 'text' | 'email' | 'wpp' | 'cpf' | 'number'
      variable: string
    }
  }
}

export interface QuestionTypesAwnser {
  type: 'text' | 'email' | 'wpp' | 'cpf' | 'number'
}

export interface RedirectMessageType extends BaseMessage {
  chatId: string
  id: string
  type: 'redirect'
  content: {
    url: string
    redirectBlank: boolean
  }
}

export interface AudioMessageType extends BaseMessage {
  type: 'audio'
  content: {
    media_name: string
    url: string
    initialAudio?: { url: string; name: string }
    hasDynamicDelay?: boolean
    delayValue?: number
  }
}

export interface ImageMessageType extends BaseMessage {
  type: 'image'
  content: {
    media_name: string
    url: string
    haveLegend: boolean
    legend: string
    hasDynamicDelay?: boolean
    delayValue?: any
  }
}
export interface EmbedMessageType extends BaseMessage {
  type: 'embed'
  content: {
    url: string
    embedType?: 'youtube' | 'vimeo' | 'pandavideo' | 'vturb'
  }
}

export type Message =
  | TextMessageType
  | QuestionMessageType
  | AudioMessageType
  | ImageMessageType
  | ButtonsMessageType
  | SectionMessageType
  | RedirectMessageType
  | EmbedMessageType

export interface SectionMessageType extends BaseMessage {
  type: 'section'
  content: {
    text: string
    isClosed: boolean
  }
}

export interface Chat {
  id: string
  name: string
  description: string
  bot_name: string
  bot_picture: string
  status: 'online' | 'offline' | 'busy'
  template: string
  createdAt: Date
  updatedAt: Date
  messages?: Message[]
  facebook_id?: string
  google_tag?: string
  tiktok_ads?: string
  seo_title?: string
  seo_description?: string
  favicon_url?: string
  share_image?: string
  theme?: string
  domains?: Domain[]
  verified: boolean
  hasNotifySound?: boolean
}

export interface Domain {
  id: string
  name: string
  status: string
  chat_id: string
}

export interface CreateChatRequest {
  name: string
  description?: string
  status?: 'online' | 'offline' | 'busy'
  favicon_url?: string
  Theme?: string
}

export interface UpdateChatRequest {
  chatId: string
  data: {
    name: string
    description: string
    status: 'online' | 'offline' | 'busy'
    favicon_url?: string
    Theme?: string
  }
}

export interface CreateMessageRequest {
  chatId: string
  type: MessageType
  content: {
    text?: string
    title?: string
    options?: {
      type: string
      variable: string
    }
    media_name?: string
    url?: string
    hasDynamicDelay?: boolean
    delayValue?: any
  }
}

export interface UpdateMessageRequest {
  chatId: string
  type: MessageType
  content: {
    text?: string
    options?: {
      type: string
      variable: string
    }
    media_name?: string
    url?: string
    isClosed?: boolean
  }
  index?: number
}

export interface BatchCreateMessageRequest {
  chatId: string
  messages: Omit<CreateMessageRequest, 'chatId'>[]
}

export interface BatchUpdateMessageRequest {
  chatId: string
  messages: {
    id: string
    type: MessageType
    content: {
      text?: string
      options?: {
        type: string
        variable: string
      }
      media_name?: string
      url?: string
    }
  }[]
}

export interface QuestionAnswer {
  id: string
  variableName: string
  answer: string
  from: From
  messageId: string
  chatId: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatState {
  id: string
  currentIndex: number
  answers: QuestionAnswer[]
}

export interface SaveAnswerRequest {
  chatId: string
  questionId: string
  answer: string
}

export interface GetChatStateResponse {
  currentIndex: number
  answers: QuestionAnswer[]
  nextMessages: Message[]
}

export interface ChatRequest {
  chatId: string
  answer?: string
  messageIndex: number
}

// Base Props for all message components
export interface BaseMessageProps {
  id: string
  messageSent: string
  messageReceived: string
  chatId: string
  dataReceived?: string
  canEdit?: boolean
}

// Props for creating messages
export interface CreateMessageProps {
  chatId: string
}

export interface CreateQuestionProps {
  chatId: string
}

// Props for editing messages
export interface EditMessageProps {
  oldHasDynamicDelay?: boolean
  oldMinutes?: string
  oldSeconds?: string
  oldMessage?: string
  chatId: string
  id: string
  initialAudio?: { url: string; name: string }
}

export interface EditAudioMessageProps {
  chatId: string
  id: string
  initialAudio: {
    url: string
    name: string
  }
  oldHasDynamicDelay: boolean
  oldSeconds: string
  oldMinutes: string
}

// Props specific to Audio Messages
export interface AudioMessageProps extends BaseMessageProps {
  from: 'user' | 'bot'
  url: string
  message?: string
}

// Props for Question Messages
export interface QuestionOptions {
  type: 'text' | 'email' | 'wpp' | 'cpf' | 'number'
  variable: string
}
export interface EmbedOptions {
  type: 'youtube' | 'vimeo' | 'pandavideo'
  variable: string
}

export interface RedirectMessageProps {
  text: string
  title: string
  url: string
  redirectBlank: boolean
}

export interface QuestionMessageProps extends BaseMessageProps {
  questionOptions: QuestionOptions
}

export interface EditQuestionProps extends EditMessageProps {
  questionOptions: QuestionOptions
  chatId: string
  id: string
}

export interface EditRedirectProps {
  oldUrl: string
  oldRedirectBlank: boolean
  chatId: string
  id: string
}

export interface ButtonsMessageProps extends BaseMessageProps {
  buttons: string[]
}

export interface EditButtonsMessageProps extends EditMessageProps {
  buttons: string[]
  chatId: string
  id: string
}

export interface ButtonsMessageType extends BaseMessage {
  type: 'buttons'
  content: {
    text: string
    buttons: string[]
    hasDynamicDelay?: boolean
    delayValue?: number
  }
}

export interface EditSectionMessageProps extends EditMessageProps {
  chatId: string
  id: string
  onEditCancel: () => void
}

// Media Data interfaces
export interface MediaData {
  url: string
  name: string
}

// Message Props for components that need message type
export interface MessageProps extends BaseMessageProps {
  id: string
  message?: string
  chatId: string
  canEdit?: boolean
  from?: 'user' | 'bot'
  url?: string
  questionOptions?: QuestionOptions
  type?: 'text' | 'question' | 'audio' | 'image'
}

export interface CreateMediaMessageProps {
  chatId: string
}

// Props for editing image messages
export interface EditImageProps extends EditMessageProps {
  id: string
  chatId: string
  initialHaveLegend: boolean
  initialLegend: string
  initialImage: { url: string; name: string }
}

export interface EditVideoProps extends EditMessageProps {
  id: string
  chatId: string
  initialVideo: { url: string; name: string }
}

// Props for editing audio messages
export interface EditAudioProps extends EditMessageProps {
  onChange: (name: string, url: string) => void
}

// Props for editing text messages
export interface EditTextProps extends EditMessageProps {
  onChange: (text: string) => void
}
