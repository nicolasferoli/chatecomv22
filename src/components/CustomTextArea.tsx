import EmojiPicker from 'emoji-picker-react'
import { EmojiClickData } from 'emoji-picker-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Braces,
  Clock,
  Italic,
  Loader,
  Loader2,
  Smile,
  Sparkles,
  Strikethrough,
  X,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'react-toastify'

interface MessageTextAreaProps {
  text: string
  setText: (text: string) => void
  showEmojiPicker: boolean
  setShowEmojiPicker: (show: boolean) => void
  variables?: Array<{ id: string; text: string }>
  placeholder?: string | 'Escreva sua mensagem'
  hasDynamicDelay: boolean
  setHasDynamicDelay: (hasDynamicDelay: boolean) => void
  minutes: any
  setMinutes: (minutes: any) => void
  seconds: any
  setSeconds: (seconds: any) => void
  isImage?: boolean
}

const MessageTextArea = ({
  text,
  setText,
  showEmojiPicker,
  setShowEmojiPicker,
  variables,
  placeholder,
}: Omit<MessageTextAreaProps, 'hasDynamicDelay' | 'setHasDynamicDelay' | 'minutes' | 'setMinutes' | 'seconds' | 'setSeconds'>) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  const applyMarkdown = (mark: string) => {
    const textarea = textAreaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)
    if (start === end) return;
    const newText =
      text.substring(0, start) +
      mark +
      selectedText +
      mark +
      text.substring(end)
    setText(newText)
    textarea.focus();
    textarea.setSelectionRange(start + mark.length, end + mark.length);
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + emojiData.emoji + text.substring(end);
    setText(newText);
    textarea.focus();
    const cursorPosition = start + emojiData.emoji.length;
    textarea.setSelectionRange(cursorPosition, cursorPosition);
  }

  const handleGenerateAiText = async () => {
    if (!text.trim()) {
      toast.info("Digite algum texto para a IA melhorar.");
      return;
    }
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao se comunicar com o serviço de IA.');
      }

      if (data.text) {
        setText(data.text);
        toast.success("Texto aprimorado pela IA!");
      } else {
         throw new Error("Resposta da IA inválida.");
      }

    } catch (error) {
      console.error("Erro ao gerar texto com IA:", error);
      toast.error(`Erro: ${(error as Error).message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div
      className={`z-10 max-w-[390px] overflow-hidden !rounded-md border-[1px] border-gray-300 bg-white text-zinc-900 ${isAiLoading ? 'animate-borderColorCycleAi border-[2px]' : ''}`}
    >
      <textarea
        autoFocus
        ref={textAreaRef}
        placeholder={placeholder || 'Escreva sua mensagem'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`h-auto min-h-[60px] w-full resize-none whitespace-pre-wrap break-words border-none px-[14px] py-[10px] text-[14px] text-sm outline-none placeholder:text-xs md:placeholder:text-sm ${text.length > 100 ? 'min-h-[120px] resize-y' : ''}`}
        rows={1}
      />
      <div className='flex w-full items-center justify-between gap-2 border-t border-gray-200 bg-white px-[5px] py-1'>
        <div className='flex items-center opacity-60'>
          <Button variant='link' size='sm' onClick={() => applyMarkdown('*')} aria-label="Negrito" className="p-1">
            <Bold className='h-4 w-4' />
          </Button>
          <Button variant='link' size='sm' onClick={() => applyMarkdown('_')} aria-label="Itálico" className="p-1">
            <Italic className='h-4 w-4' />
          </Button>
          <Button variant='link' size='sm' onClick={() => applyMarkdown('~')} aria-label="Riscado" className="p-1">
            <Strikethrough className='h-4 w-4' />
          </Button>
          <Button
            variant='link'
            size='sm'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-label="Emoji"
            className="p-1"
          >
            <Smile className='h-4 w-4' />
          </Button>
        </div>
        <div className='flex items-center opacity-80'>
          {variables && variables.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='link' size='sm' aria-label="Variáveis" className="p-1">
                  <Braces className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {variables.map((variable) => (
                  <DropdownMenuItem
                    key={variable.id}
                    onClick={() => {
                       const textarea = textAreaRef.current;
                       if (!textarea) return;
                       const currentVal = textarea.value;
                       const selectionStart = textarea.selectionStart;
                       const newVal = currentVal.substring(0, selectionStart) + `{${variable.text}}` + currentVal.substring(selectionStart);
                       setText(newVal);
                       setTimeout(() => {
                         const newCursorPos = selectionStart + `{${variable.text}}`.length;
                         textarea.focus();
                         textarea.setSelectionRange(newCursorPos, newCursorPos);
                       }, 0);
                    }}
                    className="cursor-pointer"
                  >
                    {variable.text}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant='link' size='sm' disabled className="p-1 opacity-50">
              <Braces className='h-4 w-4' />
            </Button>
          )}
          <Button variant='link' size='sm' onClick={handleGenerateAiText} disabled={isAiLoading} aria-label="Melhorar com IA" className="p-1">
            {isAiLoading ? (<Loader2 className='animate-spin h-4 w-4'/>) : ( <Sparkles className='h-4 w-4 text-yellow-500' />)} 
          </Button>
        </div>
      </div>

      {showEmojiPicker && (
        <div className='absolute bottom-12 left-2 z-50 rounded-lg border border-gray-300 bg-white p-2 shadow-lg' style={{ marginBottom: '5px' }}> 
          <div className='mb-1 flex justify-end'>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-zinc-500 hover:bg-red-100 hover:text-red-600"
              onClick={() => setShowEmojiPicker(false)}
              aria-label="Fechar emojis"
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
          <EmojiPicker 
            onEmojiClick={handleEmojiClick} 
            height={350} 
            width={300} 
            lazyLoadEmojis={true} 
          />
        </div>
      )}
    </div>
  )
}

export default MessageTextArea
