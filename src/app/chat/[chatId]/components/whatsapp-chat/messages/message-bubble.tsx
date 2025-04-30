import React from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const bubbleVariants = cva(
  'relative flex h-fit w-fit min-w-[85px] max-w-[90%] md:max-w-[75%] justify-start gap-3 text-wrap break-words rounded-lg p-[10px] px-3 text-black shadow-sm hover:shadow-md transition-all cursor-pointer',
  {
    variants: {
      type: {
        user: 'bg-[#D9FDD3] ml-auto',
        bot: 'bg-[#FFFFFF]',
      },
    },
  }
)

export const MessageBubble = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'header'> & VariantProps<typeof bubbleVariants>
>(({ className, type, children }, ref) => (
  <motion.div
    initial={{ y: 5 }}
    animate={{ y: 0 }}
    exit={{ y: 5 }}
    transition={{ duration: 0.05 }}
    className={cn('mx-4 my-1 min-h-11', bubbleVariants({ type }), className)}
    ref={ref}
  >
    <Image
      className={`rotate- top-0 -${type === 'bot' ? 'left' : 'right'}-2 absolute`}
      src={`/Polygon${type === 'bot' ? '' : '-green'}.svg`}
      width={15}
      height={4}
      alt='polygon'
    />
    {children}
  </motion.div>
))
