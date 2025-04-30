'use client'

import { Button } from '@/components/ui/button'
import { TimePickerDemo } from '@/components/ui/time-picker'
import { uploadMedia } from '@/utils/upload'
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
  Clock,
  ImageIcon,
  VideoIcon,
  Loader,
  Mic,
  Move,
  Pencil,
  Trash,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

interface CardProps {
  title?: string
  content: any
  onEdit?: () => void
  onDelete?: () => void
  index: number
  setItemContent: any
  activeComponent?: any
  isLoading?: boolean
  setHasDynamicDelay: (hasDynamicDelay: boolean) => void
  hasDynamicDelay: boolean
  minutes: any
  setMinutes: (minutes: any) => void
  seconds: any
  setSeconds: (seconds: any) => void
  isImage?: boolean
}

/**
 * Componente CardComponent.
 *
 * @param {Object} props - Propriedades do componente.
 * @returns {JSX.Element} - Elemento JSX que representa um card.
 */
const CardComponent = ({
  title,
  icon: Icon,
  content,
  onDelete,
  isUpload,
  activeComponent,
  handleUploadClick,
  active: isActive,
  isLoading,
  setHasDynamicDelay,
  hasDynamicDelay,
  minutes,
  setMinutes,
  seconds,
  setSeconds,
}: {
  title: string
  icon: any
  content: { text: string; url: string; filename: string }
  onDelete?: () => void
  isUpload?: boolean
  index: number
  activeComponent?: any
  handleUploadClick?: () => void
  active?: boolean
  setItemContent?: any
  isLoading?: boolean
  setHasDynamicDelay: (hasDynamicDelay: boolean) => void
  minutes: any
  setMinutes: (minutes: any) => void
  seconds: any
  setSeconds: (seconds: any) => void
  hasDynamicDelay: boolean
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    setActive(isActive != undefined ? isActive : content ? true : false)
  }, [isActive, content])

  const convertToSeconds = (minutes: number, seconds: number) => {
    const totalTimeSum = minutes * 60 + seconds
    return totalTimeSum
  }

  const handleChangeDynamicDelay = () => {
    setHasDynamicDelay(!hasDynamicDelay)
  }

  return (
    <div ref={ref} className='relative max-w-[390px] rounded-lg border-none'>
      {active ? (
        <>{activeComponent}</>
      ) : (
        <div
          onClick={() =>
            isUpload && handleUploadClick
              ? handleUploadClick()
              : setActive(true)
          }
          className='flex h-[124px] max-w-[390px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-400 bg-slate-100'
        >
          {isLoading ? (
            <Loader
              className='absolute z-50 animate-spin text-zinc-600 duration-1000'
              size={50}
            />
          ) : (
            <div className='flex flex-col items-center justify-center gap-2'>
              <Icon className='h-6 w-6 text-slate-700' />
              <span className='text-sm text-slate-700'>
                {content?.text || `Adicionar ${title.toLowerCase()}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ImageCard(props: CardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(!!props.content?.url)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useKindeBrowserClient()

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    fileInputRef.current?.click()
  }

  useEffect(() => {
    setActive(!!props.content?.url)
  }, [props.content?.url])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id) {
      console.error("User ID not found. Cannot upload.")
      toast.error('Erro de autenticação. Não foi possível enviar.')
      return
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const filename = file.name
      setIsLoading(true)
      try {
        const uploadResult = await uploadMedia(file, user.id)
        if (uploadResult?.url) {
          props.setItemContent({ url: uploadResult.url, name: uploadResult.filename || filename })
          setActive(true)
          toast.success('Imagem enviada com sucesso!')
        } else {
          console.error('Upload completed but no URL received or upload failed silently.')
          toast.error('Falha ao enviar imagem. Tente novamente.')
          setActive(false)
        }
      } catch (error) {
        console.error('Error during image upload process in component:', error)
        toast.error(`Erro ao enviar imagem: ${(error as Error).message}`)
        setActive(false)
      } finally {
        setIsLoading(false)
        if (e.target) {
          e.target.value = ''
        }
      }
    }
  }

  const activeComponent = (
    <div
      className='relative flex h-[220px] w-full flex-col items-center justify-center overflow-hidden rounded-md border-[1px] bg-slate-100'
      style={{
        backgroundImage: props.content?.url ? `url(${props.content.url})` : 'none',
        backgroundColor: props.content?.url ? 'transparent' : '#f1f5f9',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {isLoading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/30'>
          <Loader2 className='animate-spin text-white' size={40} />
        </div>
      )}
      {!isLoading && props.content?.url && (
        <div className='absolute bottom-4 right-4 z-20 flex flex-col gap-2'>
          <Button
            onClick={handleUploadClick}
            variant={'outline'}
            size={'icon'}
            className='h-9 w-9 rounded-full bg-white'
            aria-label="Editar imagem"
          >
            <Pencil className='h-4 w-4 text-gray-500' />
          </Button>
          <Button
            onClick={() => {
              props.setItemContent({ url: null, name: null })
              setActive(false)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            variant={'outline'}
            size={'icon'}
            className='h-9 w-9 rounded-full bg-white'
            aria-label="Remover imagem"
          >
            <Trash2 className='h-4 w-4 text-gray-500' />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      <input
        type='file'
        accept='image/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <CardComponent
        title='Imagem'
        icon={ImageIcon}
        isUpload={true}
        activeComponent={activeComponent}
        active={active}
        handleUploadClick={handleUploadClick}
        isLoading={isLoading}
        {...props}
      />
    </>
  )
}

/**
 * Componente AudioCard.
 *
 * @param {CardProps} props - Propriedades do componente.
 * @returns {JSX.Element} - Elemento JSX que representa um card de áudio.
 */
export function AudioCard(props: CardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(!!props.content?.url)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useKindeBrowserClient()

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    fileInputRef.current?.click()
  }

  useEffect(() => {
    setActive(!!props.content?.url)
  }, [props.content?.url])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id) {
      console.error("User ID not found. Cannot upload.")
      toast.error('Erro de autenticação. Não foi possível enviar.')
      return
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const filename = file.name
      setIsLoading(true)
      try {
        const uploadResult = await uploadMedia(file, user.id)
        if (uploadResult?.url) {
          props.setItemContent({
            url: uploadResult.url,
            filename: uploadResult.filename || filename,
          })
          setActive(true)
          toast.success('Áudio enviado com sucesso!')
        } else {
          console.error('Upload completed but no URL received or upload failed silently.')
          toast.error('Falha ao enviar áudio. Tente novamente.')
          setActive(false)
        }
      } catch (error) {
        console.error('Error during audio upload process in component:', error)
        toast.error(`Erro ao enviar áudio: ${(error as Error).message}`)
        setActive(false)
      } finally {
        setIsLoading(false)
        if (e.target) {
          e.target.value = ''
        }
      }
    }
  }

  const activeComponent = (
    <div className='flex w-full flex-col gap-2'>
      <div className='relative flex h-auto min-h-[100px] w-full flex-col items-center justify-center overflow-hidden rounded-md border-[1px] bg-slate-100 p-4'>
        {isLoading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/30'>
            <Loader2 className='animate-spin text-white' size={40} />
          </div>
        )}
        {!isLoading && (
          <>
            <Mic className='mb-2 h-6 w-6 text-slate-700' />
            <span className='mb-3 max-w-full truncate px-2 text-center text-sm text-slate-700'>
              {props.content?.filename || (props.content?.url ? 'Áudio carregado' : 'Nenhum áudio')}
            </span>
            {props.content?.url && (
              <audio controls controlsList="nodownload" className='w-full max-w-[300px]'>
                <source src={props.content.url} type={props.content.fileType || 'audio/mpeg'} />
                Seu navegador não suporta a tag de áudio.
              </audio>
            )}
          </>
        )}
        {!isLoading && props.content?.url && (
          <div className='absolute bottom-2 right-2 z-20 flex flex-col gap-2'>
            <Button
              onClick={handleUploadClick}
              variant={'outline'}
              size={'icon'}
              className='h-8 w-8 rounded-full bg-white'
              aria-label="Editar áudio"
            >
              <Pencil className='h-3 w-3 text-gray-500' />
            </Button>
            <Button
              onClick={() => {
                props.setItemContent({ url: null, filename: null, simulateRecording: false, recordingTime: null })
                setActive(false)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              variant={'outline'}
              size={'icon'}
              className='h-8 w-8 rounded-full bg-white'
              aria-label="Remover áudio"
            >
              <Trash2 className='h-3 w-3 text-gray-500' />
            </Button>
          </div>
        )}
      </div>
      {active && !isLoading && (
        <div className='flex w-full items-center justify-between gap-2 px-1'>
          <div className="flex items-center space-x-2">
            <Switch 
              id={`dynamic-delay-switch-${props.index}`}
              checked={props.hasDynamicDelay} 
              onCheckedChange={props.setHasDynamicDelay}
              aria-label="Ativar atraso dinâmico"
            />
            <label htmlFor={`dynamic-delay-switch-${props.index}`} className="text-sm font-medium text-gray-700">
              Atraso
            </label>
          </div>
          {props.hasDynamicDelay && (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-gray-600" />
                    {`${props.minutes || 0}m ${props.seconds || 0}s`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-auto p-0">
                   <div className="p-4">
                     <TimePickerDemo 
                        date={new Date(0, 0, 0, props.minutes || 0, props.seconds || 0)} 
                        setDate={(date) => {
                          if (date instanceof Date) {
                            props.setMinutes(date.getMinutes());
                            props.setSeconds(date.getSeconds());
                          }
                        }}
                     />
                   </div>
                </DropdownMenuContent>
              </DropdownMenu>
          )}
        </div>
      )}
    </div>
  )

  return (
    <>
      <input
        type='file'
        accept='audio/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <CardComponent
        title='Áudio'
        icon={Mic}
        isUpload={true}
        activeComponent={activeComponent}
        active={active}
        handleUploadClick={handleUploadClick}
        isLoading={isLoading}
        {...props}
      />
    </>
  )
}
