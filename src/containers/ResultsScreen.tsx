'use client'

import BuilderHeader from '@/components/Headers/BuilderHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ArrowUpRight,
  Loader,
  NotebookPen,
  Users,
  Workflow,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Answer {
  count: number
  label: string
  percentage: number
}

interface Question {
  question: string
  answers: Answer[]
}

interface ResultsProps {
  total_answers: number
  total_views: number
  total_completed_fluxes: number
  questions: Question[]
}

const ResultsScreen = ({ chatId }) => {
  const [chatResults, setChatResults] = useState<ResultsProps | null>(null)

  const getStats = async () => {
    const response = await fetch(`/api/chatlogs?chatId=${chatId}`)
    const data = await response.json()
    setChatResults(data)
    if (data.total_answers === 0) {
      return
    }
  }

  useEffect(() => {
    getStats()
  }, [])

  if (!chatResults)
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <Loader className='animate-spin text-zinc-500' size={50} />
      </div>
    )

  return (
    <div className='overflow-x-hidden'>
      <BuilderHeader chatId={chatId} activeSection='results' />
      <div className='flex w-screen items-center justify-center'>
        <Card className='m-auto mx-6 mb-10 mt-6 w-full max-w-[1040px] md:mx-[100px] md:mt-[70px]'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Respostas</CardTitle>
            <Button className='text-slate-600' variant={'outline'}>
              Exportar <ArrowUpRight />
            </Button>
          </CardHeader>
          <HeaderResults chatResults={chatResults} />
          <ButtonResults chatResults={chatResults} />
          <QuestionResults chatResults={chatResults} />
        </Card>
      </div>
    </div>
  )
}

export default ResultsScreen

const HeaderResults = ({ chatResults }) => {
  return (
    <CardContent>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Card className='flex flex-col items-center justify-center'>
          <CardHeader className='flex w-full flex-row items-center justify-between'>
            <CardTitle className='text-sm'>Total de respostas</CardTitle>
            <NotebookPen size={16} color='#0C88EE' />
          </CardHeader>
          <CardContent className='text-2xl font-bold text-[#0C88EE]'>
            {chatResults.total_answers}
          </CardContent>
        </Card>
        <Card className='flex flex-col items-center justify-center'>
          <CardHeader className='flex w-full flex-row items-center justify-between'>
            <CardTitle className='text-sm'>Alcance</CardTitle>
            <Users size={16} color='#0C88EE' />
          </CardHeader>
          <CardContent className='text-2xl font-bold text-[#0C88EE]'>
            {Math.floor(chatResults.total_views)}
          </CardContent>
        </Card>
        <Card className='flex flex-col items-center justify-center'>
          <CardHeader className='flex w-full flex-row items-center justify-between'>
            <CardTitle className='text-sm'>Fluxos completos</CardTitle>
            <Workflow size={16} color='#0C88EE' />
          </CardHeader>
          <CardContent className='text-2xl font-bold text-[#0C88EE]'>
            {chatResults.total_completed_fluxes}
          </CardContent>
        </Card>
      </div>
    </CardContent>
  )
}

const ButtonResults = ({ chatResults }) => {
  const ButtonResultOption = ({ text, percent }) => {
    return (
      <Card className='transition-colors hover:text-[#0C88EE]'>
        <div className='flex justify-between px-4 py-3'>
          <span>{text}</span>
          <span className='font-semibold'>{percent}%</span>
        </div>
      </Card>
    )
  }

  return (
    <div>
      {chatResults?.questions?.map((item, index) => {
        // Verifica se há pelo menos um item em answers com percentage
        const hasPercentage = item.answers.some(
          (answersItem) => answersItem.percentage !== undefined
        )

        // Não renderiza nada se nenhum item em answers tiver percentage
        if (!hasPercentage) {
          return null
        }

        return (
          <Card key={index} className='mx-6 mb-8 flex flex-col gap-4 p-8'>
            <CardTitle className='text-sm'>{item.question}</CardTitle>
            <div className='flex flex-col gap-2'>
              {item.answers.map((answersItem, index) =>
                answersItem.percentage !== undefined ? (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger>
                        <ButtonResultOption
                          text={answersItem.label}
                          percent={answersItem.percentage}
                        />
                      </TooltipTrigger>
                      <TooltipContent side='top' align='end'>
                        <p>{answersItem.count} votos</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

const QuestionResults = ({ chatResults }) => {
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])

  const toggleExpanded = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const QuestionCardAwnser = ({ text, date }) => {
    return (
      <div>
        <Card className='flex flex-col gap-1 p-3 md:flex-row md:justify-between'>
          <p className='text-xs text-slate-700'>{text}</p>
          <span className='text-nowrap text-xs text-slate-500'>{date}</span>
        </Card>
      </div>
    )
  }
  return (
    <div>
      {chatResults?.questions?.map((item, index) => {
        // Verifica se alguma resposta possui "percentage"
        const hasPercentage = item.answers.some(
          (answersItem) => answersItem.percentage !== undefined
        )

        // Não renderiza nada se alguma resposta tiver "percentage"
        if (hasPercentage) {
          return null
        }

        const isExpanded = expandedIndexes.includes(index)
        const visibleAnswers = isExpanded
          ? item.answers
          : item.answers.slice(0, 5) // Mostra apenas os primeiros 5 itens se não expandido

        return (
          <Card key={index} className='mx-6 mb-8 flex flex-col gap-4 p-8'>
            <div className='flex justify-between'>
              <CardTitle className='text-sm'>{item.question}</CardTitle>
              <CardDescription className='text-sm text-[#0C88EE]'>
                {item.answers.length} respostas
              </CardDescription>
            </div>

            {/* Renderiza apenas respostas válidas */}
            {visibleAnswers.map((answersItem, index) => {
              const formattedDate = new Date(
                answersItem.date
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              })

              return (
                <QuestionCardAwnser
                  key={index}
                  text={answersItem.text}
                  date={formattedDate} // Passa a data formatada
                />
              )
            })}

            {/* Botão de mostrar mais/menos */}
            {item.answers.length > 5 && (
              <Button
                size='sm'
                className='max-w-[117px] bg-[#E7F4FF] text-[#0C88EE] transition-colors'
                onClick={() => toggleExpanded(index)}
              >
                {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
