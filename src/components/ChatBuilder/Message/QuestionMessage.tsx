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
  Clock,
  Italic,
  Move,
  Smile,
  Sparkles,
  Strikethrough,
  Trash,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMessages } from '@/stores/useMessages'
import MessageTextArea from '@/components/CustomTextArea'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  QuestionOptions,
  CreateQuestionProps,
  QuestionMessageProps,
  EditQuestionProps,
  QuestionMessageType,
  CreateMessageRequest,
  SectionMessageType,
} from '@/types'
import { toast } from 'react-toastify'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { Switch } from '@/components/ui/switch'

interface QuestionMessageFormProps {
  chatId: string
  initialQuestion?: string
  initialOptions?: QuestionOptions
  initialHasDynamicDelay?: boolean
  initialSeconds?: string
  initialMinutes?: string
  onSave: (
    question: string,
    hasDynamicDelay: boolean,
    delayValue: Number,
    options: QuestionOptions
  ) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
}

function QuestionMessageForm({
  chatId,
  initialQuestion = '',
  initialOptions = { type: 'text', variable: '' },
  initialHasDynamicDelay = true,
  initialSeconds = '3',
  initialMinutes = '0',
  onSave,
  onCancel,
  onDelete,
}: QuestionMessageFormProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [questionType, setQuestionType] = useState(initialOptions.type)
  const [questionCapturedValue, setQuestionCapturedValue] = useState(
    initialOptions.variable
  )
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { messages } = useMessages()
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
    if (!question.trim()) return
    await onSave(
      question.trim(),
      hasDynamicDelay,
      convertToMiliseconds(+minutes, +seconds),
      {
        type: questionType,
        variable: questionCapturedValue,
      }
    )
    setQuestion('')
    setQuestionType('text')
    setQuestionCapturedValue('')
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

  return (
    <div className='m-4 h-fit w-full rounded-lg border border-dashed border-[#0C88EE] bg-[#C0DDFF6B] p-4'>
      <MessageTextArea
        hasDynamicDelay={hasDynamicDelay}
        setHasDynamicDelay={setHasDynamicDelay}
        minutes={minutes}
        setMinutes={setMinutes}
        seconds={seconds}
        setSeconds={setSeconds}
        text={question}
        setText={setQuestion}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        variables={messages[chatId]
          ?.filter((msg) => msg.type === 'question')
          .map((msg) => ({ id: msg.id, text: msg.content.options.variable }))}
      />
      <div className='flex pt-2'>
        <Card className='flex w-full max-w-[390px] flex-col gap-3 p-3 text-[#344054] md:grid md:w-[390px] md:grid-cols-2'>
          <div>
            <Label className='text-xs'>Tipo de variável de captura</Label>
            <Select
              value={questionType}
              onValueChange={(value) =>
                setQuestionType(value as QuestionOptions['type'])
              }
              defaultValue='text'
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select a type' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='text'>Texto</SelectItem>
                  <SelectItem value='email'>Email</SelectItem>
                  <SelectItem value='cpf'>CPF</SelectItem>
                  <SelectItem value='wpp'>WhatsApp</SelectItem>
                  <SelectItem value='number'>Número</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className='text-xs'>Nome da variável de captura</Label>
            <Input
              className='max-w-[180px]'
              value={questionCapturedValue}
              onChange={(e) => setQuestionCapturedValue(e.target.value)}
              placeholder='{user-name}'
            />
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
        <div className='flex gap-2 items-center w-full justify-between ml-1'>
          <div >
          <DropdownMenu>
                <DropdownMenuTrigger
                  className='text-[#0C88EE] text-opacity-100 bg-white p-1 rounded-[60px]'
                  asChild
                >
                     <div className='flex max-w-[390px] items-center justify-end'>
                    <button className='my-0 flex items-center gap-2 p-[2px] sm:px-1 text-sm'>
                      <Clock size={15} />
                      {hasDynamicDelay ? (
                        <span className='sr-only sm:not-sr-only'>
                          Digitação dinâmica
                        </span>
                      ) : (
                        <div>
                          {convertToSeconds(+minutes, +seconds)}s
                          {' '}
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
                          <span className='text-sm'>Definir tempo dinamicamente</span>
                          <Switch
                            checked={hasDynamicDelay}
                            onClick={handleChangeDynamicDelay}
                          />
                        </div>
                        {hasDynamicDelay && (
                          <p className='flex self-start text-sm text-gray-500'>
                          Define o tempo de digitação automaticamente com base no tamanho da mensagem.
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
          
          <div className='flex gap-2 self-endssss'>
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

export function CreateQuestionMessage({ chatId }: CreateQuestionProps) {
  const { createMessage, getMessages, stopCreatingMessage } = useMessages()

  const handleSave = async (
    question: string,
    hasDynamicDelay: boolean,
    delayValue: Number,
    options: QuestionOptions
  ) => {
    const messageData = {
      chatId,
      type: 'question',
      content: { text: question, hasDynamicDelay, delayValue, options },
    }

    try {
      await createMessage(messageData as CreateMessageRequest)
      await getMessages(chatId)
    } catch (error) {
      console.error('❌ -> Erro ao enviar mensagem:', error)
    }
  }

  return (
    <QuestionMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

export function EditQuestionMessage({
  oldMessage,
  oldHasDynamicDelay,
  oldSeconds,
  oldMinutes,
  questionOptions,
  chatId,
  id,
  onEditCancel,
}: EditQuestionProps & { onEditCancel: () => void }) {
  const { editMessage, getMessages, deleteMessage } = useMessages()

  const handleSave = async (
    question: string,
    hasDynamicDelay: boolean,
    delayValue: Number,
    options: QuestionOptions
  ) => {
    const messageData = {
      type: 'question',
      content: { text: question, hasDynamicDelay, delayValue, options },
    }

    try {
      await editMessage(id, messageData as QuestionMessageType)
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
    <QuestionMessageForm
      chatId={chatId}
      initialQuestion={oldMessage}
      initialOptions={questionOptions}
      initialHasDynamicDelay={oldHasDynamicDelay}
      initialMinutes={oldMinutes}
      initialSeconds={oldSeconds}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

export function QuestionMessage({ id, chatId, canEdit, formatedDate }) {
  const [isEditing, setIsEditing] = useState(false)
  const { getMessages, messages, checkIfMessageIsHidden, checkIfMessageIsInsideSection } = useMessages()
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const message = messages[chatId].find(
    (message) => message.id === id
  ) as QuestionMessageType

  function convertMillisecondsToMinutesAndSeconds(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000) // Converte para segundos
    const minutes = Math.floor(totalSeconds / 60) // Obtém os minutos
    const seconds = totalSeconds % 60 // Obtém os segundos restantes
    return { minutes, seconds }
  }

  const delayValueInMs = message.content.delayValue || 0
  const { minutes, seconds } = convertMillisecondsToMinutesAndSeconds(
    Number(delayValueInMs)
  )

  // Função para transformar o markdown customizado
  const customMarkdownParser = (text: string) => {
    return text
      .replace(/(\s|^)\*([^*]+)\*/g, '$1**$2**') // Negrito (*)
      .replace(/(\s|^)_([^_]+)_/g, '$1_$2_') // Itálico (_)
      .replace(/(\s|^)~([^~]+)~/g, '$1~~$2~~') // Tachado (~)
  }

  return (
    ((!checkIfMessageIsHidden(chatId, id) && canEdit) || !canEdit) && (
      <div className={`${checkIfMessageIsInsideSection(chatId, id) && canEdit ? 'border-[#0C88EE] border-l-[1px] my-[-10px] py-[5px] opacity-80' : ''}`}>
      <DragAndDropProvider
        isDragDisabled={false}
        droppableId={chatId}
        draggableId={id}
        index={messages[chatId].findIndex((message) => message.id === id)}
      >
        <div>
          {isEditing ? (
            <div className='flex w-full flex-col pr-8'>
              <EditQuestionMessage
                oldMessage={message?.content?.text}
                questionOptions={message?.content?.options}
                oldHasDynamicDelay={message.content.hasDynamicDelay ?? false}
                oldMinutes={minutes.toString()} // Passa os minutos calculados
                oldSeconds={seconds.toString()} // Passa os segundos calculados
                chatId={chatId}
                id={id}
                onEditCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div
              onClick={() => canEdit && setIsEditing(true)}
              className={`${canEdit ? 'transition-color m-2 flex w-full flex-col rounded-lg border border-dashed border-transparent transition-all duration-300 hover:cursor-pointer hover:border-[1px] hover:border-[#0C88EE] hover:bg-[#C0DDFF6B] hover:drop-shadow-xl' : 'mx-3 p-1'}`}
            >
              <div className='relative mx-3 flex w-fit max-w-[390px] cursor-pointer justify-start gap-3 rounded-lg bg-white p-[10px] px-3 text-black shadow-sm hover:drop-shadow-md'>
                <Image
                  className='rotate- absolute -left-2 top-0'
                  src={'/Polygon.svg'}
                  width={15}
                  height={4}
                  alt='polygon'
                />

                <h1>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className='mr-12 max-w-[370px] text-wrap break-words'
                  >
                    {customMarkdownParser(message?.content?.text)}
                  </ReactMarkdown>
                </h1>

                <span className='self-end text-xs text-zinc-500'>
                  {formatedDate}
                </span>
              </div>
              <div className='relative mx-4 mt-3 flex w-fit max-w-[390px] justify-end gap-1 self-end rounded-lg bg-[#D9FDD3] p-3 text-black shadow-md'>
                <Image
                  className='absolute -right-2 top-0'
                  src={'/Polygon-green.svg'}
                  width={15}
                  height={4}
                  alt='polygon'
                />
                <h1>
                  Captura resposta do usuário{' '}
                  <b>
                    {'{'}
                    {message?.content?.options?.variable}
                    {'}'}
                  </b>
                </h1>
                <span className='-my-1 self-end text-xs text-zinc-500'>
                  {formatedDate}
                </span>
              </div>
            </div>
          )}
        </div>
      </DragAndDropProvider>
      </div>
    )
  )
}

