'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Copy, SquareArrowOutUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface WelcomeScreenProps {
  kinde_id: string
}

const WelcomeScreen = ({ kinde_id }: WelcomeScreenProps) => {
  const { user, getUser } = useKindeAuth()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGenerateInvoice = async () => {
    setIsLoading(true)
    try {
      // Remover chamada fetch para /api/subscription
      // const response = await fetch('/api/subscription', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ kinde_id }),
      // })
      // const data = await response.json()
      // console.log(data)
      // setInvoiceUrl(data.checkoutUrl)

      // Adicionar alguma lógica alternativa ou redirecionamento se necessário
      // Exemplo: Redirecionar para o dashboard
      router.push('/dashboard') // Ou outra página relevante

    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  return (
    <div className='py-[80px]'>
      <div className='mx-auto flex max-w-[1450px] flex-col items-center gap-8 px-8'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <Image src='/logo-dark.svg' alt='logo' width={120} height={85} />

          <div className='flex flex-col items-center gap-2'>
            <h1 className='text-[28px] font-semibold leading-[28px] text-[#020617]'>
              Bem-vindo à Nova Chat ECOM:
            </h1>

            <span className='text-[28px] leading-[28px] text-[#020617]'>
              Agora Mais Poderosa, Intuitiva e Completa!
            </span>
          </div>

          <p className='max-w-[978px] text-center text-[16px] leading-[24px] text-[#344054]'>
            É com enorme entusiasmo que apresentamos a nova Chat ECOM,
            completamente reconstruída do zero para oferecer a você a melhor
            experiência em automação de vendas no WhatsApp! Mais rápida, mais
            fácil de usar e com funcionalidades inéditas que vão transformar sua
            forma de vender online.
          </p>
        </div>

        <div className='grid gap-3 md:grid-cols-3'>
          <Card className='flex max-w-[318px] flex-col gap-2 p-8'>
            <span>💡</span>

            <h2 className='text-[16px] font-semibold leading-[19px] text-[#020617]'>
              Crie Funis de Conversão em Poucos Cliques:
            </h2>

            <p className='text-[14px] leading-[20px] text-[#344054]'>
              Deixe a inteligência artificial trabalhar para você! Agora, com
              apenas alguns cliques, você pode criar funis de vendas otimizados
              que convertem leads em clientes de forma automática.
            </p>
          </Card>

          <Card className='flex max-w-[318px] flex-col gap-2 p-8'>
            <span>📦</span>

            <h2 className='max-w-[180px] text-[16px] font-semibold leading-[19px] text-[#020617]'>
              Integração com a Genius Ecom:
            </h2>

            <p className='text-[14px] leading-[20px] text-[#344054]'>
              Já tem produtos na Genius ECOM? Agora ficou mais fácil importar
              seus produtos e gerar scripts perfeitos de conversão e recuperação
              de vendas em segundos. Transforme ideias em vendas sem esforço!
            </p>
          </Card>

          <Card className='flex max-w-[318px] flex-col gap-2 p-8'>
            <span>✨</span>

            <h2 className='text-[16px] font-semibold leading-[19px] text-[#020617]'>
              Automatize o Atendimento da Sua Audiência:
            </h2>

            <p className='text-[14px] leading-[20px] text-[#344054]'>
              Economize tempo e ofereça suporte impecável! Use respostas rápidas
              automatizadas para atender seus clientes e manter a satisfação em
              alta.
            </p>
          </Card>
        </div>

        <div className='flex flex-col items-center gap-4'>
          <Button
            className='bg-[#16A34A] font-semibold text-white transition-colors hover:bg-[#138b3f]'
            disabled={isLoading}
            onClick={handleGenerateInvoice}
          >
            {isLoading ? 'Carregando...' : 'Ativar Conta'}
          </Button>

          <Image src='/secure-payment.png' alt='logo' width={338} height={57} />
        </div>

        <div className='mx-auto max-w-[978px]'>
          {user?.family_name?.toLowerCase() === 'monthly' && (
            <Card className='flex flex-col gap-2 bg-[#F6FEF9] p-6'>
              <h3 className='text-[16px] font-semibold leading-[19px] text-[#020617]'>
                Plano Mensal:
              </h3>

              <p className='text-justify text-[14px] leading-[20px] text-[#344054] md:text-left'>
                Se você está no plano mensal, sua assinatura será ativada a
                partir de hoje e será renovada apenas após 30 dias. Basta
                cadastrar um cartão de crédito válido para ativar sua conta.
                Fique tranquilo, nenhum valor será cobrado agora, e sua
                assinatura anterior na Lastlink será automaticamente cancelada.
              </p>
            </Card>
          )}

          {user?.family_name?.toLowerCase() === 'yearly' && (
            <Card className='flex flex-col gap-2 border-[#FDB022] bg-[#FFFCF5] p-6'>
              <h3 className='text-[16px] font-semibold leading-[19px] text-[#020617]'>
                Plano Ecom PASS:
              </h3>

              <p className='text-justify text-[14px] leading-[20px] text-[#344054] md:text-left'>
                Se você está no plano anual ECOM PASS, sua assinatura será
                ativada a partir de hoje e será renovada somente após 12 meses,
                junto com a renovação da sua assinatura do ECOM PASS (sem nenhum
                custo extra). Basta cadastrar um cartão de crédito válido para
                ativar sua conta.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
