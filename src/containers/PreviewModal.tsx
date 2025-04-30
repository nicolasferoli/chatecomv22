'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Laptop, Laptop2, Smartphone } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

interface PreviewButtonProps {
  children: React.ReactNode
  chatId: string
}

export default function PreviewButton({
  children,
  chatId,
}: PreviewButtonProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile')

  const handleOpenPreview = () => {
    router.push(`/builder/${chatId}?isPreview=true`)
    setIsOpen(true)
  }

  useEffect(() => {
    const isPreview = searchParams.get('isPreview')

    if (isPreview === 'true') {
      setIsOpen(true)
    }
  }, [searchParams])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          router.push(`/builder/${chatId}`)
        }
        setIsOpen(open)
      }}
    >
      {/* <DialogTrigger asChild>{children}</DialogTrigger> */}
      <div onClick={handleOpenPreview}>{children}</div>
      <DialogContent
        style={{
          maxWidth: '1300px',
          width: '100%',
          height: '100%',
          maxHeight: '950px',
        }}
        className='p-0'
      >
        <DialogHeader className='flex h-[70px] flex-row items-center px-6 pt-3'>
          <DialogTitle className='text-sm md:text-xl'>Preview</DialogTitle>
          <Tabs
            value={viewMode}
            onValueChange={(value) =>
              setViewMode(value as 'desktop' | 'mobile')
            }
            className='mx-auto w-fit'
          >
            <TabsList className='flex justify-center rounded-full py-6'>
              <TabsTrigger
                className={`flex items-center gap-2 rounded-full px-5 py-2 !text-xs md:px-10 md:text-sm ${viewMode === 'desktop' ? '!bg-[#0C88EE] !text-white' : 'bg-transparent'}`}
                value='desktop'
              >
                <Laptop2 size={1} className='h-5 w-5' />
                Desktop
              </TabsTrigger>
              <TabsTrigger
                className={`flex items-center gap-2 rounded-full px-5 py-2 !text-xs md:px-10 md:text-sm ${viewMode === 'mobile' ? '!bg-[#0C88EE] !text-white' : 'bg-transparent'}`}
                value='mobile'
              >
                <Smartphone size={1} className='h-5 w-5' />
                Mobile
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {viewMode === 'desktop' ? (
          <div className='flex h-screen items-center justify-center bg-blue-50 p-6'>
            <iframe
              src={`/chat/${chatId}?isPreview=true`}
              className='h-[85%] max-h-[820px] w-full max-w-[1100px] self-start rounded-xl'
            ></iframe>
          </div>
        ) : (
          <div className='flex h-screen items-center justify-center bg-blue-50 p-6'>
            <iframe
              src={`/chat/${chatId}?isPreview=true`}
              className='h-[90%] max-h-[600px] w-full max-w-[450px] self-start overflow-auto rounded-xl'
            ></iframe>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
