import React, { useState } from 'react'
import { Message } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDateToTime } from '@/utils/format-date-to-time'
import { MessageBubble } from './message-bubble'
import { customMarkdownParser } from './text-message'
import { cn } from '@/lib/utils'
import { useChatContext } from '../chat-context'

export type BaseMessageProps = {
  message: Message
}

export const ButtonsMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & BaseMessageProps
>(({ className, message, ...props }, ref) => {
  const content = message.content as any;
  if (!content?.text) return null;

  const { storeUserAnswer } = useChatContext()
  const [disabled, setDisabled] = useState<boolean>(false)

  const sentAt = React.useMemo(() => formatDateToTime(new Date(message.createdAt)), [message.createdAt])

  const buttons: string[] = Array.isArray(content?.buttons) ? content.buttons : [];

  return (
    <div className='mx-4 my-1 flex w-fit flex-col items-end gap-1'>
      <MessageBubble
        type={message.from}
        className={cn(
          'm-0 flex min-w-[120px] max-w-full flex-col',
          className
        )}
        ref={ref}
        {...props}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className='px-1 pb-2 mr-12 max-w-[370px] text-wrap break-words'
        >
          {customMarkdownParser(content.text ?? '')}
        </ReactMarkdown>
        <span className='absolute bottom-1 right-2 text-[10px] text-zinc-500'>
          {sentAt}
        </span>
      </MessageBubble>

      {buttons.map((buttonName: string, index: number) => (
        <button
          key={index}
          className={cn(
            'mt-0.5 max-w-full rounded-md bg-white px-4 py-2 text-center text-sm font-medium shadow-sm',
            'text-[#0C88EE] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C88EE]',
            disabled ? 'cursor-not-allowed opacity-70' : 'hover:cursor-pointer'
          )}
          onClick={async () => {
            if (disabled) return;
            setDisabled(true)
            await storeUserAnswer(buttonName)
          }}
          disabled={disabled}
        >
          {buttonName}
        </button>
      ))}
    </div>
  )
})
