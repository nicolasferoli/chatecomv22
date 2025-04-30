import React, { useEffect } from 'react'
import { Message } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDateToTime } from '@/utils/format-date-to-time'
import { MessageBubble } from './message-bubble'
import { ExternalLink } from 'lucide-react'
import { useChatContext } from '../chat-context'
import { redirect } from 'next/navigation'

export type BaseMessageProps = { message: Message }

export const RedirectMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & BaseMessageProps
>(({ className, message, ...props }, ref) => {
  if (!(message.content as any)?.url) return

  const { storeUserAnswer } = useChatContext()

  const redirectUrl = (message?.content as any)?.url?.replace(
    /^https?:\/\//i,
    'https://'
  )
  useEffect(() => {
    const autoRedirect = (message?.content as any)?.redirectBlank
    if (autoRedirect) {
      setTimeout(
        () => window.open(redirectUrl, '_blank', 'noopener,noreferrer'),
        500
      )
    }

    storeUserAnswer('')
  }, [redirectUrl])

  return (
    <MessageBubble
      type={message.from}
      className={className}
      ref={ref}
      {...props}
    >
      <a
        onClick={() => {
          // handleRedirecClick()
        }}
        href={redirectUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        <div className='flex w-full items-center gap-2 px-2'>
          <span>
            <span className='font-medium text-blue-500'>
              {new URL(redirectUrl).hostname}
            </span>
          </span>
          <ExternalLink size={18} className='text-blue-500' />
        </div>
      </a>
      {/* storeUserAnswer */}
    </MessageBubble>
  )
})
