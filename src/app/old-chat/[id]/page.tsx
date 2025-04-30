'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
  Message,
  TextMessageType,
} from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { TextMessage } from '@/components/ChatBuilder/Message/TextMessage'
import { useMessages } from '@/stores/useMessages'
import { ImageMessage } from '@/components/ChatBuilder/Message/ImageMessage'
import ChatHeader from '@/components/Headers/ChatHeader'
import { AudioMessage } from '@/components/ChatBuilder/Message/AudioMessage'
import Image from 'next/image'
import { ListButtonsMessage } from '@/components/ChatBuilder/Message/ListButtonsMessage'
import { IoSend } from 'react-icons/io5'
import { useChats } from '@/stores/useChats'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { RedirectMessage } from '@/components/ChatBuilder/Message/RedirectMessage'
import CustomMetatag from '@/components/CustomMetatag'
import CustomMarketingTags from '@/components/CustomMarketingTags'
import DomainProvider from '@/components/DomainProvider'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { InputMask, useMask } from '@react-input/mask'
import { isCpfOrCnpjValid } from 'lual-utils'
import { motion } from 'framer-motion'
import { EmbedMessage } from '@/components/ChatBuilder/Message/EmbedVideoMessage'
import { ChatAction } from '@prisma/client'

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [chatId, setChatId] = useState('')
  const [isInputEnabled, setIsInputEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputMessageIsLoading, setInputMessageIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [runId, setRunId] = useState('')
  const [waitButtonClick, setWaitButtonClick] = useState(false)
  const { getMessages } = useMessages()
  const { getChat, chats } = useChats()
  const [imageData, setImageData] = useState('')
  const [questionMessagesTypes, setQuestionMessagesTypes] = useState<any>('')
  const [messageVariable, setMessageVariable] = useState<string>('')
  const [messageTextQuestion, setMessageTextQuestion] = useState('')
  const [updatedChat, setUpdatedChat] = useState<any>({
    id: '',
    name: '',
    description: '',
    favicon_url: '',
    Theme: '',
    domains: [],
    bot_name: '',
    bot_picture: '',
    userStatus: 'online',
    isVerified: false,
    // hasNotifySound: false,
  })

  useEffect(() => {
    const currentChat = chats.find((chat) => chat.id === chatId)
    if (currentChat) {
      setUpdatedChat({
        id: currentChat.id,
        name: currentChat.name || '',
        description: currentChat.description || '',
        favicon_url: currentChat.favicon_url || '',
        domains: currentChat.domains || [],
        bot_name: currentChat.bot_name || '',
        bot_picture: currentChat.favicon_url || '',
        theme: currentChat.theme || '',
        verified: currentChat.verified,
        status: currentChat.status,
        // hasNotifySound: currentChat.hasNotifySound,
      })
      setImageData(currentChat.favicon_url || '')
    }
  }, [chats, chatId])

  useEffect(() => {
    if (chatId) getChat(chatId)
  }, [chatId])

  useEffect(() => {
    if (chatId) getMessages(chatId)
  }, [chatId])

  // Atualiza o chatId quando mudar o parâmetro da URL
  useEffect(() => {
    setChatId(params.id as string)
  }, [params.id])

  // Inicia uma nova sessão de chat quando o chatId é definido
  useEffect(() => {
    if (!chatId) return
    const newRunId = uuidv4()
    setRunId(newRunId)
    loadMessage(0, newRunId)
  }, [chatId])

  const addActionLog = async (
    chatId: string,
    action: string,
    opts?: {
      question_type?: string
      question_variable?: string
      question_answer?: string
      button_question?: string
      button_answer?: string
      clicked_link_url?: string
      flux_completed_value?: boolean
      question_text?: string
    }
  ) => {
    const isPreview = searchParams.get('isPreview')

    if (isPreview === 'true') {
      return
    }

    const response = await fetch('/api/chatlogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, action, ...opts }),
    })
  }

  useEffect(() => {
    if (!chatId) return // Garante que o chatId existe antes de tentar adicionar o log
    addActionLog(chatId, ChatAction.viewed)
  }, [chatId]) // Executa apenas quando o chatId muda

  // Carrega uma mensagem específica do chat pelo índice
  const loadMessage = async (messageIndex: number, currentRunId: string) => {
    if (isLoading || !chatId) return
    setIsLoading(true)

    try {
      // Busca a mensagem da API
      const response = await fetch(
        `/api/chat/messageByIndex?chatId=${chatId}&messageIndex=${messageIndex}&runId=${currentRunId}`
      )
      if (!response.ok) throw new Error('Failed to load message')

      const data = await response.json()
      setQuestionMessagesTypes(data?.message?.content?.options?.type)
      if (
        data?.message?.content.options?.type === 'text' ||
        'email' ||
        'cpf' ||
        'wpp' ||
        'number'
      ) {
        setMessageTextQuestion(data?.message?.content.text)
      }
      const messageVariableData = data?.message?.content.options?.variable
      setMessageVariable(messageVariableData)

      if (data.error) {
        console.error('Server error:', data.error)
        return
      }

      // Verifica se o chat foi finalizado
      if (data.completed) {
        await addActionLog(chatId, ChatAction.flux_completed, {
          flux_completed_value: true,
        })
        return
      }

      if (data.message) {
        // Adiciona a nova mensagem ao estado

        //adiciona delay inteligente com base no tamanho do texto - máximo 2 segundos

        if (data.message.content.hasDynamicDelay === false) {
          await new Promise((resolve) => {
            setTimeout(resolve, data.message.content.delayValue)
          })
        }

        await new Promise((resolve) => {
          const delay = data?.message?.content?.text
            ? Math.min(50 * data.message.content.text.length, 3000)
            : 1000
          setTimeout(resolve, delay)
        })

        const currentTime = new Date().toISOString()

        const newMessage: Message = {
          ...data.message,
          createdAt: currentTime, // Adicione o horário ao objeto da mensagem
        }

        setMessages((prev) => [...prev, newMessage])
        setCurrentIndex(messageIndex)

        // Se for uma pergunta, habilita input do usuário

        if (data.message.type === 'question') {
          setIsInputEnabled(true)
        } else if (data.message.type === 'buttons') {
          setWaitButtonClick(true)
        } else {
          // Se não for pergunta, carrega próxima mensagem após delay
          setTimeout(() => {
            loadMessage(messageIndex + 1, currentRunId)
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error loading message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // regex
  function isEmailValid(email: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  function isCpfValid(cpf: string) {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    return cpfRegex.test(cpf)
  }

  function isWhatsappValid(whatsapp: string) {
    const whatsappRegex = /^\+55 \(\d{2}\) \d{4,5}-\d{4}$/
    return whatsappRegex.test(whatsapp)
  }

  function isNumberValid(input: string) {
    const numberRegex = /^[0-9]+$/
    return numberRegex.test(input)
  }

  // Processa o envio de mensagem do usuário
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    if (questionMessagesTypes === 'text' && inputMessage === '') {
      toast.warn('Sua resposta precisa ser uma mensagem válida')
    }
    if (questionMessagesTypes === 'email' && !isEmailValid(inputMessage)) {
      toast.warn('Sua resposta precisa ser um email válido')
      return
    }
    if (
      questionMessagesTypes === 'cpf' &&
      isCpfOrCnpjValid(inputMessage) === false
    ) {
      toast.warn('Sua resposta precisa ser um CPF válido')
      return
    }
    if (questionMessagesTypes === 'wpp' && !isWhatsappValid(inputMessage)) {
      toast.warn('Sua resposta precisa ser um WhatsApp válido')
      return
    }
    if (questionMessagesTypes === 'number' && !isNumberValid(inputMessage)) {
      toast.warn('Sua resposta precisa ser um número')
      return
    }

    setInputMessageIsLoading(true)

    try {
      // Envia resposta para API
      const response = await fetch('/api/chat/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          answer: inputMessage,
          messageIndex: currentIndex,
          runId,
        }),
      })

      await addActionLog(chatId, ChatAction.answered_question, {
        question_type: questionMessagesTypes,
        question_answer: inputMessage,
        question_variable: messageVariable,
        question_text: messageTextQuestion,
      })

      if (!response.ok) throw new Error('Failed to send answer')

      const result = await response.json()

      if (result.error) {
        console.error('Server error:', result.error)
        setIsInputEnabled(true)
        return
      }

      // Adiciona mensagem do usuário ao chat
      const userMessage: Message = {
        id: crypto.randomUUID(),
        type: 'text',
        content: { text: inputMessage },
        from: 'user',
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setIsInputEnabled(false)
      setInputMessageIsLoading(false)
      setMessages((prev) => [...prev, userMessage])
      setInputMessage('')

      // Verifica se há próxima mensagem para carregar
      if (result.data?.nextIndex !== undefined) {
        // Carrega próxima mensagem após delay
        setTimeout(() => {
          loadMessage(result.data.nextIndex, runId)
        }, 1000)
      } else {
        console.error('No next index received from server')
        setIsInputEnabled(true)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsInputEnabled(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = async (question: string, answer: string) => {
    await addActionLog(chatId, ChatAction.clicked_button, {
      button_question: question,
      button_answer: answer,
    })
    setWaitButtonClick(false)
    loadMessage(currentIndex + 1, runId)
  }

  function formatTime(isoDate) {
    const date = new Date(isoDate)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    return `${formattedHours}:${formattedMinutes}`
  }

  const isPreview = searchParams.get('isPreview')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Rola para o final do contêiner sempre que o array de mensagens mudar
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // const playSound = () => {
  //   let audio = document.getElementById('notification') as HTMLAudioElement
  //   audio.play()
  // }

  // useEffect(() => {
  //   if (updatedChat?.hasNotifySound) {
  //     playSound()
  //   }
  // }, [messages])

  return (
    <DomainProvider chatId={chatId}>
      <CustomMetatag
        title={updatedChat?.seo_title || updatedChat?.name || 'sChat'}
        description={
          updatedChat?.seo_description ||
          updatedChat?.description ||
          'Interactive chat experience'
        }
        favicon={updatedChat?.favicon_url || '/favicon.ico'}
        share_image={updatedChat?.share_image || '/share.png'}
      />
      <CustomMarketingTags
        facebookPixelId={updatedChat?.facebook_id}
        tiktokPixelId={updatedChat?.tiktok_ads}
        googleTagId={updatedChat?.google_tag}
      />
      <div className='flex min-h-screen flex-col bg-gray-100 bg-whatsappBackground'>
        <ChatHeader
          isVerified={updatedChat?.verified}
          favIconUrl={updatedChat?.favicon_url}
          userName={updatedChat?.bot_name}
          userStatus={updatedChat?.status}
          isLoading={isLoading}
          hasMessages={messages.length > 0}
          className={
            'absolute top-0 z-50 flex h-16 w-full cursor-pointer items-center justify-center overflow-y-auto bg-[#075f58] px-4 py-2 md:h-[79px] md:px-6'
          }
        />
        <main className='mt-6 flex-1 overflow-y-auto pb-20 md:mt-10'>
          <div className='mx-auto mt-14 flex max-w-6xl flex-col'>
            <DragDropContext onDragEnd={() => {}}>
              {/* Renderiza as mensagens do chat */}
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'text' || message.type === 'question' ? (
                    <TextMessage
                      id={message.id}
                      chatId={message.chatId}
                      message={message as TextMessageType}
                      canEdit={false}
                      formatedDate={formatTime(message.createdAt)}
                    />
                  ) : message.type === 'image' ? (
                    <ImageMessage
                      id={message.id}
                      chatId={message.chatId}
                      canEdit={false}
                      formatedDate={formatTime(message.createdAt)}
                    />
                  ) : message.type === 'audio' ? (
                    <AudioMessage
                      id={message.id}
                      chatId={chatId}
                      canEdit={false}
                      favIconUrl={updatedChat?.favicon_url}
                      chatName={updatedChat?.name}
                      createdAt={message.createdAt}
                      formatedDate={formatTime(message.createdAt)}
                    />
                  ) : message.type === 'embed' ? (
                    <EmbedMessage
                      id={message.id}
                      chatId={chatId}
                      canEdit={false}
                      formatedDate={formatTime(message.createdAt)}
                    />
                  ) : message.type === 'buttons' ? (
                    <ListButtonsMessage
                      id={message.id}
                      chatId={message.chatId}
                      canEdit={false}
                      onButtonClick={(clickedButton: string) => {
                        handleButtonClick(message.content.text, clickedButton)
                      }}
                    />
                  ) : message.type === 'redirect' ? (
                    <RedirectMessage
                      id={message.id}
                      chatId={message.chatId}
                      canEdit={false}
                    />
                  ) : null}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </DragDropContext>
            {isLoading && (
              <div className='mx-8 mt-4 flex justify-start'>
                <div className='relative flex w-fit max-w-[390px] justify-start rounded-lg bg-white p-3 text-black shadow-sm hover:drop-shadow-md'>
                  <Image
                    className='rotate absolute -left-2 top-0'
                    src={'/Polygon.svg'}
                    width={15}
                    height={4}
                    alt='polygon'
                  />
                  <div className='flex space-x-1 p-1'>
                    {['dot1', 'dot2', 'dot3'].map((dot, index) => (
                      <motion.div
                        key={dot}
                        className='h-2 w-2 rounded-full bg-gray-400'
                        animate={{
                          y: [0, -6, 0], // Movimento de "subir e descer"
                        }}
                        transition={{
                          duration: 0.8, // Duração do ciclo completo
                          repeat: Infinity, // Animação infinita
                          delay: index * 0.2, // Atraso incremental para cada bolinha
                          ease: 'easeInOut', // Suavização
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {inputMessageIsLoading && (
              <div className='mx-8 mt-4 flex justify-start'>
                <div className='relative ml-auto flex h-fit w-fit min-w-[85px] max-w-[390px] justify-center gap-3 self-center text-wrap break-words rounded-lg bg-[#D9FDD3] p-[10px] px-3 text-black shadow-md'>
                  <Image
                    className='rotate- absolute -right-2 top-0'
                    src={'/Polygon-green.svg'}
                    width={15}
                    height={4}
                    alt='polygon'
                  />
                  <div className='flex justify-center space-x-1 p-1'>
                    {['dot1', 'dot2', 'dot3'].map((dot, index) => (
                      <motion.div
                        key={dot}
                        className='h-2 w-2 rounded-full bg-gray-400'
                        animate={{
                          y: [0, -6, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: index * 0.2,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {isInputEnabled && !isLoading && (
          <form
            onSubmit={handleSendMessage}
            className={`fixed left-1/2 w-full max-w-3xl -translate-x-1/2 px-4 ${isPreview ? 'bottom-4' : 'bottom-6'} `}
          >
            <div className='flex w-full items-center gap-2'>
              {questionMessagesTypes === 'cpf' ? (
                <InputMask
                  mask='___.___.___-__'
                  replacement={{ _: /\d/ }}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)} // Atualiza o estado com o valor formatado
                  placeholder='Digite seu CPF...'
                  className='h-[50px] flex-1 rounded-full border p-2 px-4 focus:outline-none'
                  disabled={!isInputEnabled || isLoading}
                />
              ) : questionMessagesTypes === 'wpp' ? (
                <InputMask
                  mask='+__ (__) _____-____'
                  replacement={{ _: /\d/ }} // Permite apenas números em cada posição
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)} // Atualiza o estado com o valor formatado
                  placeholder='Digite seu WhatsApp...'
                  className='h-[50px] flex-1 rounded-full border p-2 px-4 focus:outline-none'
                  disabled={!isInputEnabled || isLoading}
                />
              ) : (
                <input
                  type='text'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder='Digite sua mensagem...'
                  className='h-[50px] flex-1 rounded-full border bg-white p-2 px-4 focus:outline-none'
                  disabled={!isInputEnabled || isLoading}
                />
              )}

              <button
                type='submit'
                className='flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#075f58] text-white transition-colors hover:bg-[#075f58]/80 disabled:opacity-50'
                disabled={!isInputEnabled || isLoading}
              >
                <IoSend className='h-5 w-5' />
              </button>
            </div>
          </form>
        )}
      </div>
      {/* <audio id='notification' src='/notification.mp3' /> */}
      <ToastContainer />
    </DomainProvider>
  )
}
