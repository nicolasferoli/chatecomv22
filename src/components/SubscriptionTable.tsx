'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Skeleton } from './ui/skeleton'
import jwt from 'jsonwebtoken'
import Image from 'next/image'
import Link from 'next/link'

// Tipos simplificados ou comentados já que a lógica Stripe foi removida
type Payment = {
  id: string
  amount: number
  created: number
  status: string
}
type Subscription = any // Pode ser removido ou ajustado

const SubscriptionTable = () => {
  const { user, accessTokenRaw } = useKindeAuth()
  const pathname = usePathname()
  const [isLoadingPortalUrl, setIsLoadingPortalUrl] = useState(false)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any>(null)
  const [payments, setPayments] = useState<any>(null)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)
  const decodedToken: any = jwt.decode(accessTokenRaw || '')
  const allow_access = decodedToken?.user_properties?.allow_access?.v === 'true'

  const getSubscription = async (kinde_id: string, pathname: string) => {
    setIsLoadingSubscription(true)
    const response = await fetch(`/api/subscription?kinde_id=${kinde_id}`)
    const data = await response.json()

    setSubscriptions(data.subscription)
    setPayments(data.payments)
    setIsLoadingSubscription(false)
  }

  const getPortalUrl = async (kinde_id: string, pathname: string) => {
    if (portalUrl) return window.open(portalUrl, '_blank')
    setIsLoadingPortalUrl(true)
    const response = await fetch(
      `/api/subscription?kinde_id=${kinde_id}&type=portalUrl`
    )
    const data = await response.json()

    setPortalUrl(data.portalUrl)
    setIsLoadingPortalUrl(false)
  }

  useEffect(() => {
    // Remover fetch para buscar dados da assinatura
    // const fetchData = async (kinde_id: string) => {
    //   try {
    //     const response = await fetch(`/api/subscription?kinde_id=${kinde_id}`)
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch subscription data')
    //     }
    //     const data = await response.json()
    //     setSubscription(data.subscription)
    //     setPayments(data.payments)
    //     setError(null)
    //   } catch (err) {
    //     setError(err instanceof Error ? err.message : 'An error occurred')
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    // if (user) {
    //   fetchData(user.id)
    // }
    // Comentar ou remover a lógica original
  }, [user])

  // Remover função para buscar portalUrl
  // const getPortalUrl = async (kinde_id: string, pathname: string) => {
  //   if (portalUrl) return window.open(portalUrl, '_blank')
  //   setIsLoadingPortalUrl(true)
  //   try {
  //     const response = await fetch(
  //       `/api/subscription?kinde_id=${kinde_id}&type=portalUrl`,
  //       {
  //         method: 'POST',
  //       }
  //     )
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch portal URL')
  //     }
  //     const data = await response.json()
  //     setPortalUrl(data.portalUrl)
  //     setIsLoadingPortalUrl(false)
  //   } catch (err) {
  //     console.error('Error fetching portal URL:', err)
  //     setError(err instanceof Error ? err.message : 'An error occurred')
  //     setIsLoadingPortalUrl(false)
  //   }
  // }

  // useEffect(() => {
  //   if (portalUrl) window.open(portalUrl, '_blank')
  // }, [portalUrl])

  // Remover ou simplificar a renderização
  // if (isLoading) {
  //   return <div>Carregando dados da assinatura...</div>
  // }

  // if (error) {
  //   return <div>Erro ao carregar dados: {error}</div>
  // }

  // if (!subscription) {
  //   return (
  //     <div>
  //       Você não possui uma assinatura ativa.
  //       {/* Adicionar botão para iniciar assinatura se necessário */}
  //     </div>
  //   )
  // }

  console.log('🔔 accessTokenRaw:', decodedToken)
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='mb-1 text-[20px] font-semibold'>Assinaturas</h2>
        <p className='text-[14px] text-muted-foreground'>
          Acompanhe os detalhes de seu plano, pagamentos e gerencie a sua
          assinatura.
        </p>
      </div>

      {isLoadingSubscription && (
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-[20px] w-full' />
          <Skeleton className='h-[20px] w-full' />
          <Skeleton className='h-[20px] w-full' />
          <Skeleton className='h-[20px] w-full' />
        </div>
      )}

      {!isLoadingSubscription && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between rounded-lg border bg-white p-5'>
            <div className='flex flex-col'>
              <h3 className='mb-2 text-[16px] font-semibold text-muted-foreground'>
                Plano contratado
              </h3>

              <div className='flex flex-col justify-between lg:flex-row lg:items-center'>
                <div className='flex flex-col gap-2 lg:flex-row lg:items-center'>
                  {!allow_access ? (
                    <Badge
                      variant='secondary'
                      className='cursor-pointer gap-2 bg-red-100 text-[12px] font-bold text-red-700 hover:bg-red-200'
                    >
                      <div className='h-2 w-2 rounded-full bg-red-600' />
                      Assinatura inativa
                    </Badge>
                  ) : (
                    <Badge
                      variant='secondary'
                      className='w-fit cursor-pointer gap-2 bg-green-100 text-[12px] font-bold text-green-700 hover:bg-green-200'
                    >
                      <div className='h-2 w-2 rounded-full bg-green-600' />
                      Assinatura ativa
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 
            <Button
              onClick={() => {
                user && getPortalUrl(user.id, pathname)
              }}
              className='bg-green-600 text-[14px] hover:bg-green-700'
              disabled={isLoadingPortalUrl}
            >
              {isLoadingPortalUrl ? 'Carregando...' : 'Gerenciar assinatura'}
            </Button> */}
          </div>
        </div>
      )}

      {false && (
        <div className='rounded-lg border'>
          <div className=''>
            <Table>
              <TableHeader>
                <TableRow className='bg-[#F9FAFB]'>
                  <TableHead className='text-[14px] font-normal text-muted-foreground'>
                    Período
                  </TableHead>
                  <TableHead className='text-[14px] font-normal text-muted-foreground'>
                    Produto
                  </TableHead>
                  <TableHead className='text-[14px] font-normal text-muted-foreground'>
                    Valor
                  </TableHead>
                  <TableHead className='text-[14px] font-normal text-muted-foreground'>
                    Status de pagamento
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments &&
                  payments?.map((payment, index) => (
                    <TableRow key={index} className='bg-[#fff]'>
                      <TableCell className='text-[14px]'>
                        {new Date(payment.created * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell className='text-[14px]'>
                        {/* {payment?.description} */} Assinatura Premium
                      </TableCell>
                      <TableCell className='text-[14px]'>{`R$ ${(payment.amount / 100).toFixed(2)}`}</TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={cn(
                            'flex w-fit items-center gap-2',
                            payment.status === 'succeeded'
                              ? 'bg-green-100 text-[12px] font-medium text-green-700 hover:bg-green-200'
                              : 'cursor-pointer bg-orange-100 text-[12px] font-medium text-orange-700 hover:bg-orange-200'
                          )}
                        >
                          <div className='flex items-center gap-2'>
                            <div
                              className={cn(
                                'h-2 w-2 flex-shrink-0 rounded-full',
                                payment.status === 'succeeded'
                                  ? 'bg-green-600'
                                  : 'bg-red-600'
                              )}
                            />
                            <span className='text-[14px]'>
                              {payment.status === 'succeeded'
                                ? 'Pagamento efetuado'
                                : 'Pagamento pendente'}
                            </span>
                          </div>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                {payments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center'>
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className='flex h-[64px] items-center justify-between border-t bg-white px-6'>
              <span className='text-sm font-semibold text-[#344054]'>
                Exibindo {payments?.length} de {payments?.length}
              </span>

              <Button variant='outline' className='bg-white' disabled={true}>
                Ver Mais
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionTable
