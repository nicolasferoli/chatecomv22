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
  XCircle,
} from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { Label } from '@/components/ui/label'
import { useMessages } from '@/stores/useMessages'
import MessageTextArea from '@/components/CustomTextArea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  QuestionOptions,
  CreateQuestionProps,
  QuestionMessageProps,
  EditQuestionProps,
  QuestionMessageType,
  CreateMessageRequest,
  Message,
  ButtonsMessageProps,
  ButtonsMessageType,
  SectionMessageType,
  UpdateMessageRequest,
  MessageType,
} from '@/types'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { v4 as uuidv4 } from 'uuid'

interface ListButtonsMessageFormProps {
  chatId: string
  initialQuestion?: string
  initialButtons?: string[]
  initialHasDynamicDelay?: boolean
  initialSeconds?: string
  initialMinutes?: string
  onSave: (
    question: string,
    buttons: string[],
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

function ListButtonsMessageForm({
  chatId,
  initialQuestion = '',
  initialButtons = [''],
  initialHasDynamicDelay = true,
  initialSeconds = '3',
  initialMinutes = '0',
  onSave,
  onCancel,
  onDelete,
}: ListButtonsMessageFormProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [buttons, setButtons] = useState(initialButtons)
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
  
  const handleAddButton = () => {
    setButtons([...buttons, ''])
  }

  const handleButtonChange = (index: number, value: string) => {
    const newButtons = [...buttons]
    newButtons[index] = value
    setButtons(newButtons)
  }

  const handleSave = async () => {
    if (question.trim() === '') {
      toast.warn('Digite o texto da pergunta')
      return
    }

    const filteredButtons = buttons.filter((button) => button.trim())

    if (filteredButtons.length === 0) {
      toast.warn('Adicione pelo menos um botão')
      return
    }

    await onSave(
      question.trim(),
      filteredButtons,
      hasDynamicDelay,
      convertToMiliseconds(+minutes, +seconds)
    )
    setQuestion('')
    setButtons([''])
  }

  const handleDeleteButton = (index: number) => {
    const newButtons = [...buttons]
    newButtons.splice(index, 1)
    setButtons(newButtons) // Atualiza apenas o estado local
  }

  return (
    <div className='m-4 h-fit w-full rounded-lg border border-dashed border-[#0C88EE] bg-[#C0DDFF6B] p-4'>
      <MessageTextArea
        placeholder='Digite o texto da pergunta'
        text={question}
        setText={setQuestion}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        variables={messages[chatId]
          ?.filter((msg) => msg.type === 'question')
          .map((msg) => ({ id: msg.id, text: msg.content.options.variable }))}
      />
      <div className='flex max-w-[390px] text-zinc-800 flex-col gap-3 pt-4'>
        {buttons.map((button, index) => (
          <div key={index} className='relative rounded-md bg-white p-3'>
            <div className='mb-2 text-sm'>Título do botão {index + 1}</div>
            <Input
              value={button}
              onChange={(e) => handleButtonChange(index, e.target.value)}
              placeholder='Digite o título do botão'
              className='mt-1'
            />
            <button
              onClick={() => {
                handleDeleteButton(index)
              }}
            >
              <Trash
                size={18}
                className='absolute right-2 top-3 text-zinc-600 transition-colors hover:text-zinc-800'
              />
            </button>
          </div>
        ))}
        <Button
          variant='ghost'
          className='w-full bg-white text-[#0C88EE]'
          onClick={handleAddButton}
        >
          + Novo botão
        </Button>
      </div>
      <div className='mt-4 flex w-full max-w-[390px] items-center justify-between'>
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

export function CreateListButtonsMessage({ chatId }: CreateQuestionProps) {
  const { createMessage, getMessages, stopCreatingMessage } = useMessages()

  const handleSave = async (
    question: string,
    buttons: string[],
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      chatId,
      type: 'buttons',
      content: { text: question, buttons, hasDynamicDelay, delayValue },
    } as CreateMessageRequest

    try {
      await createMessage(messageData)
      await getMessages(chatId)
      stopCreatingMessage(chatId)
    } catch (error) {
      console.error('❌ -> Erro ao enviar mensagem:', error)
      toast.error('Falha ao criar mensagem de botões.')
    }
  }

  return (
    <ListButtonsMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

interface ButtonsMessageContent {
  text: string
  buttons: string[]
}

interface EditListButtonsMessageProps {
  text: string
  buttons: string[]
  oldHasDynamicDelay: boolean
  oldSeconds: string
  oldMinutes: string
  chatId: string
  id: string
  onEditCancel: () => void
}

export function EditListButtonsMessage({
  text,
  buttons: initialButtons,
  chatId,
  id,
  oldHasDynamicDelay,
  oldSeconds,
  oldMinutes,
  onEditCancel,
}: EditListButtonsMessageProps) {
  const { editMessage, getMessages, deleteMessage } = useMessages()

  const handleDelete = async () => {
    try {
      await deleteMessage(chatId, id)
      toast.success('Mensagem excluída.')
      onEditCancel()
    } catch (error) {
       console.error('❌ -> Erro ao deletar mensagem:', error)
       toast.error('Falha ao excluir mensagem.')
    }
  }

  const handleSave = async (
    question: string,
    buttons: string[],
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      id,
      chatId,
      type: 'buttons' as MessageType,
      content: { text: question, buttons, hasDynamicDelay, delayValue },
    }

    try {
      await editMessage(id, {
         chatId: messageData.chatId,
         type: messageData.type,
         content: messageData.content,
      } as UpdateMessageRequest)
      toast.success('Mensagem atualizada.')
      onEditCancel()
    } catch (error) {
      console.error('❌ -> Erro ao editar mensagem:', error)
      toast.error('Falha ao atualizar mensagem.')
    }
  }

  return (
    <ListButtonsMessageForm
      chatId={chatId}
      initialQuestion={text}
      initialButtons={initialButtons}
      initialHasDynamicDelay={oldHasDynamicDelay}
      initialMinutes={oldMinutes}
      initialSeconds={oldSeconds}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

export function ListButtonsMessage({ id, chatId, canEdit, onButtonClick }) {
  const { messages, deleteMessage } = useMessages()
  const message = messages[chatId]?.find((msg) => msg.id === id) as ButtonsMessageType | undefined;
  const [showEdit, setShowEdit] = useState(false);

  // Function to handle edit cancelation
  const handleEditCancel = () => {
    setShowEdit(false);
  };

  function formatTime(isoDate) {
    if (!isoDate) return ''; // Handle potential undefined date
    const date = new Date(isoDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  function convertMillisecondsToMinutesAndSeconds(milliseconds: number) {
    if (isNaN(milliseconds)) {
        return { minutes: "0", seconds: "0" }; // Default or error state
    }
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes: String(minutes), seconds: String(seconds) };
  }

  const { minutes, seconds } = convertMillisecondsToMinutesAndSeconds(message?.content?.delayValue ?? 0);


  if (!message || !message.content) {
    // Handle case where message or content is not found (e.g., loading or error)
    return <div>Carregando botões...</div>; // Or some other placeholder/error message
  }

  const formatedDate = formatTime(message.createdAt);

  // Render Edit Form if showEdit is true
  if (showEdit) {
    return (
      <EditListButtonsMessage
        id={id}
        chatId={chatId}
        text={message.content.text}
        buttons={message.content.buttons}
        oldHasDynamicDelay={message.content.hasDynamicDelay ?? true}
        oldMinutes={minutes}
        oldSeconds={seconds}
        onEditCancel={handleEditCancel}
      />
    );
  }

  // Render Display Mode
  return (
    <div className='flex flex-col mb-2 pr-5'>
      <Card className='relative max-w-[390px] overflow-hidden rounded-[20px] rounded-tl-none border-none bg-zinc-100 p-0 text-zinc-900 shadow-sm'>
        <CardContent className='p-3'>
          <p className='whitespace-pre-wrap text-sm'>{message.content.text}</p>
        </CardContent>
        <CardContent className="flex flex-col gap-2 pt-3">
          {message.content.buttons.map((buttonText: string, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="border border-[#0C88EE] bg-white text-[#0C88EE] hover:bg-[#0C88EE] hover:text-white"
              onClick={() => onButtonClick(buttonText)}
            >
              {buttonText}
            </Button>
          ))}
        </CardContent>
        <span className='absolute bottom-1 right-2 text-[11px] text-zinc-500'>
          {formatedDate}
        </span>
      </Card>
       {canEdit && (
        <div className="flex items-center justify-end mr-2 mt-1">
             <button onClick={() => setShowEdit(true)} className="text-xs text-zinc-500 hover:text-zinc-700">(Editar)</button>
         </div>
       )}
    </div>
  );
}
