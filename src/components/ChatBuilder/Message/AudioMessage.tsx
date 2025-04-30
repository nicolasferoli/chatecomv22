'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import { Clock, Move, Pause, Play, Trash } from 'lucide-react'
import { AudioCard } from '@/components/ChatBuilder/MediaCards'
import {
  AudioMessageType,
  CreateMediaMessageProps,
  CreateMessageRequest,
  EditAudioMessageProps,
  EditMessageProps,
  MessageProps,
  SectionMessageType,
} from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMessages } from '@/stores/useMessages'
import Image from 'next/image'
import { IoIosPlay, IoIosPause, IoIosMic } from 'react-icons/io'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DragAndDropProvider } from '@/components/DragAndDropProvider'
import { url } from 'inspector'
import { init } from 'next/dist/compiled/webpack/webpack'
import WaveSurfer from 'wavesurfer.js'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

interface AudioMessageFormProps {
  chatId: string
  initialAudio?: { url: string; name: string }
  initialHasDynamicDelay?: boolean
  initialSeconds?: string
  initialMinutes?: string
  onSave: (
    audio: { url: string; name: string },
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
}

function AudioMessageForm({
  chatId,
  onSave,
  onCancel,
  onDelete,
  initialAudio = { url: '', name: '' },
  initialHasDynamicDelay = true,
  initialSeconds = '3',
  initialMinutes = '0',
}: AudioMessageFormProps) {
  const [audioData, setAudioData] = useState(initialAudio)
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
    if (!audioData?.url.trim()) return
    await onSave(
      audioData,
      hasDynamicDelay,
      convertToMiliseconds(+minutes, +seconds)
    )
    setAudioData({ url: '', name: '' })
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
      <AudioCard
        content={audioData}
        hasDynamicDelay={hasDynamicDelay}
        setHasDynamicDelay={setHasDynamicDelay}
        minutes={minutes}
        setMinutes={setMinutes}
        seconds={seconds}
        setSeconds={setSeconds}
        index={123}
        setItemContent={setAudioData}
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
                        Gravação dinâmica
                      </span>
                    ) : (
                      <div>
                        {convertToSeconds(+minutes, +seconds)}s{' '}
                        <span className='sr-only sm:not-sr-only'>Gravando</span>
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
                          Define o tempo de gravação automaticamente com base no
                          tamanho da mensagem.
                        </p>
                      )}
                    </div>
                  </DropdownMenuItem>
                  {!hasDynamicDelay && (
                    <>
                      <DropdownMenuLabel className='font-normal text-zinc-800'>
                        Simular gravação por:
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

export function CreateAudioMessage({ chatId }: CreateMediaMessageProps) {
  const { createMessage, getMessages, stopCreatingMessage } = useMessages()

  const handleSave = async (
    audio: { url: string; name: string },
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      chatId,
      type: 'audio',
      content: {
        media_name: audio.name,
        url: audio.url,
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
    <AudioMessageForm
      chatId={chatId}
      onSave={handleSave}
      onCancel={() => stopCreatingMessage(chatId)}
    />
  )
}

export function EditAudioMessage({
  chatId,
  id,
  onEditCancel,
  initialAudio,
  oldHasDynamicDelay,
  oldSeconds,
  oldMinutes,
}: EditAudioMessageProps & { onEditCancel: () => void }) {
  const { editMessage, getMessages, deleteMessage } = useMessages()

  const handleDelete = async () => {
    await deleteMessage(chatId, id)
  }

  const handleSave = async (
    audio: {
      url: string
      name: string
      initialAudio?: { url: string; name: string }
    },
    hasDynamicDelay: boolean,
    delayValue: Number
  ) => {
    const messageData = {
      type: 'audio',
      content: {
        media_name: audio.name,
        url: audio.url,
        initialAudio: { url: audio.url, name: audio.name },
        hasDynamicDelay,
        delayValue,
      },
    }

    try {
      await editMessage(id, messageData as AudioMessageType)
      await getMessages(chatId)
      onEditCancel()
    } catch (error) {
      console.error('❌ -> Erro ao editar mensagem:', error)
    }
  }

  return (
    <AudioMessageForm
      initialHasDynamicDelay={oldHasDynamicDelay}
      initialMinutes={oldMinutes}
      initialSeconds={oldSeconds}
      initialAudio={initialAudio}
      chatId={chatId}
      onSave={handleSave}
      onCancel={onEditCancel}
      onDelete={handleDelete}
    />
  )
}

export function AudioMessage({
  id,
  chatId,
  canEdit,
  favIconUrl,
  chatName,
  createdAt,
  formatedDate,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const {
    getMessages,
    messages,
    checkIfMessageIsHidden,
    checkIfMessageIsInsideSection,
  } = useMessages()
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)
  const waveformRef = useRef<HTMLDivElement>(null)
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const message = messages[chatId].find(
    (message) => message.id === id
  ) as AudioMessageType

  useEffect(() => {
    if (waveformRef.current) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#CED0D1',
        progressColor: '#858A8D',
        cursorColor: 'transparent',
        // normalize: true,
        cursorWidth: 2,
        barHeight: 0,
        barRadius: 3,
        barWidth: 3,
        height: 25,
        hideScrollbar: true,
        interact: true,
      })

      setWaveSurfer(ws)
      return () => ws.destroy() // Limpa o WaveSurfer ao desmontar
    }
  }, [isEditing])

  const handlePlayPause = () => {
    if (waveSurfer) {
      if (waveSurfer.isPlaying()) {
        waveSurfer.pause()
        setIsPlaying(false)
      } else {
        waveSurfer.play()
        setIsPlaying(true)
      }
    }
  }

  const handleProgressClick = (e: React.MouseEvent) => {
    const { left, width } = waveformRef.current?.getBoundingClientRect() || {
      left: 0,
      width: 0,
    }
    const clickX = e.clientX - left
    const newProgress = (clickX / width) * 100
    const newTime = (newProgress / 100) * duration

    setProgress(newProgress)
    setCurrentTime(newTime)

    if (waveSurfer) {
      waveSurfer.seekTo(newProgress / 100)
    }
  }

  useEffect(() => {
    if (waveSurfer && message.content.url) {
      waveSurfer.load(message.content.url)

      waveSurfer.on('ready', () => {
        setDuration(waveSurfer.getDuration())
      })

      waveSurfer.on('audioprocess', () => {
        setCurrentTime(waveSurfer.getCurrentTime()) // Atualiza o tempo atual
      })

      waveSurfer.on('error', (e) => {
        console.error('Erro no WaveSurfer:', e)
      })
    }
  }, [waveSurfer, message.content.url])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  useEffect(() => {
    if (waveSurfer) {
      waveSurfer.on('ready', () => {
        console.log('Audio ready')
      })

      waveSurfer.on('error', (error) => {
        console.error('WaveSurfer error:', error)
      })

      waveSurfer.on('audioprocess', () => {
        const progress =
          (waveSurfer.getCurrentTime() / waveSurfer.getDuration()) * 100
        setProgress(progress) // Atualiza o estado do progresso
        if (progress === 100) {
          setIsPlaying(false)
          setProgress(0)
        }
      })

      if (message.content.url) {
        waveSurfer.load(message.content.url)
      }
    }
  }, [waveSurfer, message.content.url])

  function convertMillisecondsToMinutesAndSeconds(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000) // Converte para segundos
    const minutes = Math.floor(totalSeconds / 60) // Obtém os minutos
    const seconds = totalSeconds % 60 // Obtém os segundos restantes
    return { minutes, seconds }
  }

  const delayValueInMs = message.content.delayValue || 0
  const { minutes, seconds } =
    convertMillisecondsToMinutesAndSeconds(delayValueInMs)

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
                <EditAudioMessage
                  initialAudio={{
                    url: message.content.url,
                    name: message.content.media_name,
                  }}
                  oldHasDynamicDelay={message.content.hasDynamicDelay ?? false}
                  oldMinutes={minutes.toString()} // Passa os minutos calculados
                  oldSeconds={seconds.toString()} // Passa os segundos calculados
                  chatId={chatId}
                  id={id}
                  onEditCancel={() => {
                    setIsEditing(false)

                    if (audioRef.current) {
                      audioRef.current.pause()
                      audioRef.current.currentTime = 0
                    }
                    setIsPlaying(false)
                    setProgress(0)
                  }}
                />
              </div>
            ) : (
              <div
                onClick={() => canEdit && setIsEditing(true)}
                className={`${canEdit ? 'transition-color mx-3 flex h-fit flex-col rounded-lg border border-dashed border-transparent p-2 duration-300 hover:cursor-pointer hover:border-[1px] hover:border-[#0C88EE] hover:bg-[#C0DDFF6B] hover:drop-shadow-xl' : 'mx-3 p-1'}`}
              >
                <div className='relative flex w-fit max-w-[390px] cursor-pointer justify-start rounded-lg bg-white p-4 text-black shadow-md hover:drop-shadow-md'>
                  <Image
                    className='rotate- absolute -left-2 top-0'
                    src={'/Polygon.svg'}
                    width={15}
                    height={4}
                    alt='polygon'
                  />
                  <IoIosMic className='absolute right-10 top-7 z-50 h-10 w-5 text-[#45AACA]' />
                  <div className='flex max-w-[350px] items-center gap-4 rounded-lg bg-white md:w-[350px]'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayPause()
                      }}
                    >
                      {isPlaying ? (
                        <IoIosPause size={30} className='text-zinc-950' />
                      ) : (
                        <IoIosPlay size={30} className='text-zinc-950' />
                      )}
                    </button>

                    <div className='relative flex w-full flex-grow flex-col justify-center'>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className='mt-1 flex w-full items-center justify-between text-xs text-zinc-600'
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProgressClick(e)
                          }}
                          ref={waveformRef}
                          className='relative w-[140px] sm:w-[180px] md:w-[100%]'
                          style={{ height: '25px' }}
                        />
                        {/* Bolinha do cursor */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProgressClick(e)
                          }}
                          className='absolute left-0 top-2.5 z-50 h-3 w-3 rounded-full bg-[#4FC3F7]'
                          style={{
                            left: `${progress}%`,
                          }}
                        />

                        {isPlaying ? (
                          <span className='absolute left-1 top-8'>
                            {formatTime(currentTime)}
                          </span>
                        ) : (
                          <span className='absolute left-1 top-8'>
                            {formatTime(duration)}
                          </span>
                        )}

                        <span className='absolute right-1 top-8'>
                          {formatedDate}
                        </span>
                      </div>
                    </div>

                    <Avatar className='z-20 h-10 w-10 md:h-[39px] md:w-[39px]'>
                      <AvatarImage src={favIconUrl} />
                      <AvatarFallback>{chatName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DragAndDropProvider>
      </div>
    )
  )
}
