'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Braces,
  ExternalLink,
  Italic,
  Move,
  Smile,
  Sparkles,
  Strikethrough,
  Trash,
  X,
} from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMessages } from '@/stores/useMessages'
import MessageTextArea from '@/components/CustomTextArea'
import {
  CreateQuestionProps,
  EditQuestionProps,
  QuestionMessageType,
  CreateMessageRequest,
  QuestionOptions,
  SectionMessageType,
  EditRedirectProps,
  RedirectMessageType,
} from '@/types'
import { Switch } from '@/components/ui/switch'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { useSearchParams } from 'next/navigation'
import { ChatAction } from '@prisma/client'

interface RedirectMessageFormProps {
  initialUrl?: string
  initialBlank?: boolean
  chatId: string
  onSave: (url: string, redirectBlank: boolean) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
}

function RedirectMessageForm({
  initialUrl = '',
  initialBlank = false,
  chatId,
  onSave,
  onCancel,
  onDelete,
}: RedirectMessageFormProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState(initialUrl)
  const [redirectBlank, setRedirectBlank] = useState(initialBlank)

  const handleSave = async () => {
    if (!redirectUrl.trim()) {
      toast.error('URL é obrigatória')
      return
    }
    await onSave(redirectUrl, redirectBlank)
  }

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await handleSave()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSave])

  const togleRedirectBlack = () => {
    setRedirectBlank(!redirectBlank)
  }

  return (
    <div className='m-4 h-fit w-full rounded-lg border border-dashed border-[#0C88EE] bg-[#C0DDFF6B] p-4'>
      <div className='flex pt-2'>
        <Card className='flex h-[140px] w-full max-w-[390px] flex-col gap-3 p-4 text-[#344054]'>
          <div className='flex flex-col gap-2'>
            <Label className='text-xs'>URL de destino</Label>
            <Input
              className='flex h-[40px] w-full text-sm placeholder:text-sm'
              type='text'
              placeholder='Digite a URL'
              required
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
            />
          </div>
          <div className='col-span-2 mt-1 flex items-center gap-2 text-sm'>
            <Switch
              checked={redirectBlank}
              onCheckedChange={togleRedirectBlack}
            />
            <span>Redirecionar automaticamente?</span>
          </div>
        </Card>
      </div>
      <div className='mt-2 flex max-w-[390px] items-center justify-between'>
        <div className='flex gap-2'>
          {/*<Button
            className='rounded-full'
            variant='outline'
            size='icon'
            onClick={() => {}}
          >
            <Move className='h-4 w-4' />
          </Button>*/}
          {onDelete && (
            <Button
              className='rounded-full'
              variant='outline'
              size='icon'
              onClick={onDelete}
            >
              <Trash className='h-4 w-4' />
            </Button>
          )}
        </div>
        <div className='flex gap-2'>
          <Button
            className='bg-[#E7F4FF] text-[#0C88EE]'
            variant='outline'
            size='default'
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            className='bg-[#0C88EE] text-white'
            variant='outline'
            size='default'
            onClick={handleSave}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CreateRedirectMessage({ chatId }: CreateQuestionProps) {
  const { createMessage, getMessages, stopCreatingMessage, deleteMessage } =
    useMessages()

  const handleSave = async (url: string, redirectBlank: boolean) => {
    const messageData = {
      chatId,
      type: 'redirect',
      content: {
        url: url,
        redirectBlank: redirectBlank,
      },
    }

    try {
      await createMessage(messageData as CreateMessageRequest)
      await getMessages(chatId)
      toast.success('Mensagem criada com sucesso')
    } catch (error) {
      console.error('❌ -> Erro ao enviar mensagem:', error)
      toast.error('Erro ao criar mensagem')
    }
  }

  return (
    <RedirectMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

export function EditRedirectMessage({
  oldUrl,
  oldRedirectBlank,
  chatId,
  id,
  onEditCancel,
}: EditRedirectProps & { onEditCancel: () => void }) {
  const { editMessage, getMessages, deleteMessage } = useMessages()

  const handleSave = async (url: string, redirectBlank: boolean) => {
    const messageData = {
      chatId,
      type: 'redirect',
      content: {
        url: url,
        redirectBlank: redirectBlank,
      },
    }

    try {
      await editMessage(id, messageData as CreateMessageRequest)
      await getMessages(chatId)
      onEditCancel()
      toast.success('Mensagem editada com sucesso')
    } catch (error) {
      console.error('❌ -> Erro ao enviar mensagem:', error)
      toast.error('Erro ao editar mensagem')
    }
  }

  const handleDelete = async () => {
    await deleteMessage(chatId, id)
  }

  return (
    <RedirectMessageForm
      chatId={chatId}
      initialUrl={oldUrl}
      initialBlank={oldRedirectBlank}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

export function RedirectMessage({ id, chatId, canEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const {
    getMessages,
    messages,
    checkIfMessageIsHidden,
    checkIfMessageIsInsideSection,
  } = useMessages()
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const searchParams = useSearchParams()

  const message = messages[chatId].find(
    (message) => message.id === id
  ) as RedirectMessageType

  function formatTime(isoDate) {
    const date = new Date(isoDate)
    let hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const formattedMinutes = minutes.toString().padStart(2, '0')
    return `${hours}:${formattedMinutes} ${period}`
  }
  const addActionLog = async (
    chatId: string,
    action: string,
    opts: {
      question_type?: string
      question_variable?: string
      question_answer?: string
      button_question?: string
      button_answer?: string
      clicked_link_url?: string
      question_text?: string
    }
  ) => {
    const isPreview = searchParams.get('isPreview')

    const isBuilder = window.location.pathname.includes('builder')

    if (isBuilder === true) {
      return
    }

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

  const handleRedirecClick = async () => {
    await addActionLog(chatId, ChatAction.clicked_link, {
      clicked_link_url: `https://${message?.content?.url}`,
    })
  }

  const isIframe = window.self !== window.top

  useEffect(() => {
    if (!window) {
      return
    }

    const isBuilder = window.location.pathname.includes('builder')
    const isPreview = searchParams.get('isPreview')

    if (isBuilder || isPreview) {
      return
    }

    if (isIframe || message?.content?.redirectBlank) {
      const handleRedirectAuto = async () => {
        await addActionLog(chatId, ChatAction.clicked_link, {
          clicked_link_url: `https://${message?.content?.url}`,
        })
      }

      const url =
        message?.content?.url.startsWith('http://') ||
        message?.content?.url.startsWith('https://')
          ? message?.content?.url
          : `https://${message?.content?.url}`

      if (url && message?.content?.redirectBlank) {
        if (isBuilder || isPreview) {
          return
        }
        setTimeout(() => {
          window.open(url, '_blank', 'noopener,noreferrer')
          handleRedirectAuto()
        }, 2000)
      }
    }
  }, [window, isIframe, message?.content?.redirectBlank, message?.content?.url])

  return (
    ((!checkIfMessageIsHidden(chatId, id) && canEdit) || !canEdit) && (
      <div
        className={`${checkIfMessageIsInsideSection(chatId, id) && canEdit ? 'my-[-10px] border-l-[1px] border-[#0C88EE] py-[5px] opacity-80' : ''}`}
      >
        <DragAndDropProvider
          droppableId={message.id}
          draggableId={message.id}
          index={messages[chatId].findIndex((message) => message.id === id)}
          isDragDisabled={isEditing}
        >
          <div>
            {isEditing ? (
              <div className='flex w-full flex-col pr-8'>
                <EditRedirectMessage
                  oldUrl={message?.content?.url}
                  oldRedirectBlank={message?.content?.redirectBlank}
                  chatId={chatId}
                  id={id}
                  onEditCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <div
                onClick={() => canEdit && setIsEditing(true)}
                className={`${canEdit ? 'transition-color m-2 mx-4 flex flex-col gap-2 rounded-lg border border-dashed border-transparent transition-all duration-300 hover:cursor-pointer hover:border-[1px] hover:border-[#0C88EE] hover:bg-[#C0DDFF6B] hover:drop-shadow-xl' : 'mx-3 p-1'}`}
              >
                <div className='relative flex w-fit max-w-[390px] cursor-pointer flex-col justify-start rounded-lg bg-white p-3 px-4 text-black shadow-md'>
                  <Image
                    className='rotate- absolute -left-2 top-0'
                    src={'/Polygon.svg'}
                    width={15}
                    height={4}
                    alt='polygon'
                  />
                  {isIframe || message.content.redirectBlank ? (
                    <a
                      onClick={() => {
                        handleRedirecClick()
                      }}
                      href={
                        !isEditing &&
                        (message?.content?.url.startsWith('http://') ||
                        message?.content?.url.startsWith('https://')
                          ? message?.content?.url
                          : `https://${message?.content?.url}`)
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <div className='flex w-full items-center gap-2 px-2'>
                        <span>
                          <span className='font-medium text-blue-500'>
                            {message?.content?.url
                              .replace('https://', '')
                              .replace('http://', '')
                              .replace('www.', '')}
                          </span>
                        </span>
                        <ExternalLink size={18} className='text-blue-500' />
                      </div>
                    </a>
                  ) : (
                    <a
                      onClick={() => {
                        handleRedirecClick()
                      }}
                      href={
                        isEditing
                          ? message?.content?.url.startsWith('http://') ||
                            message?.content?.url.startsWith('https://')
                            ? message?.content?.url
                            : `https://${message?.content?.url}`
                          : undefined
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <div className='flex w-full items-center gap-2 px-2'>
                        <span className='font-medium text-blue-500'>
                          {message?.content?.url
                            .replace('https://', '')
                            .replace('http://', '')
                            .replace('www.', '')}
                        </span>
                        <ExternalLink size={18} className='text-blue-500' />
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </DragAndDropProvider>
      </div>
    )
  )
}
