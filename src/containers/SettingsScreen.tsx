'use client'

import DomainManager from '@/components/DomainManager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import React, { useState, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast, ToastContainer } from 'react-toastify'
import { useChats } from '@/stores/useChats'
import BuilderHeader from '@/components/Headers/BuilderHeader'
import ImageUpload from '@/components/Forms/FormImageUpload'
import FormTextArea from '@/components/Forms/FormTextArea'
import FormInput from '@/components/Forms/FormInput'
import FormTitleSection from '@/components/Forms/FormTitleSection'

const SettingsScreen = ({ chatId }: { chatId: string }) => {
  const { chats, updateChat, getChats } = useChats()
  const [activeMenu, setActiveMenu] = useState('Compartilhamento')
  const [copiedFree, setCopiedFree] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [updatedChat, setUpdatedChat] = useState<any>({})

  useEffect(() => {
    const currentChat = chats.find((chat) => chat.id === chatId)
    if (currentChat) {
      setUpdatedChat({
        facebook_id: currentChat?.facebook_id || undefined,
        google_tag: currentChat?.google_tag || undefined,
        tiktok_ads: currentChat?.tiktok_ads || undefined,
        seo_title: currentChat?.seo_title || '',
        seo_description: currentChat?.seo_description || '',
        favicon_url: currentChat?.favicon_url || '',
        share_image: currentChat?.share_image || '',
      })
    }
  }, [chats, chatId])

  useEffect(() => {
    getChats()
  }, [])

  const menuItems = [
    { label: 'Compartilhamento', key: 'Compartilhamento' },
    { label: 'SEO & Favicon', key: 'SEO & Favicon' },
    { label: 'Tracking', key: 'Tracking' },
  ]

  useEffect(() => {
    if (chatId) {
      const domain = process.env.NEXT_PUBLIC_SHARE_DOMAIN
      const url = `https://${domain}/chat/${chatId}`
      setShareUrl(url)
      setEmbedCode(
        `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`
      )
    }
  }, [chatId])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'chat') {
        const updatedChatFromStorage = JSON.parse(event.newValue || '{}')
        setUpdatedChat((prevChat: any) => ({
          ...prevChat,
          ...updatedChatFromStorage,
        }))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleCopyFree = () => {
    try {
      navigator.clipboard.writeText(shareUrl)
      setCopiedFree(true)
      toast.success('Link copiado para a área de transferência!')
      setTimeout(() => setCopiedFree(false), 2000)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCopyEmbed = () => {
    try {
      navigator.clipboard.writeText(embedCode)
      setCopiedEmbed(true)
      toast.success('Código embed copiado para a área de transferência!')
      setTimeout(() => setCopiedEmbed(false), 3000)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setUpdatedChat((prevChat: any) => ({
      ...prevChat,
      [id]: value,
    }))
  }

  const handleSaveChanges = async () => {
    try {
      await updateChat(chatId, updatedChat)
      toast.success('Alterações salvas!')
    } catch (error) {
      toast.error('Erro ao salvar alterações.')
    }
  }

  return (
    <>
      <BuilderHeader chatId={chatId} activeSection='settings' />
      <div className='mx-auto flex h-[800px] max-w-7xl flex-col items-center justify-between md:mt-[3vh] md:flex-row'>
        <div className='flex w-full flex-col items-start p-6 md:h-full md:w-1/3'>
          <h1 className='text-3xl font-bold'>Configurações</h1>
          <span className='text-md mt-2 text-gray-500'>
            Faça ajustes e personalizações
          </span>
          <nav className='mt-8 flex w-full flex-col space-y-2 text-black'>
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`rounded-lg px-4 py-2 text-left transition-colors ${
                  activeMenu === item.key
                    ? 'bg-[#F1F5F9] text-black'
                    : 'hover:bg-[#F1F5F9]/50 hover:text-black/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className='flex h-full w-full flex-col items-start p-6 md:mt-[180px] md:pl-10'>
          <div className='w-full'>
            <FormTitleSection
              title={activeMenu}
              subtitle={`Configurações gerais de ${activeMenu.toLowerCase()}`}
            />
            <div className='flex flex-col items-start'>
              {activeMenu === 'Compartilhamento' && (
                <div className='w-full space-y-6'>
                  <div className='flex flex-col gap-4'>
                    <Tabs defaultValue='gratuito' className='w-full'>
                      <TabsList className='flex justify-center rounded-full py-6'>
                        <TabsTrigger
                          className='flex w-full items-center rounded-full py-2 !text-sm data-[state=active]:!bg-[#0C88EE] data-[state=active]:!text-white md:px-10'
                          value='gratuito'
                        >
                          Gratuito
                        </TabsTrigger>
                        <TabsTrigger
                          className='flex w-full items-center rounded-full py-2 !text-sm data-[state=active]:!bg-[#0C88EE] data-[state=active]:!text-white md:px-10'
                          value='personalizado'
                        >
                          Personalizado
                        </TabsTrigger>
                        <TabsTrigger
                          className='flex w-full items-center rounded-full py-2 !text-sm data-[state=active]:!bg-[#0C88EE] data-[state=active]:!text-white md:px-10'
                          value='embed'
                        >
                          Embed
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value='gratuito'>
                        <div className='mt-4 flex flex-col gap-2'>
                          <span className='text-md my-2'>
                            Compartilhamento gratuito
                          </span>
                          <div className='flex w-full flex-row items-center gap-2'>
                            <Input
                              type='text'
                              value={shareUrl}
                              readOnly
                              className='bg-gray-50 text-sm md:text-base'
                            />
                            <Button
                              variant='default'
                              className='bg-[#0C88EE] transition-all duration-200 hover:bg-[#0C88EE]/90'
                              onClick={handleCopyFree}
                            >
                              {copiedFree ? (
                                <>
                                  <Check className='mr-2 h-4 w-4' />
                                  Copiado!
                                </>
                              ) : (
                                <>Copiar link</>
                              )}
                            </Button>
                          </div>
                          <Alert
                            variant='default'
                            className='w-full border-[#FEC84B] bg-[#FFFAEB]'
                          >
                            <AlertDescription className='text-gray-700'>
                              Clique aqui e entenda como funciona os links de
                              compartilhamento gratuito.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </TabsContent>

                      <TabsContent value='personalizado'>
                        <div className='mt-4 flex flex-col gap-2'>
                          <DomainManager chatId={chatId} />
                        </div>
                      </TabsContent>

                      <TabsContent value='embed'>
                        <div className='mt-4 flex flex-col gap-2'>
                          <span className='text-md mt-2 font-medium'>
                            Embed link
                          </span>
                          <div className='mt-2 flex flex-col items-center gap-4 rounded-lg bg-[#F1F5F9] p-6 md:flex-row'>
                            <div className='block w-full flex-1 rounded-md sm:text-sm'>
                              {embedCode}
                            </div>
                            <Button
                              className='ml-2 bg-white text-black transition-all duration-200 hover:bg-white/90'
                              onClick={handleCopyEmbed}
                            >
                              {copiedEmbed ? (
                                <>
                                  <Check className='mr-2 h-4 w-4' />
                                  Copiado!
                                </>
                              ) : (
                                <>Copiar Embed</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
              {activeMenu === 'SEO & Favicon' && (
                <div className='w-full space-y-6'>
                  <div>
                    <FormInput
                      id='seo_title'
                      label='Título para motores de busca'
                      placeholder='Título para SEO'
                      value={updatedChat?.seo_title || ''}
                      onChange={handleChange}
                      className='mt-2'
                    />
                  </div>
                  <div>
                    <FormTextArea
                      id='seo_description'
                      label='Descrição para SEO'
                      placeholder='Descrição para SEO'
                      value={updatedChat?.seo_description || ''}
                      onChange={handleChange}
                      className='mt-2'
                    />
                  </div>

                  <div>
                    <ImageUpload
                      label='Favicon'
                      imageUrl={updatedChat?.favicon_url || ''}
                      onUpload={(url) =>
                        setUpdatedChat((prevChat: any) => ({
                          ...prevChat,
                          favicon_url: url,
                        }))
                      }
                      chatId={chatId}
                      type='favicon'
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label='Share Image'
                      imageUrl={updatedChat?.share_image || ''}
                      onUpload={(url) =>
                        setUpdatedChat((prevChat: any) => ({
                          ...prevChat,
                          share_image: url,
                        }))
                      }
                      chatId={chatId}
                      type='share-image'
                    />
                  </div>
                  <Button
                    className='w-fit bg-[#0C88EE] px-5 text-white hover:bg-[#0C88EE]/90'
                    onClick={handleSaveChanges}
                  >
                    Salvar alterações
                  </Button>
                </div>
              )}
              {activeMenu === 'Tracking' && (
                <div className='w-full space-y-6'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='facebook_id'>Facebook Pixel</Label>
                      <Switch
                        id='facebook_switch'
                        checked={updatedChat?.facebook_id !== undefined}
                        onCheckedChange={(checked) => {
                          setUpdatedChat((prevChat: any) => ({
                            ...prevChat,
                            facebook_id: checked
                              ? prevChat.facebook_id || ''
                              : undefined,
                          }))
                        }}
                      />
                    </div>
                    {updatedChat?.facebook_id != null && (
                      <Input
                        id='facebook_id'
                        placeholder='Digite seu Facebook Pixel ID'
                        value={updatedChat?.facebook_id || ''}
                        onChange={handleChange}
                      />
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='google_tag'>Google Tag Manager</Label>
                      <Switch
                        id='gtm_switch'
                        checked={updatedChat?.google_tag !== undefined}
                        onCheckedChange={(checked) => {
                          setUpdatedChat((prevChat: any) => ({
                            ...prevChat,
                            google_tag: checked
                              ? prevChat.google_tag || ''
                              : undefined,
                          }))
                        }}
                      />
                    </div>
                    {updatedChat?.google_tag != null && (
                      <Input
                        id='google_tag'
                        placeholder='Digite seu GTM ID (GTM-XXXXXX)'
                        value={updatedChat?.google_tag || ''}
                        onChange={handleChange}
                      />
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='tiktok_ads'>TikTok Pixel</Label>
                      <Switch
                        id='tiktok_switch'
                        checked={updatedChat?.tiktok_ads !== undefined}
                        onCheckedChange={(checked) => {
                          setUpdatedChat((prevChat: any) => ({
                            ...prevChat,
                            tiktok_ads: checked
                              ? prevChat.tiktok_ads || ''
                              : undefined,
                          }))
                        }}
                      />
                    </div>
                    {updatedChat?.tiktok_ads != null && (
                      <Input
                        id='tiktok_ads'
                        placeholder='Digite seu TikTok Pixel ID'
                        value={updatedChat?.tiktok_ads || ''}
                        onChange={handleChange}
                      />
                    )}
                  </div>

                  <Button
                    className='w-fit bg-[#0C88EE] px-5 text-white hover:bg-[#0C88EE]/90'
                    onClick={handleSaveChanges}
                  >
                    Salvar alterações
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsScreen
