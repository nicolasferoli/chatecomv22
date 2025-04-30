import React from 'react'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useChatContext } from './chat-context'

export function ChatHeader() {
  const { isTyping, chatInfo, currentMessage } = useChatContext()
  const action = currentMessage?.type === 'audio' ? 'gravando' : 'digitando'

  return (
    <header
      className={
        'fixed top-0 z-50 flex h-16 w-full cursor-pointer items-center justify-center overflow-y-auto bg-[#075f58] px-4 py-2 md:h-[79px] md:px-6'
      }
    >
      <div className='mx-auto flex w-full max-w-[1100px] justify-between'>
        <div className='flex items-center justify-start gap-2'>
          <Avatar className='h-10 w-10 md:h-[39px] md:w-[39px]'>
            <AvatarImage src={chatInfo.favicon_url || undefined} />
            <AvatarFallback>{chatInfo.bot_name ? chatInfo.bot_name[0] : '?'}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <div className='flex items-center gap-1.5'>
              <span className="flex items-center font-['Inter'] text-sm font-semibold text-white md:text-base">
                {chatInfo.bot_name}
                {chatInfo.verified && (
                  <Image
                    className='ml-1.5 h-4 w-4'
                    src={'/icons/verified.svg'}
                    alt='Verified Icon'
                    width={18}
                    height={18}
                  />
                )}
              </span>
            </div>
            <span className="font-['Inter'] text-xs font-light text-white opacity-80">
              {isTyping ? `${action}...` : chatInfo.status}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
