'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Braces,
  Clock,
  Italic,
  Move,
  Smile,
  Sparkles,
  Strikethrough,
  Trash,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useMessages } from '@/stores/useMessages'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import MessageTextArea from '@/components/CustomTextArea'
import {
  CreateMessageProps,
  CreateMessageRequest,
  EditMessageProps,
  MessageProps,
  SectionMessageType,
  TextMessageType,
} from '@/types'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

interface TextMessageFormProps {
  chatId: string
  initialText?: string
  initialSeconds?: string
  initialMinutes?: string
  initialHasDynamicDelay?: boolean
  onSave: (
    text: string,
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
}

function TextMessageForm({
  chatId,
  initialText = '',
  onSave,
  onCancel,
  onDelete,
  initialSeconds = '3',
  initialMinutes = '0',
  initialHasDynamicDelay = true,
}: TextMessageFormProps) {
  const [text, setText] = useState(initialText)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { messages } = useMessages()
  const [hasDynamicDelay, setHasDynamicDelay] = useState(initialHasDynamicDelay)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [minutes, setMinutes] = useState(initialMinutes)

  const convertToMiliseconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum * 1000
  }

  const handleSave = async () => {
    if (!text.trim()) return
    await onSave(
      text.trim(),
      hasDynamicDelay,
      convertToMiliseconds(+minutes, +seconds)
    )
    setText('')
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

  const convertToSeconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum
  }

  const handleChangeDynamicDelay = () => {
    setHasDynamicDelay(!hasDynamicDelay)
  }

  return (
    <div className='m-4 w-full rounded-lg border border-dashed border-[#0C88EE] bg-[#C0DDFF6B] p-4 md:min-h-[200px]'>
      <MessageTextArea
        text={text}
        setText={setText}
        setShowEmojiPicker={setShowEmojiPicker}
        showEmojiPicker={showEmojiPicker}
        variables={messages[chatId]
          ?.filter((msg) => msg.type === 'question')
          .map((msg) => ({ id: msg.id, text: msg.content.options.variable }))}
      />
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
        <div className='ml-1 flex w-full items-center justify-between gap-2'>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className='rounded-[60px] bg-white p-1 text-[#0C88EE] text-opacity-100'
                asChild
              >
                <div className='flex max-w-[390px] items-center justify-end'>
                  <button className='my-0 flex items-center gap-2 p-[2px] text-sm sm:px-1'>
                    <Clock size={15} />
                    {hasDynamicDelay ? (
                      <span className='sr-only sm:not-sr-only'>
                        Digitação dinâmica
                      </span>
                    ) : (
                      <div>
                        {convertToSeconds(+minutes, +seconds)}s{' '}
                        <span className='sr-only sm:not-sr-only'>
                          Digitando
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side='bottom'
                align='start'
                className='mr-6 mt-1 w-[274px] sm:mr-0'
              >
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <div className='flex w-full flex-col items-center justify-between gap-2'>
                      <div className='flex w-full items-center justify-between'>
                        <span className='text-sm'>
                          Definir tempo dinamicamente
                        </span>
                        <Switch
                          checked={hasDynamicDelay}
                          onClick={handleChangeDynamicDelay}
                        />
                      </div>
                      {hasDynamicDelay && (
                        <p className='flex self-start text-sm text-gray-500'>
                          Define o tempo de digitação automaticamente com base
                          no tamanho da mensagem.
                        </p>
                      )}
                    </div>
                  </DropdownMenuItem>
                  {!hasDynamicDelay && (
                    <>
                      <DropdownMenuLabel className='font-normal text-zinc-800'>
                        Simular digitação por:
                      </DropdownMenuLabel>
                      <div
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                        className='relative flex items-center justify-between gap-2 p-1'
                      >
                        <div className='flex flex-col items-start'>
                          <span className='text-sm'>Minutos</span>
                          <Input
                            type='number'
                            value={String(minutes)}
                            onChange={(e) => setMinutes(e.target.value)}
                            className='w-28 text-center'
                          />
                        </div>
                        <span className='absolute right-[93px] top-[34px]'>
                          :
                        </span>
                        <div className='flex flex-col items-start'>
                          <span className='text-sm'>Segundos</span>
                          <Input
                            type='number'
                            value={String(seconds)}
                            onChange={(e) => setSeconds(e.target.value)}
                            className='w-28 text-center'
                          />
                        </div>
                      </div>
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='self-endssss flex gap-2'>
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
    </div>
  )
}

export default function CreateTextMessage({ chatId }: CreateMessageProps) {
  const { createMessage, getMessages, stopCreatingMessage, deleteMessage } =
    useMessages()

  const handleSave = async (
    text: string,
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      chatId,
      type: 'text',
      content: {
        text,
        hasDynamicDelay,
        delayValue,
      },
    }

    try {
      await createMessage(messageData as CreateMessageRequest)
      await getMessages(chatId)
    } catch (error) {
      console.error('❌ -> Erro ao enviar mensagem:', error)
    }
  }

  return (
    <TextMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

export function EditTextMessage({
  oldHasDynamicDelay,
  oldSeconds,
  oldMinutes,
  oldMessage,
  chatId,
  id,
  onEditCancel,
}: EditMessageProps & { onEditCancel: () => void }) {
  const { editMessage, getMessages, deleteMessage } = useMessages()

  const handleSave = async (
    text: string,
    hasDynamicDelay: any,
    delayValue: any
  ) => {
    const messageData = {
      type: 'text',
      content: { text, hasDynamicDelay, delayValue },
    }

    try {
      await editMessage(id, messageData as TextMessageType)
      await getMessages(chatId)
      onEditCancel()
    } catch (error) {
      console.error('❌ -> Erro ao editar mensagem:', error)
    }
  }

  const handleDelete = async () => {
    await deleteMessage(chatId, id)
  }

  return (
    <TextMessageForm
      chatId={chatId}
      initialText={oldMessage}
      initialHasDynamicDelay={oldHasDynamicDelay}
      initialMinutes={oldMinutes}
      initialSeconds={oldSeconds}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

/**
 * TextMessage component
 * @param {string} id - ID of the message
 * @param {string} message - The message text
 * @param {string} chatId - ID of the chat
 * @param {boolean} canEdit - Whether the message can be edited
 * @param {string} type - Type of the message
 * @param {'user' | 'bot'} from - Who sent the message
 * @returns {JSX.Element} - Rendered component
 */
export function TextMessage({
  id,
  chatId,
  canEdit = false,
  message,
  formatedDate,
}: {
  id: string
  chatId: string
  canEdit: boolean
  message?: TextMessageType
  formatedDate: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const {
    getMessages,
    messages,
    checkIfMessageIsHidden,
    checkIfMessageIsInsideSection,
  } = useMessages()
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  if (!message) {
    message = messages[chatId].find(
      (message) => message.id === id
    ) as TextMessageType
  }

  function convertMillisecondsToMinutesAndSeconds(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000) // Converte para segundos
    const minutes = Math.floor(totalSeconds / 60) // Obtém os minutos
    const seconds = totalSeconds % 60 // Obtém os segundos restantes
    return { minutes, seconds }
  }

  const delayValueInMs = message.content.delayValue || 0
  const { minutes, seconds } =
    convertMillisecondsToMinutesAndSeconds(delayValueInMs)

  // Log the content text before rendering to check its type
  console.log(`Rendering TextMessage ID: ${id}, Content Text Type: ${typeof message?.content?.text}, Value:`, message?.content?.text);

  // Função para transformar o markdown customizado
  const customMarkdownParser = (text: string) => {
    return text
      .replace(/(\s|^)\*([^*]+)\*/g, '$1**$2**') // Negrito (*)
      .replace(/(\s|^)_([^_]+)_/g, '$1_$2_') // Itálico (_)
      .replace(/(\s|^)~([^~]+)~/g, '$1~~$2~~') // Tachado (~)
  }

  return (
    ((!checkIfMessageIsHidden(chatId, id) && canEdit) || !canEdit) && (
      <div
        className={`${checkIfMessageIsInsideSection(chatId, id) && canEdit ? 'my-[-10px] border-l-[1px] border-[#0C88EE] py-[5px] opacity-80' : ''}`}
      >
        <DragAndDropProvider
          isDragDisabled={isEditing}
          droppableId={message.id}
          draggableId={message.id}
          index={messages[chatId].findIndex((message) => message.id === id)}
        >
          <div>
            {isEditing ? (
              <div className='flex w-full flex-col pr-8'>
                <EditTextMessage
                  oldMessage={message.content.text}
                  oldHasDynamicDelay={message.content.hasDynamicDelay}
                  oldMinutes={minutes.toString()} // Passa os minutos calculados
                  oldSeconds={seconds.toString()} // Passa os segundos calculados
                  chatId={chatId}
                  id={id}
                  onEditCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <div
                className={`${canEdit ? 'transition-color mx-3 flex flex-col rounded-lg border border-transparent p-2 duration-300 hover:cursor-pointer hover:border-[1px] hover:border-dashed hover:border-[#0C88EE] hover:bg-[#C0DDFF6B] hover:drop-shadow-xl' : 'mx-3 p-1'}`}
                onClick={() => canEdit && setIsEditing(true)}
              >
                {message?.from === 'user' ? (
                  <div className='relative ml-auto flex h-fit w-fit min-w-[85px] max-w-[390px] justify-start gap-3 self-end text-wrap break-words rounded-lg bg-[#D9FDD3] p-[10px] px-3 pr-12 text-black shadow-md'>
                    <Image
                      className='rotate- absolute -right-2 top-0'
                      src={'/Polygon-green.svg'}
                      width={15}
                      height={4}
                      alt='polygon'
                    />
                    <span className='absolute bottom-2 right-2 -my-1 self-end text-xs text-zinc-500'>
                      {formatedDate}
                    </span>

                    {message?.content?.text || ''}
                  </div>
                ) : (
                  <div className='relative flex h-fit w-fit max-w-[390px] cursor-pointer justify-start gap-3 text-wrap break-words rounded-lg bg-white p-[10px] px-3 text-black shadow-sm hover:drop-shadow-md'>
                    <Image
                      className='rotate- absolute -left-2 top-0'
                      src={'/Polygon.svg'}
                      width={15}
                      height={4}
                      alt='polygon'
                    />
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className='mr-12 max-w-[370px] text-wrap break-words'
                    >
                      {customMarkdownParser(message?.content?.text || '')}
                    </ReactMarkdown>
                    <span className='absolute bottom-3 right-3 -my-1 self-end text-xs text-zinc-500'>
                      {formatedDate}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DragAndDropProvider>
      </div>
    )
  )
}
