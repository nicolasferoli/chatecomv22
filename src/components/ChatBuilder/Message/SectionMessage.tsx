'use client'

import React, { useEffect, useState } from 'react'
import {
  Move,
  Trash,
  Edit,
  Copy,
  Check,
  Pencil,
  Plus,
  Minus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMessages } from '@/stores/useMessages'
import {
  CreateMessageProps,
  CreateMessageRequest,
  EditMessageProps,
  SectionMessageType,
  UpdateMessageRequest,
} from '@/types'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { toast, ToastContainer } from 'react-toastify'

/**
 * Componente que renderiza o campo de entrada de texto para o título da seção
 * @param {string} text - O texto atual do input
 * @param {Function} setText - Função para atualizar o texto
 */
const SectionFormInput = ({ text, setText }) => (
  <input
    type='text'
    value={text}
    onChange={(e) => setText(e.target.value)}
    className='w-full bg-transparent text-sm font-medium leading-tight text-[#0C88EE] placeholder:text-xs placeholder:!text-[#A5D5FC] focus:outline-none md:placeholder:text-sm'
    placeholder='Digite o nome da seção'
  />
)

/**
 * Componente que renderiza os botões de ação do formulário (Salvar/Cancelar)
 * @param {Function} onCancel - Função chamada ao clicar em Cancelar
 * @param {Function} onSave - Função chamada ao clicar em Salvar
 */
const FormActionButtons = ({ onCancel, onSave }) => (
  <div className='flex items-center gap-1'>
    <Button
      variant='ghost'
      size='sm'
      className='h-6 px-2 font-semibold text-[#0c88ee] hover:text-[#0c88ee]'
      onClick={onSave}
    >
      <Check className='h-3 w-3 text-[#0c88ee]' />
      <span className='sr-only md:not-sr-only'> Salvar</span>
    </Button>
    <Button
      variant='ghost'
      size='sm'
      className='h-6 px-2 font-semibold text-zinc-500 hover:text-zinc-500'
      onClick={onCancel}
    >
      <X className='h-3 w-3 text-zinc-500' />
      <span className='sr-only md:not-sr-only'>Cancelar</span>
    </Button>
  </div>
)

/**
 * Componente que encapsula ícones em um container estilizado
 * @param {ReactNode} children - Elemento filho (ícone) a ser renderizado
 */
const IconContainer = ({ children }) => (
  <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-2xl border border-none bg-[#f1f9ff] p-2'>
    <div className='relative h-4 w-4'>{children}</div>
  </div>
)

/**
 * Componente que renderiza os botões de ação da mensagem (Copiar/Excluir)
 */
const MessageActionButtons = ({ onDelete, onEdit }) => (
  <div className='flex items-center gap-1'>
    <Button
      variant='ghost'
      size='icon'
      className='flex h-6 w-6 items-center justify-center rounded-2xl bg-[#f1f9ff] hover:bg-blue-50'
      onClick={onEdit}
    >
      <Pencil className='h-3 w-3 text-[#0c88ee]' />
    </Button>
    <Button
      variant='ghost'
      size='icon'
      className='flex h-6 w-6 items-center justify-center rounded-2xl bg-[#f1f9ff] hover:bg-blue-50'
      onClick={onDelete}
    >
      <Trash className='h-3 w-3 text-[#0c88ee]' />
    </Button>
  </div>
)

interface SectionMessageFormProps {
  chatId: string
  initialText?: string
  onSave: (text: string) => Promise<void>
  onCancel: () => void
}

/**
 * Componente de formulário para criar/editar uma mensagem de seção
 * @param {string} chatId - ID do chat
 * @param {string} initialText - Texto inicial do formulário
 * @param {Function} onSave - Função chamada ao salvar
 * @param {Function} onCancel - Função chamada ao cancelar
 */
function SectionMessageForm({
  chatId,
  initialText = '',
  onSave,
  onCancel,
}: SectionMessageFormProps) {
  const [text, setText] = useState(initialText)

  const handleSave = async () => {
    if (text.trim() === '') {
      toast.warn('O texto da seção não pode estar vazio.')
      return
    }
    await onSave(text.trim())
    setText('')
  }

  return (
    <div className='mx-4 mb-10 mt-3 flex h-fit items-center justify-between rounded border border-dashed border-[#0c88ee] bg-[#f1f9ff] px-2 py-1.5'>
      <div className='flex flex-1 items-center justify-start gap-1 px-3'>
        <SectionFormInput text={text} setText={setText} />
      </div>
      <FormActionButtons onCancel={onCancel} onSave={handleSave} />
      <ToastContainer />
    </div>
  )
}

/**
 * Componente para criar uma nova mensagem de seção
 * @param {string} chatId - ID do chat onde a mensagem será criada
 */
export function CreateSectionMessage({ chatId }: CreateMessageProps) {
  const { createMessage, getMessages, stopCreatingMessage } = useMessages()

  const handleSave = async (text: string) => {
    const messageData = {
      chatId,
      type: 'section',
      content: { text },
    }

    try {
      await createMessage(messageData as CreateMessageRequest)
      await getMessages(chatId)
    } catch (error) {
      console.error('❌ -> Erro ao enviar seção:', error)
    }
  }

  return (
    <SectionMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

/**
 * Componente para editar uma mensagem de seção existente
 * @param {string} oldMessage - Texto atual da mensagem
 * @param {string} chatId - ID do chat
 * @param {string} id - ID da mensagem
 * @param {Function} onEditCancel - Função chamada ao cancelar a edição
 */
export function EditSectionMessage({
  oldMessage,
  chatId,
  id,
  onEditCancel,
}: EditMessageProps & { onEditCancel: () => void }) {
  const { editMessage, getMessages } = useMessages()

  const handleSave = async (text: string) => {
    const messageData = {
      type: 'section',
      content: { text },
    }

    try {
      await editMessage(id, messageData as UpdateMessageRequest)
      await getMessages(chatId)
      onEditCancel()
    } catch (error) {
      console.error('❌ -> Erro ao editar seção:', error)
    }
  }

  return (
    <SectionMessageForm
      chatId={chatId}
      initialText={oldMessage}
      onSave={handleSave}
      onCancel={onEditCancel}
    />
  )
}

/**
 * Componente principal que renderiza uma mensagem de seção
 * @param {string} id - ID da mensagem
 * @param {string} chatId - ID do chat
 * @param {boolean} canEdit - Indica se a mensagem pode ser editada
 */
export function SectionMessage({
  id,
  chatId,
  canEdit = false,
}: {
  id: string
  chatId: string
  canEdit: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const { getMessages, messages, toggleSection, deleteMessage } = useMessages()

  if (isEditing) {
    return (
      <EditSectionMessage
        oldMessage={
          (
            messages[chatId].find(
              (message) => message.id === id
            ) as SectionMessageType
          )?.content.text
        }
        chatId={chatId}
        id={id}
        onEditCancel={() => setIsEditing(false)}
      />
    )
  }

  const sectionMessage = messages[chatId].find(
    (message) => message.id === id
  ) as SectionMessageType

  const sectionNumber = messages[chatId]
    .filter((message) => message.type === 'section')
    .findIndex((message) => message.id === id)

  return (
    <DragAndDropProvider
      isDragDisabled={false}
      droppableId={sectionMessage.id}
      draggableId={sectionMessage.id}
      index={messages[chatId].findIndex((message) => message.id === id)}
    >
      
      <div
        onClick={() => canEdit && toggleSection(chatId, id)}
        className={`z-50 mb-2 flex w-full items-center justify-between ${canEdit ? 'cursor-pointer' : ''}`}
      >  <div
      onClick={(e) => {
        e.stopPropagation()
        canEdit && toggleSection(chatId, id)
      }}
      className='z-50 mr-2 mt-3 ml-[-15px] flex min-h-[30px] min-w-[30px] items-center justify-center rounded-full border border-white bg-[#f1f9ff] transition-all duration-300 hover:border-[#0c88ee]/50'
    >
      {sectionMessage.content.isClosed ? (
        <Plus className='h-3 min-w-3 text-[#0c88ee]' />
      ) : (
        <Minus className='h-3 min-w-3 text-[#0c88ee]' />
      )}
    </div>
        <div className='mx-2 mt-3 flex h-fit w-full items-center justify-between rounded border border-dashed border-[#0c88ee] bg-[#f1f9ff] px-2 py-1.5'>
          <div className='flex flex-1 items-center justify-start gap-1 px-3'>
            <div className="font-['Inter'] text-sm font-semibold leading-tight text-[#0c88ee]">
              {sectionNumber + 1}. {sectionMessage.content.text}
            </div>
          </div>
          <MessageActionButtons
            onDelete={(e) => {
              e.stopPropagation()
              deleteMessage(chatId, id)
            }}
            onEdit={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          />
        </div>
      
      </div>
    </DragAndDropProvider>
  )
}
