'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { Clock, Image as LucideImage, Move, Trash } from 'lucide-react'
import { useMessages } from '@/stores/useMessages'
import { ImageCard } from '@/components/ChatBuilder/MediaCards'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  CreateMediaMessageProps,
  EditMessageProps,
  EditImageProps,
  CreateMessageRequest,
  ImageMessageType,
  SectionMessageType,
} from '@/types'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { Switch } from '@/components/ui/switch'
import MessageTextArea from '@/components/CustomTextArea'
import { text } from 'stream/consumers'

interface ImageMessageFormProps {
  chatId: string
  initialImage?: {
    url: string
    name: string
  }
  initialHasDynamicDelay?: boolean
  initialSeconds?: string
  initialMinutes?: string
  initialLegend?: string
  initialHaveLegend?: boolean
  onSave: (
    image: {
      url: string
      name: string
      initialImage: { url: string; name: string }
      haveLegend?: boolean
      legend: string
    },
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
  id?: string
}

function ImageMessageForm({
  chatId,
  initialImage = { url: '', name: '' },
  initialLegend = '',
  initialHaveLegend = true,
  initialHasDynamicDelay = true,
  initialSeconds = '3',
  initialMinutes = '0',
  onSave,
  onCancel,
  onDelete,
  id,
}: ImageMessageFormProps) {
  const [imageData, setImageData] = useState(initialImage)
  const { getMessages, messages, checkIfMessageIsHidden } = useMessages()
  const [haveLegend, setHaveLegend] = useState(initialHaveLegend)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [legend, setLegend] = useState(initialLegend)
  const [hasDynamicDelay, setHasDynamicDelay] = useState(initialHasDynamicDelay)
  const [seconds, setSeconds] = useState(initialSeconds)
  const [minutes, setMinutes] = useState(initialMinutes)

  const convertToMiliseconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum * 1000
  }

  const convertToSeconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum
  }

  const handleChangeDynamicDelay = () => {
    setHasDynamicDelay(!hasDynamicDelay)
  }

  const handleSave = async () => {
    if (!imageData.url.trim() || !imageData.name.trim()) return
    const updatedData = {
      ...imageData,
      legend,
      initialImage,
      initialHaveLegend,
      initialLegend,
    }
    await onSave(
      updatedData,
      hasDynamicDelay,
      convertToMiliseconds(+minutes, +seconds)
    )
    setImageData({ url: '', name: '' })
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

  const message = messages[chatId].find(
    (message) => message.id === id
  ) as ImageMessageType

  const toggleHaveLegend = () => {
    if (haveLegend === true) {
      setLegend('')
    }
    setHaveLegend(!haveLegend)
  }

  return (
    <div className='m-4 flex h-fit w-full flex-col gap-2 rounded-lg border border-dashed border-[#0C88EE] bg-[#C0DDFF6B] p-4 transition-all ease-in-out'>
      <ImageCard
        content={imageData}
        hasDynamicDelay={hasDynamicDelay}
        setHasDynamicDelay={setHasDynamicDelay}
        minutes={minutes}
        setMinutes={setMinutes}
        seconds={seconds}
        setSeconds={setSeconds}
        index={123}
        setItemContent={setImageData}
        isImage={true}
      />
      {haveLegend && (
        <MessageTextArea
          placeholder='Escreva uma legenda... (opcional)'
          isImage={true}
          text={legend}
          setText={setLegend}
          setShowEmojiPicker={setShowEmojiPicker}
          showEmojiPicker={showEmojiPicker}
          variables={messages[chatId]
            ?.filter((msg) => msg.type === 'question')
            .map((msg) => ({ id: msg.id, text: `${msg.content.options.variable}` }))}
        />
      )}

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
              className='rounded-full text-zinc-900'
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

export function CreateImageMessage({ chatId }: CreateMediaMessageProps) {
  const { createMessage, getMessages, stopCreatingMessage } = useMessages()

  const handleSave = async (
    image: {
      url: string
      name: string
      legend?: string
    },
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      chatId,
      type: 'image',
      content: {
        media_name: image.name,
        url: image.url,
        legend: image.legend,
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
    <ImageMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

export function EditImageMessage({
  chatId,
  id,
  onEditCancel,
  initialHaveLegend,
  initialLegend,
  initialImage,
  oldHasDynamicDelay,
  oldSeconds,
  oldMinutes,
}: EditImageProps & { onEditCancel: () => void }) {
  const { editMessage, getMessages, deleteMessage } = useMessages()
  const [isLoading, setIsLoading] = useState(false)
  const handleDelete = async () => {
    await deleteMessage(chatId, id)
  }

  const handleSave = async (
    image: {
      url: string
      name: string
      haveLegend?: boolean
      legend: string
      initialImage: { url: string; name: string }
    },
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      type: 'image',
      content: {
        media_name: image.name,
        url: image.url,
        legend: image.legend,
        haveLegend: image.haveLegend,
        hasDynamicDelay,
        delayValue,
      },
    }

    try {
      await editMessage(id, messageData as ImageMessageType)
      await getMessages(chatId)
      onEditCancel()
    } catch (error) {
      console.error('❌ -> Erro ao editar mensagem:', error)
    }
  }

  return (
    <ImageMessageForm
      initialImage={initialImage}
      initialHaveLegend={initialHaveLegend}
      initialLegend={initialLegend}
      initialHasDynamicDelay={oldHasDynamicDelay}
      initialMinutes={oldMinutes}
      initialSeconds={oldSeconds}
      id={id}
      chatId={chatId}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

export function ImageMessage({ id, chatId, canEdit, formatedDate }) {
  const [isEditing, setIsEditing] = useState(false)
  const {
    getMessages,
    messages,
    checkIfMessageIsHidden,
    checkIfMessageIsInsideSection,
  } = useMessages()
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const message = messages[chatId].find(
    (message) => message.id === id
  ) as ImageMessageType

  function convertMillisecondsToMinutesAndSeconds(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000) // Converte para segundos
    const minutes = Math.floor(totalSeconds / 60) // Obtém os minutos
    const seconds = totalSeconds % 60 // Obtém os segundos restantes
    return { minutes, seconds }
  }

  const delayValueInMs = message.content.delayValue || 0
  const { minutes, seconds } =
    convertMillisecondsToMinutesAndSeconds(delayValueInMs)

  // Sanitize the image URL before using it
  const originalImageUrl = message.content.url;
  const sanitizedImageUrl = originalImageUrl?.replace(/\[.*?\]/g, '').trim() || '';

  // Log original and sanitized URL for debugging
  console.log(`ImageMessage ID: ${id}, Original URL: ${originalImageUrl}, Sanitized URL: ${sanitizedImageUrl}`);

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
          droppableId={message.id}
          draggableId={message.id}
          index={messages[chatId].findIndex((message) => message.id === id)}
          isDragDisabled={isEditing}
        >
          <div>
            {isEditing ? (
              <div className='flex w-full flex-col pr-8'>
                <EditImageMessage
                  initialImage={{
                    url: message.content.url,
                    name: message.content.media_name,
                  }}
                  oldHasDynamicDelay={message.content.hasDynamicDelay ?? false}
                  oldMinutes={minutes.toString()} // Passa os minutos calculados
                  oldSeconds={seconds.toString()} // Passa os segundos calculados
                  initialHaveLegend={message.content.haveLegend}
                  initialLegend={message.content.legend}
                  chatId={chatId}
                  id={id}
                  onEditCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <div
                onClick={() => canEdit && setIsEditing(true)}
                className={`${canEdit ? 'transition-color mx-3 flex h-fit flex-col rounded-lg border border-dashed border-transparent p-2 duration-300 hover:cursor-pointer hover:border-[1px] hover:border-[#0C88EE] hover:bg-[#C0DDFF6B] hover:drop-shadow-xl' : 'mx-3 p-1'}`}
              >
                <div className='relative flex w-fit max-w-[390px] cursor-pointer flex-col justify-start rounded-lg bg-white p-4 text-black shadow-md hover:drop-shadow-md'>
                  <Image
                    className='absolute -left-2 top-0'
                    src={'/Polygon.svg'}
                    width={15}
                    height={4}
                    alt='polygon'
                  />
                  {/* Only render image if sanitized URL is valid */}
                  {sanitizedImageUrl ? (
                    <Image
                      src={sanitizedImageUrl} // Use sanitized URL
                      width={300}
                      height={200}
                      alt={message.content.media_name || 'Image'}
                      className='mb-2 rounded-lg'
                      // Optional: Add error handling for the Image component itself
                      onError={(e) => {
                        console.error(`Failed to load image: ${sanitizedImageUrl}`, e);
                        // Optionally, set a placeholder image source here
                        // e.currentTarget.src = '/placeholder-image.png'; 
                      }}
                    />
                  ) : (
                     // Render a placeholder if URL is invalid/empty after sanitization
                     <div className='mb-2 flex h-[200px] w-[300px] items-center justify-center rounded-lg bg-gray-200'>
                       <LucideImage className='h-10 w-10 text-gray-400' />
                     </div>
                  )}

                  <div className='mt-1 max-w-[300px]'>
                    {message.content.legend && (
                      <div className='text-xs text-zinc-900'>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className='mr-12 max-w-[370px] text-wrap break-words'
                        >
                          {customMarkdownParser(message.content.legend)}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {message.content.legend ? (
                    <span className='absolute bottom-3 right-5 z-50 -my-1 self-end text-xs text-zinc-500'>
                      {formatedDate}
                    </span>
                  ) : (
                    <span className='absolute bottom-8 right-5 z-50 -my-1 self-end text-xs text-white'>
                      {formatedDate}
                    </span>
                  )}

                  {message.content.legend ? (
                    ''
                  ) : (
                    <div className='absolute bottom-0 left-0 z-10 h-16 w-full rounded-b-lg bg-gradient-to-t from-black/50 to-transparent'></div>
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
