import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { IoIosMic, IoIosPause, IoIosPlay } from 'react-icons/io'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageBubble } from './message-bubble'
import { BaseMessageProps } from './text-message'
import { useChatContext } from '../chat-context'

import {
  formatDateToTime,
  formatSecondsToTime,
} from '@/utils/format-date-to-time'

export const AudioMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & BaseMessageProps
>(({ className, message, ...props }, ref) => {
  const { chatInfo } = useChatContext()
  const waveSurferRef = useRef<HTMLDivElement | null>(null)
  const sentAt = useMemo(() => formatDateToTime(new Date()), [])

  const [isPlaying, setPlaying] = useState<boolean>(false)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)

  const AudioStateIcon = useMemo(
    () => (isPlaying ? IoIosPause : IoIosPlay),
    [isPlaying]
  )

  const waveSurfer = useMemo(
    () =>
      waveSurferRef.current &&
      WaveSurfer.create({
        container: waveSurferRef.current,
        waveColor: '#CED0D1',
        progressColor: '#858A8D',
        cursorColor: 'transparent',
        normalize: true,
        cursorWidth: 2,
        barHeight: 0,
        barRadius: 3,
        barWidth: 3,
        height: 25,
        hideScrollbar: true,
        interact: true,
      }),
    [waveSurferRef.current]
  )

  const handlePlay = useCallback(async () => {
    await waveSurfer?.playPause()
    setPlaying((state) => !state)
  }, [waveSurfer])

  useEffect(() => {
    const audioUrl = (message.content as any)?.url
    if (waveSurfer && audioUrl) {
      waveSurfer.load(audioUrl)

      waveSurfer.on('ready', () => {
        setAudioDuration(waveSurfer.getDuration())
      })

      waveSurfer.on('audioprocess', () => {
        setCurrentTime(waveSurfer.getCurrentTime())

        const progress =
          (waveSurfer.getCurrentTime() / waveSurfer.getDuration()) * 100
        setProgress(progress)

        if (progress === 100) {
          waveSurfer.setTime(0)
          waveSurfer.pause()
          setPlaying(false)
          setProgress(0)
        }
      })
    }

    return () => waveSurfer?.destroy()
  }, [waveSurferRef.current])

  function handleProgressClick(e: React.MouseEvent) {
    e.stopPropagation()

    const { left, width } = waveSurferRef.current?.getBoundingClientRect() || {
      left: 0,
      width: 0,
    }
    const newProgress = ((e.clientX - left) / width) * 100
    const newTime = (newProgress / 100) * audioDuration

    setProgress(newProgress)
    setCurrentTime(newTime)

    if (waveSurfer) waveSurfer.seekTo(newProgress / 100)
  }

  return (
    <MessageBubble
      type={message.from}
      className={className}
      ref={ref}
      {...props}
    >
      <div className='flex min-w-fit gap-2 py-2'>
        {/* Play/Pause button */}
        <button onClick={handlePlay}>
          <AudioStateIcon size={30} className='text-zinc-500' />
        </button>

        {/* Audio bar */}
        <div className='relative mx-3 flex min-w-[180px] items-center justify-between'>
          <span
            onClick={handleProgressClick}
            ref={waveSurferRef}
            className='relative min-w-[180px]'
          />

          <span
            onClick={handleProgressClick}
            className={`absolute left-0 z-50 h-3 w-3 rounded-full bg-[#4FC3F7]`}
            style={{ left: `calc(${progress}% - 0.25rem)` }}
          />

          {/* Timers */}
          <div className='absolute -bottom-3.5 flex w-full justify-between text-xs text-zinc-600'>
            <span>
              {formatSecondsToTime(isPlaying ? currentTime : audioDuration)}
            </span>
            <span>{sentAt}</span>
          </div>
        </div>

        <div className='relative h-10 w-10'>
          <IoIosMic className='absolute -bottom-0.5 -left-0.5 z-50 h-5 w-5 text-[#45AACA]' />
          <Avatar>
            <AvatarImage src={chatInfo.favicon_url!} />
            <AvatarFallback>{chatInfo.bot_name?.[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </MessageBubble>
  )
})
