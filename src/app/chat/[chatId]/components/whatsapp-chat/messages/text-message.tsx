import React from 'react'
import { Message } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDateToTime } from '@/utils/format-date-to-time'
import { MessageBubble } from './message-bubble'

export const customMarkdownParser = (text: string) => {
  return text
    .replace(/(\s|^)\*([^*]+)\*/g, '$1**$2**')
    .replace(/(\s|^)_([^_]+)_/g, '$1_$2_')
    .replace(/(\s|^)~([^~]+)~/g, '$1~~$2~~')
}

export type BaseMessageProps = { message: Message }

export const TextMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & BaseMessageProps
>(({ className, message, ...props }, ref) => {
  if (!(message.content as any)?.text) return

  const sentAt = React.useMemo(() => formatDateToTime(new Date()), [])

  return (
    <MessageBubble
      type={message.from}
      className={className}
      ref={ref}
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className='mr-12 max-w-[370px] text-wrap break-words'
      >
        {customMarkdownParser((message.content as any)?.text ?? '')}
      </ReactMarkdown>
      <span className='absolute bottom-3 right-3 -my-1 self-end text-xs text-zinc-500'>
        {sentAt}
      </span>
    </MessageBubble>
  )
})
