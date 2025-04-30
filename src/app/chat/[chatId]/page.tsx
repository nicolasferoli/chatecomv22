import { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import { getChat, getMessages } from './actions/chat-queries'
import { WhatsAppChat } from './components/whatsapp-chat'

type ChatParams = {
  params: Promise<{
    chatId: string
  }>
}

export default async function ChatPage({ params }: ChatParams) {
  const { chatId } = await params

  const [chatInfo, automationMessages] = await Promise.all([
    getChat(chatId),
    getMessages(chatId),
  ])
  if (chatInfo == null) return

  return (
    <>
      <WhatsAppChat
        chatInfo={chatInfo}
        messages={automationMessages.filter((m) => m.type !== 'section')}
      />
      <ToastContainer />
    </>
  )
}

export async function generateMetadata({
  params,
}: ChatParams): Promise<Metadata> {
  const { chatId } = await params
  const chatInfo = await getChat(chatId)

  const properties = {
    icon: chatInfo?.favicon_url || '/favicon.ico',
    title: chatInfo?.seo_title || `💬 ${chatInfo?.bot_name}`,
    description:
      chatInfo?.seo_description || chatInfo?.description || 'Chat interativo',
    shareImage: chatInfo?.share_image || '/share.png',
  }

  return {
    title: properties.title,
    description: properties.description,

    icons: { icon: properties.icon, apple: properties.icon },
    openGraph: {
      title: properties.title,
      description: properties.description,
      images: [{ url: properties.shareImage }],
    },
    twitter: {
      title: properties.title,
      description: properties.description,
      images: [{ url: properties.shareImage }],
    },
  }
}
