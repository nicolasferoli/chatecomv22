'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Circle, icons, Loader2, MoreVertical, Plus, X, Bot } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useModals } from '@/stores/useModals'
import { Chat, CreateChatRequest } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@radix-ui/react-dropdown-menu'
import { IoLogoInstagram, IoLogoWhatsapp } from 'react-icons/io5'
import { title } from 'process'
import { AvatarImage } from '@/components/ui/avatar'
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar'
import { useChats } from '@/stores/useChats'
import { toast, ToastContainer } from 'react-toastify'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DialogFooter } from '@/components/ui/dialog'

const socialTemplates = [
  {
    title: 'WhatsApp',
    icon: IoLogoWhatsapp,
  },
  { title: 'Instagram', icon: IoLogoInstagram },
]

const statusTemplate = [
  {
    status: 'Online',
  },
  {
    status: 'Offline',
  },
]

const ChatSidebar = ({
  isOpen,
  onOpenChange,
  chatData,
  setChatData,
  handleAddChat,
  handleUpdateChat,
  isEditing,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  chatData: Chat
  setChatData: (chat: Chat) => void
  handleAddChat: () => void
  handleUpdateChat: () => void
  isEditing: boolean
}) => {
  const {
    createChat,
    chats,
    loading,
    error,
    getChats,
    updateChat,
    deleteChat,
  } = useChats()
  const [updatedChat, setUpdatedChat] = useState<any>({
    id: '',
    name: '',
    template: '',
    status: '',
  })

  useEffect(() => {
    const currentChat = chats.find((chat) => chat.id === chatData.id)
    if (currentChat) {
      setUpdatedChat({
        id: currentChat.id,
        status: currentChat.status,
        name: currentChat.name || '',
        template: currentChat.template,
      })
    }
  }, [chats, chatData.id])

  useEffect(() => {
    getChats()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setUpdatedChat((prevState) => ({
      ...prevState,
      [field]: e.target.value,
    }))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdatedChat((prevState) => ({
      ...prevState,
      status: e.target.value as string,
    }))
  }

  useEffect(() => {
    setChatData(updatedChat)
  }, [updatedChat, setChatData])

  return (
    <>
      <div
        className={`fixed inset-0 z-50 ml-auto flex h-full justify-end bg-opacity-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0 transform' : 'translate-x-[200%] transform'
        }`}
      >
        <div className='relative flex h-full w-[500px] flex-col border-[1px] bg-[#F9FAFB] p-6 pt-20'>
          <button
            className='absolute left-2 top-2 mb-6 self-start rounded-full border-[1px] bg-white p-2'
            onClick={() => onOpenChange(false)}
          >
            <X className='h-4 w-4 text-gray-500' />
          </button>
          <div className='flex-grow space-y-6'>
            <div>
              <label
                htmlFor='title'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Nome do Chat
              </label>
              <Input
                id='name'
                value={updatedChat.name}
                onChange={(e) => handleChange(e, 'name')}
                className='w-full bg-white'
              />
            </div>
            <Button
              className='mt-6 bg-[#0C88EE] px-8 text-white hover:bg-[#0C88EE]/80'
              onClick={isEditing ? handleUpdateChat : handleAddChat}
            >
              {isEditing ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          onClick={() => onOpenChange(false)}
          className={`fixed top-0 flex h-full w-full justify-end bg-black/10`}
        ></div>
      )}
    </>
  )
}

const ChatList = ({
  chats,
  filteredChats,
  openEditDialog,
  handleDeleteChat,
  handleSwitchStatusChat,
}: {
  chats: Chat[] | undefined
  filteredChats: Chat[]
  openEditDialog: (chat: Chat) => void
  handleDeleteChat: (chat: Chat) => void
  handleSwitchStatusChat: (id: string, checked: boolean) => void
}) => {
  const router = useRouter()

  const [chatResults, setChatResults] = useState<any>({})

  const getStats = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chatlogs?chatId=${chatId}`)
      const data = await response.json()

      setChatResults((prevResults) => ({
        ...prevResults,
        [chatId]: data, // Armazena o resultado do chat por ID.
      }))
    } catch (error) {
      console.error(`Erro ao buscar dados para o chat ${chatId}:`, error)
    }
  }

  useEffect(() => {
    if (filteredChats?.length) {
      // Busca os dados de cada chat individualmente
      filteredChats.forEach((chat) => {
        getStats(chat.id)
      })
    }
  }, [filteredChats])

  return (
    <div>
      {filteredChats?.length > 0 ? (
        <>
          <h2 className='mb-4 text-[16px] font-semibold'>
            Chats{' '}
            <span className='text-sm text-zinc-500'>{`(${chats?.length})`}</span>
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50 text-slate-600 hover:bg-slate-50'>
                  <TableHead>Nome</TableHead>
                  <TableHead>Acessos</TableHead>
                  <TableHead>Completos</TableHead>
                  <TableHead>Template Utilizado</TableHead>
                  <TableHead className='w-[50px]'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(filteredChats) &&
                  filteredChats.map((chat, i) => (
                    <TableRow
                      key={i}
                      className='cursor-pointer hover:bg-slate-50'
                    >
                      <TableCell
                        onClick={() => router.push('/builder/' + chat.id)}
                        className='text-[14px] font-medium'
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar className='flex h-5 w-5 items-center justify-center md:h-[39px] md:w-[39px]'>
                            <AvatarImage
                              className='h-[20px] w-[20px] rounded-full md:h-[32px] md:w-[32px]'
                              src={chat.favicon_url}
                            />
                            <AvatarFallback className='flex h-[20px] w-[20px] items-center justify-center rounded-full bg-zinc-200 md:h-[32px] md:w-[32px]'>
                              {chat?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className='text-[14px] font-medium text-[#667085]'>
                            {chat?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() => router.push('/builder/' + chat.id)}
                        className='text-[14px] text-[#667085]'
                      >
                        {chatResults[chat.id]?.total_views || '0'}
                      </TableCell>
                      <TableCell
                        onClick={() => router.push('/builder/' + chat.id)}
                        className='text-[14px] text-[#667085]'
                      >
                        {chatResults[chat.id]?.total_conversations || '0'}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='flex items-center rounded-full bg-[#EBF6FF] p-2'>
                            {chat.theme === 'whatsapp' ||
                            chat.theme === 'whatsapp-dark' ? (
                              <Image
                                src={'/icons/whatsapp-icon.svg'}
                                alt='Template'
                                width={20}
                                height={20}
                              />
                            ) : (
                              <Image
                                src={'/icons/instagram-icon.svg'}
                                alt='Template'
                                width={20}
                                height={20}
                              />
                            )}
                          </div>
                          <span className='text-[14px] font-medium text-[#667085]'>
                            {chat.theme === 'whatsapp' ||
                            chat.theme === 'whatsapp-dark'
                              ? 'WhatsApp'
                              : 'Instagram'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(chat)}
                            >
                              Renomear
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteChat(chat)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </>
      ) : (
        <div className='flex min-h-[400px] flex-1 flex-col items-center justify-center gap-6'>
          <Image src='/icons/info.svg' alt='Info' width={40} height={40} />
          <div className='flex flex-col items-center gap-2'>
            <span className='text-[18px] font-medium'>
              Não há chats disponíveis
            </span>
            <p className='text-14px text-[#64748B]'>Crie um novo chat.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChatsScreen() {
  const { chats, getChats, updateChat, createChat } = useChats()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditingChat, setIsEditingChat] = useState(false)
  const router = useRouter()
  const { deleteChat } = useChats()

  const [newChat, setNewChat] = useState<Chat>({
    id: '',
    name: '',
    description: '',
    status: 'online',
    template: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    bot_name: '',
    bot_picture: '',
    verified: true,
    // hasNotifySound: false,
  })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Número de itens por página
  const totalPages = Math.ceil((chats?.length || 0) / itemsPerPage)

  const paginatedChats = chats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await getChats()
      setLoading(false)
    }
    fetchData()
  }, [getChats])

  const handleUpdateChat = async () => {
    setIsDialogOpen(false)
    await updateChat(newChat.id, newChat)
    setNewChat({
      id: '',
      name: '',
      description: '',
      status: 'online',
      template: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      bot_name: '',
      bot_picture: '',
      verified: true,
      // hasNotifySound: false,
    })
    toast.success('Chat atualizado com sucesso!')
    setIsEditingChat(false)
  }

  const handleDeleteChat = async (chat: Chat) => {
    try {
      await deleteChat(chat.id)
      toast.success('Chat excluído com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir chat.')
    }
  }

  const openEditDialog = (chat: Chat) => {
    setIsEditingChat(true)
    setNewChat(chat)
  }

  const filteredChats = chats

  return (
    <div className='relative min-h-[calc(100vh-65px)] bg-slate-50'>
      <main className='mx-auto max-w-[1450px] p-6'>
        <div className='mb-8 flex flex-col justify-between gap-2 md:flex-row md:items-center'>
          <div>
            <h1 className='text-[30px] font-semibold text-gray-900'>
              Meus Chatbots
            </h1>
            <p className='text-base text-muted-foreground'>
              Gerencie e acompanhe o desempenho dos seus chatbots.
            </p>
          </div>
          <div className='flex gap-3'>
            <NewChatButton />
          </div>
        </div>

        {loading ? (
          <div className='mt-12 animate-pulse space-y-4'>
            <div className='flex flex-row gap-4'>
              <div className='h-24 w-full rounded bg-gray-200'></div>
            </div>
            <div className='h-10 w-full rounded bg-gray-200'></div>
            <div className='h-28 w-full rounded bg-gray-200'></div>
            <div className='h-28 w-full rounded bg-gray-200'></div>
            <div className='h-28 w-full rounded bg-gray-200'></div>
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            <ChatList
              chats={chats}
              filteredChats={paginatedChats || []}
              openEditDialog={openEditDialog}
              handleDeleteChat={handleDeleteChat}
              handleSwitchStatusChat={(id, checked) => {
                console.log('')
              }}
            />
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  {currentPage === 1 ? (
                    <span className='cursor-not-allowed opacity-50'>
                      Anterior
                    </span>
                  ) : (
                    <PaginationPrevious
                      href='#'
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  )}
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href='#'
                      onClick={() => handlePageChange(i + 1)}
                      className={currentPage === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  {currentPage === totalPages ? (
                    <span className='cursor-not-allowed opacity-50'>
                      Próximo
                    </span>
                  ) : (
                    <PaginationNext
                      href='#'
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      <ChatSidebar
        isOpen={isEditingChat}
        onOpenChange={setIsEditingChat}
        chatData={newChat}
        setChatData={setNewChat}
        handleAddChat={() =>
          createChat({ name: newChat.name, description: newChat.description })
        }
        handleUpdateChat={handleUpdateChat}
        isEditing={isEditingChat}
      />
    </div>
  )
}

export function NewChatButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'ai' | 'scratch' | null>(
    null
  )
  const router = useRouter()

  const handleContinue = () => {
    if (selectedOption === 'ai') {
      router.push('/new?useAi=true')
    } else if (selectedOption === 'scratch') {
      router.push('/new')
    }
    // Reset state and close dialog after navigation (optional)
    setSelectedOption(null)
    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setSelectedOption(null)
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='bg-[#0C88EE] text-[14px] text-white hover:bg-[#0C88EE]/80 hover:text-white'
          // No need for onClick here, DialogTrigger handles it
        >
          <Plus className='mr-2 h-4 w-4' />
          Novo Chatbot
        </Button>
      </DialogTrigger>
      <DialogContent className='rounded-lg bg-white p-6 sm:max-w-md md:max-w-lg'>
        <DialogHeader className="mb-4">
          <DialogTitle className='text-center text-xl font-semibold text-gray-800'>
            Como deseja começar sua campanha?
          </DialogTitle>
          {/* Optional: Add a description below the title */}
          {/* <DialogDescription className="text-center text-gray-500"> */}
          {/*   Escolha como configurar seu novo chatbot. */}
          {/* </DialogDescription> */}
        </DialogHeader>

        <div className='space-y-4'>
          {/* Option 1: AI */}
          <Card
            onClick={() => setSelectedOption('ai')}
            className={cn(
              'cursor-pointer border-2 p-4 transition-all hover:border-blue-300',
              selectedOption === 'ai'
                ? 'border-blue-500 bg-blue-50/50' // Highlighted style
                : 'border-gray-200' // Default style
            )}
          >
            <CardContent className='flex items-center gap-4 p-0'>
              <Bot className='h-8 w-8 text-blue-600' />
              <div className='flex-grow'>
                <Label className='cursor-pointer text-base font-medium text-gray-800'>
                  Usar Inteligência Artificial
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Aproveite nossa IA para criar um chatbot personalizado
                  rapidamente.
                </p>
              </div>
               {/* Optional: Add a checkmark or keep simple highlight */}
              {/* {selectedOption === 'ai' && <Check className="h-5 w-5 text-blue-600" />} */}
            </CardContent>
          </Card>

          {/* Option 2: Scratch */}
          <Card
            onClick={() => setSelectedOption('scratch')}
            className={cn(
              'cursor-pointer border-2 p-4 transition-all hover:border-blue-300',
              selectedOption === 'scratch'
                ? 'border-blue-500 bg-blue-50/50' // Highlighted style
                : 'border-gray-200' // Default style
            )}
          >
            <CardContent className='flex items-center gap-4 p-0'>
               <span className='text-3xl' role="img" aria-label="Document">📄</span>
              <div className='flex-grow'>
                <Label className='cursor-pointer text-base font-medium text-gray-800'>
                  Criar do Zero
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Crie um chatbot manualmente, com total controle sobre cada
                  detalhe.
                </p>
              </div>
               {/* {selectedOption === 'scratch' && <Check className="h-5 w-5 text-blue-600" />} */}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!selectedOption} // Disable if no option selected
            className="bg-[#0C88EE] text-white hover:bg-[#0C88EE]/90"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
      {/* Keep ToastContainer if needed elsewhere, or manage globally */}
      {/* <ToastContainer /> */}
    </Dialog>
  )
}
