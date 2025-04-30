'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle,
  Loader2,
  X,
  AlertCircle,
  RefreshCw,
  Trash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useChats } from '@/stores/useChats'
import { Badge } from './ui/badge'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

interface DNSCheckResult {
  valid: boolean
  message: string
  status: string
  dns: {
    type: string
    domain: string
    value: string
    status: string
  }[]
}

export default function DomainManager({ chatId }: { chatId: string }) {
  const [domain, setDomain] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showDNS, setShowDNS] = useState(false)
  const { chats, getChat } = useChats()
  const [dns, setDns] = useState<
    | {
        type: string
        domain: string
        value: string
        status: string
      }[]
    | null
  >([])

  useEffect(() => {
    const fetchChat = async () => {
      const chat = await getChat(chatId)
      if (chat) {
        setDomain(chat.domains?.[0]?.name || '')
        setStatus(chat.domains?.[0]?.status || null)
        setIsVerified(chat.domains?.[0]?.status === 'verified')
      }
    }

    fetchChat()
  }, [chatId])

  const addDomain = async () => {
    if (!domain.trim()) return

    setIsAdding(true)
    setShowDNS(true)

    try {
      const response = await fetch('/api/domain/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, chat_id: chatId }),
      })

      const result = await response.json()
      if (response.ok) {
        setStatus('checking')
        checkDNSConfig() // Inicia a verificação de DNS após a adição do domínio
        setDns([
          {
            type: 'A',
            domain: '@',
            value: '76.76.21.21',
            status: 'pending',
          },
        ])
      } else {
        setError(result.error || 'Falha ao adicionar domínio')
      }

      if (result && result.status === 'migrate' && result.dns) {
        setDns(result.dns)
      }
    } catch (error) {
      setError('Ocorreu um erro inesperado')
    } finally {
      setIsAdding(false)
    }
  }

  const checkDNSConfig = async () => {
    if (!domain) return

    setIsChecking(true)
    try {
      const response = await fetch(
        `/api/domain/check?domain=${domain}&chat_id=${chatId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const result: DNSCheckResult = await response.json()

      if (result.status === 'migrate') {
        setDns(result.dns)
        return
      }

      if (response.ok) {
        setStatus(result.valid ? 'active' : 'misconfigured')
        setError(result.valid ? null : result.message)
        setIsVerified(result.valid)

        setDns([
          {
            type: 'A',
            domain: '@',
            value: '76.76.21.21',
            status: result.valid ? 'active' : 'pending',
          },
        ])
      } else {
        setError(result.message || 'Falha ao verificar configuração DNS')
      }
    } catch (error) {
      setError('Ocorreu um erro inesperado')
    } finally {
      setIsChecking(false)
    }
  }

  const handleRemoveDomain = async () => {
    const response = await fetch(
      `/api/domain/remove?domain=${domain}&chat_id=${chatId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (response.ok) {
      setDomain('')
      setIsVerified(false)
      setShowDNS(false)
    }
  }

  return (
    <div>
      <h2 className='text-md mb-4 mt-2 font-medium'>
        Configure o seu link personalizado
      </h2>
      <div className='mb-4 flex space-x-2'>
        <Input
          placeholder='Digite seu domínio (ex: exemplo.com)'
          value={isVerified ? 'https://' + domain + '/chat/' + chatId : domain}
          onChange={(e) => {
            setDomain(e.target.value)
            setShowDNS(false)
            setIsVerified(false)
          }}
          disabled={isVerified}
        />
        {!isVerified ? (
          <Button
            onClick={addDomain}
            className='bg-[#0C88EE] hover:bg-[#0C88EE]/90'
            disabled={isAdding || isChecking || !domain.trim()}
          >
            {isAdding ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Adicionando
              </>
            ) : isChecking ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verificando
              </>
            ) : showDNS ? (
              'Verificar DNS'
            ) : (
              'Adicionar Domínio'
            )}
          </Button>
        ) : (
          <div className='flex space-x-2'>
            <Button
              variant='outline'
              className='bg-[#0C88EE] text-white hover:bg-[#0C88EE]/80 hover:text-white'
              onClick={() =>
                navigator.clipboard.writeText(
                  'https://' + domain + '/chat/' + chatId
                )
              }
            >
              Copiar link
            </Button>
            <Button
              variant='default'
              className='border-[1px] border-[#0C88EE]/30 bg-[#E7F4FF] text-[#0C88EE] hover:bg-[#E7F4FF]/90'
              onClick={handleRemoveDomain}
            >
              Excluir
            </Button>
          </div>
        )}
      </div>
      {/*error && (
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{error}</span>
          </div>
        )*/}

      {(showDNS || isVerified) && dns && dns.length > 0 && (
        <>
          <div className='text-md my-6 text-gray-500'>
            {' '}
            Adicione a DNS abaixo no seu domínio para ativar o link
            personalizado
          </div>
          <div className='mt-4 rounded-md border'>
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dns?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.domain}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>
                      {item.status === 'active' ? (
                        <Badge className='bg-green-100 text-green-500 hover:bg-green-100 hover:text-green-600'>
                          Verificado
                        </Badge>
                      ) : (
                        <Badge className='bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600'>
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isVerified &&
                        (isChecking ? (
                          <RefreshCw className='h-4 w-4 animate-spin' />
                        ) : (
                          <RefreshCw
                            className='h-4 w-4 cursor-pointer'
                            onClick={() => checkDNSConfig()}
                          />
                        ))}
                    </TableCell>
                    <TableCell>
                      <Trash className='h-4 w-4' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!isVerified ? (
            <Alert
              variant='default'
              className='mt-4 w-full border-[#FEC84B] bg-[#FFFAEB]'
            >
              <AlertDescription className='text-gray-700'>
                Caso já tenha adicionado a DNS, aguarde alguns minutos para a
                propagação do domínio e tente novamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert
              variant='default'
              className='mt-4 w-full border-green-500 bg-green-50'
            >
              <AlertDescription className='text-green-700'>
                O seu chat está ativo no link personalizado{' '}
                <a
                  className='font-medium'
                  href={`https://${domain}/chat/${chatId}`}
                  target='_blank'
                >
                  {domain}
                </a>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}
