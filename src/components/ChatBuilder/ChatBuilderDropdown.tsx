'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Type,
  MessageSquare,
  Mic,
  ImageIcon,
  Plus,
  MoreHorizontal,
  ExternalLink,
  VideoIcon,
} from 'lucide-react'
import { useMessages } from '@/stores/useMessages'
import { QuestionMessage } from './Message/QuestionMessage'

export default function ChatBuilderDropdown({
  chatId,
  handleCreateMessage,
}: {
  chatId: string
  handleCreateMessage: (type: string) => void
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const toggleComponent = () => setIsDropdownOpen((prev) => !prev)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'm':
            event.preventDefault()
            handleCreateMessage('text')
            break // Adicionando break aqui
          case 'p':
            event.preventDefault()
            handleCreateMessage('question')
            break // Adicionando break aqui
          case 'a':
            event.preventDefault()
            handleCreateMessage('audio')
            break // Adicionando break aqui
          case 'i':
            event.preventDefault()
            handleCreateMessage('image')
            break // Adicionando break aqui
          case 'v':
            event.preventDefault()
            handleCreateMessage('embed')
            break // Adicionando break aqui
          case 'b':
            event.preventDefault()
            handleCreateMessage('buttons')
            break // Adicionando break aqui
          case 'r':
            event.preventDefault()
            handleCreateMessage('redirect')
            break // Adicionando break aqui
          case 's':
            event.preventDefault()
            handleCreateMessage('section')
            break // Adicionando break aqui
          default:
            break
        }
      }
      if (event.key === '/') {
        event.preventDefault()
        toggleComponent()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleCreateMessage])

  return (
    <div className='z-50'>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <div
            onClick={toggleComponent}
            className='transition-opacityms duration-[3000] mx-6 mb-10 w-fit animate-borderColorCycle cursor-pointer border-2 !bg-[#F1F9FF] p-2 px-4 text-[15px] text-gray-500 hover:opacity-80'
            style={{
              borderRadius: '0px 30px 30px 20px',
            }}
          >
            <b className='text-[#0C88EE]'>Clique aqui</b> ou digite ”/” para
            adicionar um novo bloco
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='h-fit w-[280px] rounded-lg border border-slate-200 bg-white p-1'
        >
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('text')
            }}
            className='flex cursor-pointer items-center justify-start gap-2 rounded-md pr-2 hover:bg-[#ecf5fe]'
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#0c88ee]/10 p-1.5'>
              <Type className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Mensagem
            </span>
            <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('question')
            }}
            className='flex cursor-pointer items-center justify-start gap-2 rounded-md pr-2 hover:bg-[#ecf5fe]'
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#ecf5fe] p-1.5'>
              <MessageSquare className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Pergunta
            </span>
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('audio')
            }}
            className='flex cursor-pointer items-center justify-start gap-2 rounded-md pr-2 hover:bg-[#ecf5fe]'
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#ecf5fe] p-1.5'>
              <Mic className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Áudio
            </span>
            <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('image')
            }}
            className='flex cursor-pointer items-center justify-start gap-2 rounded-md pr-2 hover:bg-[#ecf5fe]'
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#ecf5fe] p-1.5'>
              <ImageIcon className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Imagem
            </span>
            <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('embed')
            }}
            className='flex cursor-pointer items-center justify-start gap-2 rounded-md pr-2 hover:bg-[#ecf5fe]'
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#ecf5fe] p-1.5'>
              <VideoIcon className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Embed vídeo
            </span>
            <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('buttons')
            }}
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#ecf5fe] p-1.5'>
              <MoreHorizontal className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Lista de botões
            </span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('redirect')
            }}
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#ecf5fe] p-1.5'>
              <ExternalLink className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Redirecionamento
            </span>
            <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsDropdownOpen(false)
              handleCreateMessage('section')
            }}
          >
            <div className='flex h-8 w-8 items-center justify-center gap-2.5 rounded-[50px] bg-[#ecf5fe] p-1.5'>
              <Plus className='h-4 w-4 text-[#0c88ee]' />
            </div>
            <span className="font-['Inter'] text-sm font-semibold leading-tight text-slate-700">
              Seção
            </span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
