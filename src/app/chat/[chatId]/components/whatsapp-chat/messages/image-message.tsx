import React from 'react'
import { Message } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDateToTime } from '@/utils/format-date-to-time'
import { MessageBubble } from './message-bubble'
import Image from 'next/image'
import { customMarkdownParser } from './text-message'
import { cn } from '@/lib/utils'

export type BaseMessageProps = { message: Message }

export const ImageMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & BaseMessageProps
>(({ className, message, ...props }, ref) => {
  if (!(message.content as any)?.url) return

  const sentAt = React.useMemo(() => formatDateToTime(new Date()), [])

  return (
    <MessageBubble
      type={message.from}
      className={cn(className, 'flex-col')}
      ref={ref}
      {...props}
    >
      <div className='relative min-h-80 rounded-md'>
        <Image
          alt='Imagem'
          layout='fill'
          className='rounded-lg'
          src={(message.content as any)?.url} 
        />
      </div>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className='mr-12 max-w-[370px] text-wrap break-words'
      >
        {customMarkdownParser((message.content as any)?.legend ?? '')}
      </ReactMarkdown>
      <span className='absolute bottom-3 right-3 -my-1 self-end text-xs text-zinc-500'>
        {sentAt}
      </span>
    </MessageBubble>
  )
})
