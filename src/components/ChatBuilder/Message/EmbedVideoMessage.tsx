'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Car, Pencil, Trash, Video } from 'lucide-react'
import { useMessages } from '@/stores/useMessages'
import {
  CreateMediaMessageProps,
  EditMessageProps,
  CreateMessageRequest,
  EmbedMessageType,
  EmbedOptions,
} from '@/types'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { Card } from '@/components/ui/card'
import Script from 'next/script'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast, ToastContainer } from 'react-toastify'

interface EmbedMessageFormProps {
  chatId: string
  canEdit
  initialUrl?: string
  initialEmbedType?: string
  onSave: (embed: { url: string }, embedType) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
  id?: string
}

function EmbedMessageForm({
  chatId,
  canEdit,
  initialUrl = '',
  initialEmbedType = 'youtube',
  onSave,
  onCancel,
  onDelete,
  id,
}: EmbedMessageFormProps) {
  const [embedData, setEmbedData] = useState<{ url: string }>({
    url: initialUrl,
  })
  const [embedType, setEmbedType] = useState(initialEmbedType)
  const [haveEmbed, setHaveEmbed] = useState<boolean>(canEdit)

  const handleSave = async () => {
    verifyEmbedUrl()

    if (!embedData.url.trim()) {
      toast.warn('Preencha uma URL')
      return
    }
    if (embedData.url.trim() === '' || !isValidEmbedLink(embedData.url)) {
      toast.warn('Preencha uma url válida.')
      return
    }
    await onSave(embedData, embedType)
    setEmbedData({ url: '' })
  }

  const verifyEmbedUrl = () => {
    const normalizedUrl = embedData.url.trim()

    if (embedData.url.trim() === '') {
      toast.warn('Preencha uma URL.')
      return
    }

    if (
      embedType === 'youtube' &&
      isNormalYoutubeLink(normalizedUrl) === false
    ) {
      toast.warn('Você precisa preencher uma URL do youtube!')
      return
    }

    if (
      embedType === 'youtube' &&
      isNormalYoutubeLink(normalizedUrl) === true
    ) {
      // Verifica se é um link normal do YouTube e converte para embed
      if (isNormalYoutubeLink(normalizedUrl)) {
        embedData.url = convertToYoutubeEmbedLink(normalizedUrl) // Converte para embed do YouTube
        toast.success('Link do YouTube convertido para embed com sucesso.')
      }
      toast.success('Embed carregado com sucesso')
      setHaveEmbed(true)
      return
    }

    if (embedType === 'vimeo' && isNormalVimeoLink(normalizedUrl) === false) {
      toast.warn('Você precisa preencher uma URL do vimeo!')
      return
    }

    if (embedType === 'vimeo' && isNormalVimeoLink(normalizedUrl) === true) {
      // Verifica se é um link normal do Vimeo e converte para embed
      if (isNormalVimeoLink(normalizedUrl)) {
        embedData.url = convertToVimeoEmbedLink(normalizedUrl) // Converte para embed do Vimeo
        toast.success('Link do Vimeo convertido para embed com sucesso.')
      }
      toast.success('Embed carregado com sucesso')
      setHaveEmbed(true)
      return
    }

    if (embedType === 'vturb') {
      const iframeUrl = extractVturbIframeSrc(normalizedUrl)
      if (iframeUrl == null) {
        toast.warn('Você precisa preencher um iframe válido do Vturb!')
        return
      }

      embedData.url = iframeUrl
      console.log('embedData.url', embedData.url)
      setHaveEmbed(true)
    }

    if (
      embedType === 'pandavideo' &&
      isNormalPandaLink(normalizedUrl) === false
    ) {
      toast.warn('Você precisa preencher um embed do PandaVideo!')
      return
    }

    if (
      embedType === 'pandavideo' &&
      isNormalPandaLink(normalizedUrl) === true
    ) {
      embedData.url = extractPandaIframeSrc(normalizedUrl) as string
      toast.success(isNormalPandaLink(normalizedUrl))
      setHaveEmbed(true)
      return
    }

    // Verifica se o link é um embed válido (YouTube ou Vimeo)
    if (!isValidEmbedLink(embedData.url)) {
      toast.warn('Preencha uma URL válida.')
      return
    }
  }

  // Função para verificar se o link é um URL normal do YouTube
  const isNormalYoutubeLink = (url) => {
    return /https:\/\/www\.youtube\.com\/watch\?v=/.test(url)
  }

  // Função para verificar se o link é um URL normal do Vimeo
  const isNormalVimeoLink = (url) => {
    return /https:\/\/vimeo\.com\/\d+/.test(url)
  }

  const isNormalPandaLink = (input) => {
    const iframeRegex =
      /^<iframe[^>]*\s+id=["'][^"']+["'][^>]*\s+src=["']https:\/\/player-vz-[a-zA-Z0-9-]+\.tv\.pandavideo\.com\.br\/embed\/\?v=[a-zA-Z0-9-]+["'][^>]*><\/iframe>$/

    return iframeRegex.test(input)
  }

  const isVturbEmbed = (input) => {
    const vturbRegex = /^<div[^>]*\s+id=["'][a-zA-Z0-9_-]+["'][^>]*>/
    return vturbRegex.test(input)
  }

  // Função para verificar se o link é um embed válido (YouTube ou Vimeo)
  const isValidEmbedLink = (url) => {
    return (
      /https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/.test(url) ||
      /https:\/\/player\.vimeo\.com\/video\/\d+/.test(url) ||
      /https:\/\/player-vz-[a-zA-Z0-9-]+\.tv\.pandavideo\.com\.br\/embed\/\?v=[a-zA-Z0-9-]+/.test(
        url
      ) ||
      /\b[a-zA-Z0-9]+\b/.test(url) // Verifica qualquer sequência alfanumérica
    )
  }

  // Função para converter URL normal do YouTube para embed
  const convertToYoutubeEmbedLink = (youtubeUrl) => {
    const videoIdMatch = youtubeUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1]
      return `https://www.youtube.com/embed/${videoId}`
    } else {
      throw new Error('ID de vídeo não encontrado na URL do YouTube.')
    }
  }

  // Função para converter URL normal do Vimeo para embed
  const convertToVimeoEmbedLink = (vimeoUrl) => {
    const videoIdMatch = vimeoUrl.match(/vimeo\.com\/(\d+)/)
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1]
      return `https://player.vimeo.com/video/${videoId}`
    } else {
      throw new Error('ID de vídeo não encontrado na URL do Vimeo.')
    }
  }

  function extractPandaIframeSrc(iframeString: string): string | null {
    const srcMatch = iframeString.match(/src="([^"]+)"/)
    return srcMatch ? srcMatch[1] : null
  }

  function extractEmbedId(embedHtml) {
    const regex = /id="vid_(\w+)"/ // Regex para encontrar o ID do embed
    const match = embedHtml.match(regex)
    return match ? match[1] : null // Retorna o ID ou null se não encontrar
  }

  function extractVturbIframeSrc(iframeString: string): string | null {
    const result = /<iframe[^>]+src="([^"]+)"/.exec(iframeString)
    console.log({ result })
    return result?.[1] ?? null
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
    <div className='m-4 flex h-fit w-full flex-col gap-2 rounded-lg border border-dashed border-[#0C88EE] bg-[#C0DDFF6B] p-4 transition-all ease-in-out'>
      {haveEmbed ? (
        ''
      ) : (
        <Card className='text-[#344054]2 flex w-full max-w-[390px] flex-col gap-3 p-3'>
          <div>
            <Label className='text-xs text-zinc-800'>
              Qual player de vídeo deseja utilizar?
            </Label>
            <Select
              value={embedType}
              onValueChange={(value) =>
                setEmbedType(value as EmbedOptions['type'])
              }
              defaultValue='text'
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select a type' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='youtube'>Youtube</SelectItem>
                  <SelectItem value='vimeo'>Vimeo</SelectItem>
                  <SelectItem value='vturb'>Vturb</SelectItem>
                  <SelectItem value='pandavideo'>Pandavideo</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}
      <Card className='text-[#344054]2 flex w-full max-w-[390px] flex-col gap-3 p-3'>
        {haveEmbed ? (
          embedType === 'vturb' ? (
            <VideoPlayer id={embedData.url} />
          ) : (
            <iframe
              src={embedData.url}
              className='h-full w-full rounded-md sm:h-[262px]'
              allowFullScreen
            ></iframe>
          )
        ) : (
          <div>
            {embedType === 'youtube' || embedType === 'vimeo' ? (
              <Label className='text-xs text-zinc-800'>
                Insira a URL do vídeo aqui...
              </Label>
            ) : (
              <Label className='text-xs text-zinc-800'>
                Insira o {`</Embed>`} do vídeo aqui...
              </Label>
            )}
            <div className='flex gap-2 text-zinc-800'>
              <textarea
                className={`h-10 w-full max-w-[390px] rounded-md border border-gray-300 p-2 text-sm ${
                  embedType === 'youtube' || embedType === 'vimeo'
                    ? 'resize-none'
                    : 'min-h-20'
                }`}
                placeholder={
                  embedType === 'youtube' || embedType === 'vimeo'
                    ? 'Insira a URL do vídeo aqui...'
                    : 'Cole o <Embed> disponibilizado aqui...'
                }
                value={embedData.url}
                onChange={(e) => setEmbedData({ url: e.target.value })}
              />
              <Button
                onClick={verifyEmbedUrl}
                className='bg-[#E7F4FF] text-[#0C88EE]'
                variant='outline'
                size='default'
              >
                Carregar
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className='mt-2 flex max-w-[390px] items-center justify-between'>
        <div className='flex gap-2'>
          {onDelete && (
            <div className='flex gap-2'>
              <Button
                className='rounded-full text-zinc-900'
                variant='outline'
                size='icon'
                onClick={onDelete}
              >
                <Trash className='h-4 w-4' />
              </Button>
              <Button
                className='rounded-full text-zinc-900'
                variant='outline'
                size='icon'
                onClick={() => {
                  setHaveEmbed(false)
                }}
              >
                <Pencil className='h-4 w-4' />
              </Button>
            </div>
          )}

          {haveEmbed && !onDelete && (
            <Button
              className='rounded-full text-zinc-900'
              variant='outline'
              size='icon'
              onClick={() => {
                setHaveEmbed(false)
              }}
            >
              <Pencil className='h-4 w-4' />
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
      <ToastContainer style={{ zIndex: 9999 }} />
    </div>
  )
}

export function CreateEmbedMessage({ chatId }: CreateMediaMessageProps) {
  const { createMessage, getMessages, stopCreatingMessage } = useMessages()

  const handleSave = async (embed: { url: string }, embedType) => {
    const messageData = {
      chatId,
      type: 'embed',
      content: { url: embed.url, embedType: embedType },
    }

    try {
      await createMessage(messageData as CreateMessageRequest)
      await getMessages(chatId)
    } catch (error) {
      console.error('❌ -> Erro ao enviar mensagem:', error)
    }
  }

  return (
    <EmbedMessageForm
      canEdit={false}
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

export function EditEmbedMessage({
  chatId,
  id,
  onEditCancel,
  initialUrl,
  oldEmbedType,
}: {
  chatId: string
  id: string
  onEditCancel: () => void
  initialUrl: string
  oldEmbedType: string
}) {
  const { editMessage, getMessages, deleteMessage } = useMessages()

  const handleDelete = async () => {
    await deleteMessage(chatId, id)
  }

  const handleSave = async (embed: { url: string }, embedType) => {
    const messageData = {
      type: 'embed',
      content: { url: embed.url, embedType },
    }

    try {
      await editMessage(id, messageData as EmbedMessageType)
      await getMessages(chatId)
      onEditCancel()
    } catch (error) {
      console.error('❌ -> Erro ao editar mensagem:', error)
    }
  }

  return (
    <EmbedMessageForm
      canEdit={true}
      initialUrl={initialUrl}
      initialEmbedType={oldEmbedType}
      chatId={chatId}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

export function EmbedMessage({
  id,
  chatId,
  canEdit,
  formatedDate,
}: {
  id: string
  chatId: string
  canEdit: boolean
  formatedDate: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const { messages, checkIfMessageIsHidden, checkIfMessageIsInsideSection } =
    useMessages()

  const message = messages[chatId].find(
    (message) => message.id === id
  ) as EmbedMessageType

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
                <EditEmbedMessage
                  initialUrl={message.content.url}
                  oldEmbedType={message.content.embedType || 'defaultEmbedType'}
                  chatId={chatId}
                  id={id}
                  onEditCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <div
                onClick={() => canEdit && setIsEditing(true)}
                className={`${
                  canEdit
                    ? 'transition-color mx-3 flex h-fit flex-col rounded-lg border border-dashed border-transparent p-2 duration-300 hover:cursor-pointer hover:border-[1px] hover:border-[#0C88EE] hover:bg-[#C0DDFF6B] hover:drop-shadow-xl'
                    : 'mx-3 p-1'
                }`}
              >
                <div className='relative flex h-full max-h-[262px] w-full max-w-[462px] cursor-pointer flex-col justify-start rounded-lg bg-white p-2 text-black shadow-md hover:drop-shadow-md'>
                  {message.content.embedType === 'vturb' ? (
                    <VideoPlayer id={message.content.url} />
                  ) : (
                    <iframe
                      src={message.content.url}
                      className='h-[200px] w-full rounded-md sm:h-[262px]'
                      allowFullScreen
                    ></iframe>
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

const VideoPlayer = ({ id }) => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Limpa qualquer script existente primeiro
    const cleanup = () => {
      const existingScript = document.getElementById(`scr_${id}`)
      if (existingScript) {
        existingScript.remove()
      }
      // Limpa também qualquer elemento do player que possa ter sido criado
      const existingPlayer = document.getElementById('smartplayer')
      if (existingPlayer) {
        existingPlayer.remove()
      }
    }

    cleanup()
    setIsLoaded(true)

    // Carrega o script com um pequeno delay para garantir que a limpeza foi concluída
    const timeoutId = setTimeout(() => {
      const script = document.createElement('script')
      script.src = `https://scripts.converteai.net/89c158a1-fb55-4ba9-9449-3450fe7ed282/players/${id}/player.js`
      script.async = true
      script.id = `scr_${id}`
      document.body.appendChild(script)
    }, 100)

    return () => {
      cleanup()
      clearTimeout(timeoutId)
      setIsLoaded(false)
    }
  }, [id])

  if (!isLoaded) {
    return null
  }

  return (
    <div className='relative flex h-fit w-full max-w-2xl items-center justify-center overflow-hidden bg-gray-800'>
      <div
        id={`vid_${id}`}
        style={{ position: 'relative', width: '100%', padding: '56.25% 0 0' }}
      >
        <img
          id={`thumb_${id}`}
          src={`https://images.converteai.net/89c158a1-fb55-4ba9-9449-3450fe7ed282/players/${id}/thumbnail.jpg`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          alt='thumbnail'
          fetchPriority='high'
        />
        <div
          id={`backdrop_${id}`}
          style={{
            WebkitBackdropFilter: 'blur(5px)',
            backdropFilter: 'blur(5px)',
            position: 'absolute',
            top: 0,
            height: '100%',
            width: '100%',
          }}
        ></div>
      </div>
    </div>
  )
}
