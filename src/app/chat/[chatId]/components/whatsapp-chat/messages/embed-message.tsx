import React, { useEffect, useRef } from 'react'
import { Message } from '@prisma/client'
import { MessageBubble } from './message-bubble'
import { cn } from '@/lib/utils'

export type BaseMessageProps = { message: Message }

export const EmbedMessage = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & BaseMessageProps
>(({ className, message, ...props }, ref) => {
  if (!(message.content as any)?.url) return

  const playerFrame = useRef<HTMLIFrameElement>(null)

  return (
    <MessageBubble
      type={message.from}
      className={cn(className, 'flex-1 flex-col')}
      ref={ref}
      {...props}
    >
      <iframe
        src={(message?.content as any)?.url}
        className='min-h-[200px] w-full flex-1 rounded-md sm:h-[262px]'
        ref={playerFrame}
        allowFullScreen
      />
    </MessageBubble>
  )
})
