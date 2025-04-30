import { Loader } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Componente LoadingScreen.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {string} [props.text="Carregando..."] - Texto a ser exibido durante o carregamento.
 * @param {boolean} [props.finished=false] - Indica se o carregamento foi concluído.
 * @param {number} [props.totalSeconds=10] - Tempo total em segundos para completar o carregamento.
 * @param {string} [props.outputText] - Texto adicional a ser exibido.
 * @returns {JSX.Element} - Elemento JSX que representa a tela de carregamento.
 */
const LoadingScreen = ({
  emoji,
  text = 'Carregando...',
  finished = false,
  totalSeconds = 10,
  description,
  outputText,
}: {
  emoji?: string
  text?: string
  finished?: boolean
  totalSeconds?: number
  description?: string
  outputText?: string
}) => {
  const [progress, setProgress] = useState(0)
  const intervalTime = (totalSeconds * 1000) / 100

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100 || finished) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [finished, intervalTime])

  return (
    <div className='flex h-[90vh] items-center justify-center'>
      <div className='flex w-full max-w-[350px] flex-col items-center gap-8 text-center'>
        <div>
          {emoji && <p className='text-5xl mb-4'>{emoji}</p>}
          <p className='textslate-700 text-[18px] font-medium text-gray-600'>
            {text}
          </p>
          {description && (
            <p className='mt-2 text-center text-[14px] text-gray-500'>
              {description}
            </p>
          )}
        </div>
        {outputText && (
          <p className='z-0 my-4 flex h-[210px] max-h-[210px] w-[500px] items-end overflow-hidden whitespace-pre-line text-center font-mono opacity-50'>
            {outputText}
          </p>
        )}
        <div className='h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-1.5 rounded-full bg-blue-500 transition-all duration-500 ease-in-out'
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
