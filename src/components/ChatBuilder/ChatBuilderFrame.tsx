'use client'

import { useState, useEffect, useRef } from 'react'
import { useMessages } from '@/stores/useMessages'
import { Chat, CreateMessageRequest, MessageType } from '@/types'
import { QuestionMessage } from './Message/QuestionMessage'
import { CreateImageMessage, ImageMessage } from './Message/ImageMessage'
import CreateTextMessage, { TextMessage } from './Message/TextMessage'
import { CreateQuestionMessage } from './Message/QuestionMessage'
import { CreateAudioMessage } from './Message/AudioMessage'
import { AudioMessage } from './Message/AudioMessage'
import ChatBuilderDropdown from './ChatBuilderDropdown'
import ChatHeader from '@/components/Headers/ChatHeader'
import { IoInformationCircle } from 'react-icons/io5'
import { useModals } from '@/stores/useModals'
import {
  CreateRedirectMessage,
  EditRedirectMessage,
  RedirectMessage,
} from './Message/RedirectMessage'
import {
  CreateListButtonsMessage,
  ListButtonsMessage,
} from './Message/ListButtonsMessage'
import { CreateSectionMessage, SectionMessage } from './Message/SectionMessage'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { DragAndDropProvider } from '../DragAndDropProvider'
import { CreateEmbedMessage, EmbedMessage } from './Message/EmbedVideoMessage'
import Script from 'next/script'
import { Video } from 'lucide-react'

interface ChatBuilderFrameProps {
  chatId: string
  updatedChat: Chat
}

export default function ChatInterface({
  chatId,
  updatedChat,
}: ChatBuilderFrameProps) {
  // Estado das mensagens
  const {
    messages,
    getMessages,
    createMessage,
    loading: messagesLoading,
    startCreatingMessage,
    editingMessageId,
    setEditingMessageId,
    createEditingMessage,
    stopCreatingMessage,
    setMessages,
    updateMessages,
  } = useMessages()
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  // Carregar mensagens ao montar
  useEffect(() => {
    if (!chatId || initialLoadDone) return
    setInitialLoadDone(true)

    const loadMessages = async () => {
      await getMessages(chatId)
    }

    loadMessages()
  }, [chatId])

  const handleStartCreateMessage = async (type: string) => {
    let messageData: CreateMessageRequest = {
      chatId,
      type: 'text',
      content: {
        delayValue: 3000,
        hasDynamicDelay: true,
        text: '',
        options: {
          type: '',
          variable: '',
        },
      },
    }
    switch (type) {
      case 'text':
        messageData = {
          chatId,
          type: 'text',
          content: {
            text: '',
          },
        }
        break
      case 'question':
        messageData = {
          chatId,
          type: 'question',
          content: {
            text: '',
            options: {
              type: '',
              variable: '',
            },
          },
        }
        break
      case 'image':
        messageData = {
          chatId,
          type: 'image',
          content: {
            url: '',
          },
        }
      case 'embed':
        messageData = {
          chatId,
          type: 'embed',
          content: {
            url: '',
          },
        }
        break
      case 'audio':
        messageData = {
          chatId,
          type: 'audio',
          content: {
            url: '',
          },
        }
        break
    }

    startCreatingMessage(chatId, type as MessageType)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const chatMessages = messages[chatId] || []
    const reorderedMessages = Array.from(chatMessages)
    const [removed] = reorderedMessages.splice(result.source.index, 1)
    reorderedMessages.splice(result.destination.index, 0, removed)

    setMessages(chatId, reorderedMessages)
    updateMessages(chatId, reorderedMessages)
  }

  function formatTime(isoDate) {
    const date = new Date(isoDate)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    return `${formattedHours}:${formattedMinutes}`
  }

  const formatedDate = formatTime(new Date())

  // Renderizar mensagens
  const renderMessage = (message: any, index: number) => {
    const messageContent = (
      <>
        {message.type === 'text' && (
          <TextMessage
            id={message.id}
            key={`text-${message.id}`}
            chatId={chatId}
            canEdit={true}
            formatedDate={formatedDate}
          />
        )}
        {message.type === 'question' && message.content?.text && (
          <div
            key={`question-wrapper-${message.id}`}
            className='mb-2 flex w-full flex-col pr-5'
          >
            <QuestionMessage
              id={message.id}
              key={`question-${message.id}`}
              chatId={chatId}
              canEdit={true}
              formatedDate={formatedDate}
            />
          </div>
        )}
        {message.type === 'image' && (
          <ImageMessage
            id={message.id}
            key={`image-${message.id}`}
            chatId={chatId}
            canEdit={true}
            formatedDate={formatedDate}
          />
        )}
        {message.type === 'embed' && (
          <EmbedMessage
            id={message.id}
            key={`image-${message.id}`}
            chatId={chatId}
            canEdit={true}
            formatedDate={formatedDate}
          />
        )}
        {message.type === 'audio' && (
          <AudioMessage
            id={message.id}
            key={`audio-${message.id}`}
            chatId={chatId}
            canEdit={true}
            favIconUrl={updatedChat?.favicon_url || ''}
            chatName={updatedChat?.bot_name}
            createdAt={message.createdAt}
            formatedDate={formatedDate}
          />
        )}
        {message.type === 'buttons' && (
          <ListButtonsMessage
            id={message.id}
            key={`buttons-${message.id}`}
            chatId={chatId}
            canEdit={true}
            onButtonClick={() => {}}
          />
        )}
        {message.type === 'section' && (
          <SectionMessage
            id={message.id}
            key={`section-${message.id}`}
            chatId={chatId}
            canEdit={true}
          />
        )}
        {message.type === 'redirect' && (
          <RedirectMessage
            id={message.id}
            key={`redirect-${message.id}`}
            chatId={chatId}
            canEdit={true}
          />
        )}
      </>
    )

    return messageContent
  }

  // Auto-scroll para novas mensagens
  useEffect(() => {
    const chatMessages = messages[chatId] || []
    const messagesContainer = messagesContainerRef.current

    // Só ajusta o scroll se houver uma nova mensagem adicionada
    if (chatMessages.length > 0 && messagesContainer) {
      const isAtBottom =
        messagesContainer.scrollHeight - messagesContainer.scrollTop <=
        messagesContainer.clientHeight + 100

      if (isAtBottom) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }
  }, [messages, chatId])

  // Empty state
  const isEmpty = !messages[chatId]?.length && !messagesLoading

  return (
    <div className='relative flex h-full max-h-[calc(100vh-200px)] w-screen flex-col rounded-t-[10px] bg-transparent'>
      <ChatHeader
        userName={updatedChat?.bot_name}
        favIconUrl={updatedChat?.favicon_url || ''}
        isVerified={updatedChat?.verified}
        userStatus={updatedChat?.status}
        isLoading={messagesLoading}
        hasMessages={!isEmpty}
        className={
          'absolute top-0 z-50 ml-4 flex h-16 w-[calc(100%-16px)] cursor-pointer items-center justify-center rounded-t-[10px] bg-[#075f58] px-4 py-2 md:h-[79px] md:px-6'
        }
      />
      <div
        className={`z-0 flex w-full flex-col overflow-y-auto rounded-xl pl-4`}
        ref={messagesContainerRef}
      >
        {/* flex h-16 w-full cursor-pointer items-center justify-center rounded-t-[10px] bg-[#075f58] px-4 py-2 md:h-[79px] md:px-6 */}
        <div
          className={`w-full rounded-t-[10px] ${
            updatedChat?.theme === 'whatsapp-dark'
              ? 'bg-darkWhatsappBackground text-white'
              : 'bg-whatsappBackground'
          }`}
        >
          <div className='min-h-[calc(100vh-300px)] w-full max-w-full pb-[100px] pt-4'>
            {isEmpty && !createEditingMessage ? (
              <div className='mt-[200px] flex flex-1 flex-col items-center justify-center px-4 text-center'>
                <h2 className="mb-4 font-['Inter'] text-lg font-semibold leading-7 md:w-[319px]">
                  Sua conversa está vazia!
                </h2>
                <ChatBuilderDropdown
                  chatId={chatId}
                  handleCreateMessage={handleStartCreateMessage}
                />
              </div>
            ) : (
              <div className='mt-[80px] h-fit'>
                <DragDropContext onDragEnd={handleDragEnd}>
                  {messages[chatId]?.map((message, index) => (
                    <div key={`message-${message.id}`}>
                      {renderMessage(message, index)}
                    </div>
                  ))}
                </DragDropContext>
              </div>
            )}

            <div className='flex w-full flex-col pr-8'>
              {createEditingMessage?.chatId === chatId && (
                <>
                  {createEditingMessage.type === 'question' && (
                    <CreateQuestionMessage
                      key={`create-question-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                  {createEditingMessage.type === 'text' && (
                    <CreateTextMessage
                      key={`create-text-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                  {createEditingMessage.type === 'image' && (
                    <CreateImageMessage
                      key={`create-image-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                  {createEditingMessage.type === 'embed' && (
                    <CreateEmbedMessage
                      key={`create-image-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                  {createEditingMessage.type === 'audio' && (
                    <CreateAudioMessage
                      key={`create-audio-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                  {createEditingMessage.type === 'buttons' && (
                    <CreateListButtonsMessage
                      key={`create-buttons-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                  {createEditingMessage.type === 'section' && (
                    <CreateSectionMessage
                      key={`create-section-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                  {createEditingMessage.type === 'redirect' && (
                    <CreateRedirectMessage
                      key={`create-redirect-${Math.random()}`}
                      chatId={chatId}
                    />
                  )}
                </>
              )}
              {!isEmpty && !createEditingMessage && (
                <div className='py-1'>
                  <ChatBuilderDropdown
                    chatId={chatId}
                    handleCreateMessage={handleStartCreateMessage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
