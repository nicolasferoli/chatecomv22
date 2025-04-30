'use client'

import React, {
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { motion } from 'framer-motion'
import { Message, QuestionsType } from '@prisma/client'
import { InputMask } from '@react-input/mask'
import { IoSend } from 'react-icons/io5'

import { useChatContext } from './chat-context'
import { TextMessage } from './messages/text-message'
import { AudioMessage } from './messages/audio-message'
import { MessageBubble } from './messages/message-bubble'
import { ButtonsMessage } from './messages/buttons-message'
import { ImageMessage } from './messages/image-message'
import { EmbedMessage } from './messages/embed-message'
import { RedirectMessage } from './messages/redirect-message'
import { IoIosMic } from 'react-icons/io'

const messageTypeMap: Record<Message['type'] | string, typeof TextMessage> = {
  text: TextMessage,
  question: TextMessage,
  audio: AudioMessage,
  buttons: ButtonsMessage,
  image: ImageMessage,
  embed: EmbedMessage,
  redirect: RedirectMessage,
}

type MaskOptions = {
  mask?: string
  placeholder: string
  inputType?: HTMLInputTypeAttribute
  autoComplete?: HTMLInputAutoCompleteAttribute
}

const inputOptionsMap: Record<QuestionsType, MaskOptions> = {
  text: {
    placeholder: 'Digite sua mensagem....',
  },
  email: {
    inputType: 'email',
    autoComplete: 'email',
    placeholder: 'Digite seu e-mail...',
  },
  cpf: {
    mask: '___.___.___-__',
    placeholder: 'Digite seu CPF...',
  },
  // @ts-expect-error
  wpp: {
    mask: '+__ (__) _____-____',
    placeholder: 'Digite seu WhatsApp...',
  },
}

export function ChatContent() {
  const {
    isTyping,
    messages,
    isWaitingAnswer,
    setWaitingAnswer,
    storeUserAnswer,
    currentMessage,
  } = useChatContext()
  const lastBubbleRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputMessage, setInputMessage] = useState<string>('')
  const isWaitingQuestion = useMemo(
    () => isWaitingAnswer && [...messages].pop()?.type === 'question',
    [messages, isWaitingAnswer]
  )

  const inputOptions = useMemo(() => {
    const maskOptions = inputOptionsMap[
      (currentMessage?.content as any)?.options?.type
    ] as MaskOptions

    return {
      ...(maskOptions?.mask
        ? { mask: maskOptions?.mask ?? '', replacement: { _: /\d/ } }
        : {}),
      id: 'answer',
      name: 'answer',
      ref: inputRef,
      autoComplete: maskOptions?.autoComplete ?? 'off',
      type: maskOptions?.inputType ?? 'text',
      placeholder: maskOptions?.placeholder,
      className:
        'h-[50px] flex-1 rounded-full border bg-white p-2 px-4 transition-all duration-75 focus:outline-none focus:ring-2 focus:ring-[#075f58]',
    }
  }, [currentMessage])

  useEffect(() => {
    inputRef?.current?.focus()
    lastBubbleRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lastBubbleRef.current])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const answer = new FormData(event.currentTarget).get('answer') as string

    setWaitingAnswer(false)
    setInputMessage('')
    storeUserAnswer(answer)
  }

  return (
    <>
      <main className='mt-6 flex-1 overflow-y-auto pb-20 md:mt-10'>
        <div className='mx-auto mt-14 flex max-w-6xl flex-col'>
          {messages.map((msg) => {
            const MessageItemComponent = messageTypeMap[msg?.type]

            return (
              MessageItemComponent && (
                <MessageItemComponent
                  message={msg}
                  key={msg.id}
                  ref={lastBubbleRef}
                />
              )
            )
          })}
          <div />

          {/* Typing Bubble */}
          {isTyping && (
            <MessageBubble
              type={'bot'}
              className='min-w-fit items-center justify-center px-4 py-4'
              ref={lastBubbleRef}
            >
              <div className='flex space-x-1'>
                {currentMessage?.type === 'audio' ? (
                  // Recording effect
                  <motion.div
                    animate={{
                      opacity: [0.45, 1, 0.45],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: .8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <IoIosMic size={24} className='fill-gray-400' />
                  </motion.div>
                ) : (
                  // Typing effect
                  ['dot1', 'dot2', 'dot3'].map((dot, index) => (
                    <motion.div
                      key={dot}
                      className='h-2 w-2 rounded-full bg-gray-400'
                      animate={{
                        y: [0, -6, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: 'easeInOut',
                      }}
                    />
                  ))
                )}
              </div>
            </MessageBubble>
          )}
        </div>
      </main>

      {isWaitingQuestion && (
        <form
          onSubmit={handleSubmit}
          className={`fixed bottom-6 left-1/2 w-full max-w-3xl -translate-x-1/2 px-4`}
        >
          <div className='flex w-full items-center gap-2'>
            {inputOptions.mask ? (
              <InputMask
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                {...inputOptions}
              />
            ) : (
              <input {...inputOptions} />
            )}

            <button className='flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#075f58] text-white transition-colors hover:bg-[#075f58]/80 disabled:opacity-50'>
              <IoSend className='h-5 w-5' />
            </button>
          </div>
        </form>
      )}
    </>
  )
}
