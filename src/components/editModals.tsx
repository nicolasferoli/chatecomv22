'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TimePickerDemo } from '@/components/ui/time-picker'
import { uploadMedia } from '@/utils/upload'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import {
  Clock,
  ImageIcon,
  Mic,
  Move,
  Pencil,
  Trash,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

interface CardProps {
  title?: string
  content: any
  onEdit?: () => void
  onDelete?: () => void
  index: number
  setItemContent: any
  activeComponent?: any
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
  index,
  isUpload,
  activeComponent,
  handleUploadClick,
  active: isActive,
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
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(isActive != undefined ? isActive : content ? true : false)
  }, [isActive, content])

  return (
    <div ref={ref} className='w-[390px] max-w-md rounded-lg border-none'>
      {active ? (
        <>{activeComponent}</>
      ) : (
        <div
          onClick={() =>
            isUpload && handleUploadClick
              ? handleUploadClick()
              : setActive(true)
          }
          className='flex h-[124px] w-[390px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-400 bg-slate-100'
        >
          <Icon className='h-6 w-6 text-slate-700' />
          <span className='text-sm text-slate-700'>
            {content?.text || `Adicionar ${title.toLowerCase()}`}
          </span>
        </div>
      )}
    </div>
  )
}

export function ImageCard(props: CardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(!!props.content?.url)
  const { user } = useKindeBrowserClient()

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id) {
      console.error("User ID not found. Cannot upload.")
      return
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        const uploadResult = await uploadMedia(file, user.id)
        if (uploadResult?.url) {
          props.setItemContent({ url: uploadResult.url })
          setActive(true)
        } else {
          console.error('Upload completed but no URL received.')
        }
      } catch (error) {
        console.error('Error during image upload process:', error)
      }
    }
  }

  const activeComponent = (
    <div
      className='relative flex h-[220px] w-full flex-col items-center overflow-hidden rounded-md border-[1px] bg-slate-100'
      style={{
        backgroundImage: props.content?.url ? `url(${props.content.url})` : 'none',
        backgroundColor: props.content?.url ? 'transparent' : '#f1f5f9',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {props.content?.url && (
        <div className='absolute bottom-4 right-4 flex flex-col gap-2'>
          <Button
            onClick={handleUploadClick}
            variant={'outline'}
            className='h-10 w-10 rounded-full bg-white p-0'
          >
            <Pencil className='h-4 w-4 text-gray-500' />
          </Button>
          <Button
            onClick={() => {
              props.setItemContent({ url: null })
              setActive(false)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            variant={'outline'}
            className='h-10 w-10 rounded-full bg-white p-0'
          >
            <Trash2 className='h-4 w-4 text-gray-500' />
          </Button>
        </div>
      )}
    </div>
  )

  useEffect(() => {
    setActive(!!props.content?.url);
  }, [props.content?.url]);

  return (
    <>
      <input
        type='file'
        accept='image/*'
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <CardComponent
        title='Imagem'
        icon={ImageIcon}
        isUpload={true}
        activeComponent={activeComponent}
        active={active}
        handleUploadClick={handleUploadClick}
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
  const { user } = useKindeBrowserClient()

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id) {
      console.error("User ID not found. Cannot upload.")
      return
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        const uploadResult = await uploadMedia(file, user.id)
        if (uploadResult?.url) {
          props.setItemContent({
            url: uploadResult.url,
            filename: uploadResult.filename || file.name,
          })
          setActive(true)
        } else {
          console.error('Upload completed but no URL received.')
        }
      } catch (error) {
        console.error('Error during audio upload process:', error)
      }
    }
  }

  useEffect(() => {
    setActive(!!props.content?.url);
  }, [props.content?.url]);

  const activeComponent = (
    <div className='flex w-full flex-col gap-2'>
      <div className='relative flex h-auto min-h-[100px] w-full flex-col items-center justify-center overflow-hidden rounded-md border-[1px] bg-slate-100 p-4'>
        <Mic className='mb-2 h-6 w-6 text-slate-700' />
        <span className='mb-3 max-w-full truncate text-center text-sm text-slate-700'>
          {props.content?.filename || 'Áudio carregado'}
        </span>

        {props.content?.url && (
          <audio controls controlsList="nodownload" className='w-full max-w-[300px]'>
            <source src={props.content.url} type={props.content.fileType || 'audio/mpeg'} />
            Seu navegador não suporta a tag de áudio.
          </audio>
        )}

        <div className='absolute bottom-2 right-2 flex flex-col gap-2'>
          <Button
            onClick={handleUploadClick}
            variant={'outline'}
            className='h-8 w-8 rounded-full bg-white p-0'
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
            className='h-8 w-8 rounded-full bg-white p-0'
          >
            <Trash2 className='h-3 w-3 text-gray-500' />
          </Button>
        </div>
      </div>
      
      <div className='flex w-full items-center justify-between gap-2 px-1'>
        <div className='flex items-center gap-2'>
          <Input
            type='checkbox'
            id={`simulateRecording-${props.index}`}
            className='h-4 w-4 cursor-pointer'
            checked={props.content?.simulateRecording || false}
            onChange={() =>
              props.setItemContent({
                ...props.content,
                simulateRecording: !props.content?.simulateRecording,
              })
            }
          />
          <label htmlFor={`simulateRecording-${props.index}`} className='cursor-pointer text-sm font-medium'>Simular gravando</label>
        </div>
        {props.content?.simulateRecording && (
          <DropdownMenu>
            <DropdownMenuTrigger className='flex cursor-pointer items-center gap-1 rounded-md p-1 text-sm font-medium text-[#027A48] hover:bg-gray-100'>
              {props.content.recordingTime
                ? `${Math.floor(props.content.recordingTime / 1000)}s`
                : '3s'}{' '}
              <Clock className='h-4 w-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent className='rounded-xl bg-white p-4 text-center shadow-lg'>
              <p className='mb-3 text-sm font-medium'>Defina o tempo</p>
              <TimePickerDemo
                date={
                  props.content?.recordingTime
                    ? new Date(props.content.recordingTime)
                    : new Date(0, 0, 0, 0, 0, 3)
                }
                setDate={(date) =>
                  props.setItemContent({
                    ...props.content,
                    recordingTime: date instanceof Date ? date.getTime() : new Date(0, 0, 0, 0, 0, 3).getTime(),
                  })
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
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
      />
      <CardComponent
        title='Áudio'
        icon={Mic}
        isUpload={true}
        activeComponent={activeComponent}
        active={active}
        handleUploadClick={handleUploadClick}
        {...props}
      />
    </>
  )
}
