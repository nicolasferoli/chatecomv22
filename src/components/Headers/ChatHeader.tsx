import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { VerifiedIcon } from 'lucide-react'
import { useModals } from '@/stores/useModals'
import { useChats } from '@/stores/useChats'
import Image from 'next/image'

interface ChatHeaderProps {
  userName: string
  userStatus: string
  isLoading: boolean
  hasMessages: boolean
  favIconUrl: string
  isVerified: boolean
  className: string
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName,
  userStatus,
  isLoading,
  hasMessages,
  favIconUrl,
  isVerified,
  className,
}) => {
  const { toggleSidebar } = useModals()
  const { createChat, chats, loading, error, getChats, updateChat } = useChats()
  const [imageData, setImageData] = useState('')
  const [chatData, setChatData] = useState<any>({
    id: '',
    name: '',
    description: '',
    favicon_url: '',
    Theme: '',
  })

  return (
    <header onClick={toggleSidebar} className={className}>
      <div className='mx-auto flex w-full max-w-[1100px] justify-between'>
        <div className='flex items-center justify-start gap-2'>
          <Avatar className='h-10 w-10 md:h-[39px] md:w-[39px]'>
            <AvatarImage src={favIconUrl} />
            <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <div className='flex items-center gap-1.5'>
              <span className="flex items-center font-['Inter'] text-sm font-semibold text-white md:text-base">
                {userName}
                {isVerified && (
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
              {isLoading === true
                ? 'digitando...'
                : userStatus === 'online'
                  ? 'online'
                  : ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ChatHeader
