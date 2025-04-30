'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chat, Message } from '@prisma/client'
import { useSearchParams } from 'next/navigation'

import { ChatHeader } from './chat-header'
import { ChatContent } from './chat-content'
import { ChatContext } from './chat-context'
import { registerChatAction, sendAnswer } from '../../actions/chat-actions'
import { ToastContainer } from 'react-toastify'

type WhatsAppChatProps = {
  chatInfo: Chat
  messages: Message[]
}

export function WhatsAppChat({ chatInfo, messages }: WhatsAppChatProps) {
  const runId = useMemo(() => crypto.randomUUID(), [])
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [isWaitingAnswer, setWaitingAnswer] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState<Message>()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('isPreview') === 'true'

  const messagesIterator = useMemo(
    () =>
      (function* (): Generator<Message, void, unknown> {
        yield* messages
      })(),
    [messages]
  )

  const variableReplacer = useCallback(
    (value: string) =>
      value.replace(/\{(\w+)\}/gi, (og, name) => variables?.[name] ?? og),
    [variables]
  )

  async function renderNextMessage() {
    if (isPreview) return;

    const { value: message, done: iteratorFinish } = messagesIterator.next()
    if (iteratorFinish) {
        console.log('::::> CHAT NÃO-PREVIEW FINALIZADO');
        return;
    }
    setCurrentMessage(message)

    const delay = (message.content as any)?.delayValue || 2000;
    const typingDuration = Math.min(delay, 3000);

    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, typingDuration))

    const key = message.type === 'image' ? 'legend' : 'text'
    if (message?.content && typeof message.content === 'object' && key in message.content) {
      message.content[key] = variableReplacer(message.content[key]);
    }

    setChatHistory((state) => [...state, message])
    setIsTyping(false)

    if (message.type === 'question' || message.type === 'buttons') {
      setWaitingAnswer(true)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 750))

    renderNextMessage()
  }

  async function storeUserAnswer(value: string) {
     if (isPreview) return;
    
     setWaitingAnswer(false);
     setIsTyping(false);

    if (value || typeof value === 'string') {
      const userMessage: Message = {
          id: crypto.randomUUID(),
          from: 'user',
          chatId: chatInfo.id,
          type: 'text',
          content: { text: value },
          position: chatHistory.length,
          createdAt: new Date(),
          updatedAt: new Date(),
          variableId: null,
          hasDynamicDelay: false,
          delayValue: 0,
      };
      setChatHistory((state) => [...state, userMessage]);
    }

    let variableName: string | undefined;

    switch (currentMessage?.type) {
      case 'redirect':
        await registerChatAction(chatInfo.id, 'clicked_link', {
          clicked_link_url: `https://${(currentMessage?.content as any)?.url}`,
        })
        break
      case 'buttons':
        await registerChatAction(chatInfo.id, 'clicked_button', {
          button_question: (currentMessage?.content as any)?.text,
          button_answer: value,
        })
        renderNextMessage(); 
        break;
      case 'question':
        variableName = (currentMessage?.content as any)?.options?.variable;
        if (variableName && value) {
            setVariables((state) => ({
                ...state,
                [variableName!]: value,
            }));
             await sendAnswer(runId, chatInfo.id, currentMessage?.id!, value);
        } else {
             console.warn('Tentativa de salvar resposta para pergunta sem variável definida ou valor vazio');
        }
        break;
       default:
         console.warn('storeUserAnswer chamada para mensagem não interativa:', currentMessage?.type);
         break;
    }
  }

  useEffect(() => {
    if (isPreview) {
      console.log('::::> MODO PREVIEW: Carregando todas as mensagens');
      setChatHistory(messages); 
    } else {
      console.log('::::> MODO NORMAL: Iniciando renderização sequencial');
      renderNextMessage();
    }
  }, [isPreview, messages]);

  useEffect(() => {
     if (!isPreview && !isWaitingAnswer && currentMessage?.type === 'question') {
        console.log('::::> Variável atualizada, continuando fluxo após pergunta...');
       renderNextMessage();
     }
  }, [variables, isPreview, isWaitingAnswer, currentMessage]);

  return (
    <ChatContext.Provider
      value={{
        chatInfo,
        currentMessage,
        isTyping,
        isWaitingAnswer,
        setWaitingAnswer,
        storeUserAnswer,
        messages: chatHistory,
      }}
    >
      <div className='flex min-h-[100svh] flex-col bg-gray-100 bg-whatsappBackground'>
        <ChatHeader />
        <ChatContent />
      </div>

      <ToastContainer />
    </ChatContext.Provider>
  )
}
