'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useChats } from '@/stores/useChats'

export default function ShareModal({
  chatId,
  children,
}: {
  chatId: string
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [copying, setCopying] = useState<string | null>(null)
  const [customShareUrl, setCustomShareUrl] = useState<string | null>(null)
  const { getChat } = useChats()

  const domain = typeof window !== 'undefined' ? window.location.origin : ''
  const freeShareUrl = `${domain}/chat/${chatId}`
  const embedCode = `<iframe src="${domain}/chat/${chatId}" width="100%" height="600" frameborder="0"></iframe>`

  const handleCopy = async (text: string, type: string) => {
    try {
      setCopying(type)
      await navigator.clipboard.writeText(text)
      toast.success('Copiado com sucesso!')
    } catch (err) {
      toast.error('Erro ao copiar')
    } finally {
      setTimeout(() => {
        setCopying(null)
      }, 1000)
    }
  }

  useEffect(() => {
    const fetchChat = async () => {
      const chat = await getChat(chatId)
      if (chat) {
        setCustomShareUrl(
          'https://' + chat?.domains?.[0]?.name + '/chat/' + chatId
        )
      }
    }
    if (chatId) {
      fetchChat()
    }
  }, [chatId])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='flex h-fit max-w-[700px] flex-col p-8'>
        <div className='h-[60px] pt-2'>
          <DialogTitle className='text-[20px] font-semibold text-gray-900'>
            Compartilhar
          </DialogTitle>
        </div>
        <div className='space-y-6'>
          <div>
            <label className='text-md block font-medium text-gray-700'>
              URL de compartilhamento gratuita
            </label>
            <div className='mt-2 flex'>
              <Input
                type='text'
                readOnly
                value={freeShareUrl}
                className='block w-full flex-1 rounded-md border-gray-300 text-gray-800 shadow-sm sm:text-sm'
              />
              <Button
                className={`ml-2 bg-[#0C88EE] text-white transition-colors hover:bg-[#0C88EE]/90`}
                onClick={() => handleCopy(freeShareUrl, 'free')}
              >
                {copying === 'free' ? 'Copiado!' : 'Copiar link'}
              </Button>
            </div>
          </div>
          {customShareUrl && (
            <div>
              <label className='text-md block font-medium text-gray-700'>
                URL de compartilhamento personalizada
              </label>
              <div className='mt-2 flex'>
                <Input
                  type='text'
                  readOnly
                  value={customShareUrl}
                  className='block w-full flex-1 rounded-md text-gray-800 shadow-sm sm:text-sm'
                />
                <Button
                  className={`ml-2 bg-[#0C88EE] text-white transition-colors hover:bg-[#0C88EE]/90`}
                  onClick={() => handleCopy(customShareUrl, 'custom')}
                >
                  {copying === 'custom' ? 'Copiado!' : 'Copiar link'}
                </Button>
              </div>
            </div>
          )}
          <div>
            <label className='text-md block font-medium text-gray-700'>
              Embed
            </label>
            <div className='mt-2 flex rounded-lg bg-[#F1F5F9] p-6'>
              <div className='block w-full flex-1 rounded-md sm:text-sm'>
                {embedCode}
              </div>
              <Button
                className={`ml-2 bg-white text-black transition-colors hover:bg-white/90`}
                onClick={() => handleCopy(embedCode, 'embed')}
              >
                {copying === 'embed' ? 'Copiado!' : 'Copiar Embed'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
