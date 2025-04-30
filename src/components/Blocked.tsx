// Start of Selection
import React from 'react'
import { Lock } from 'lucide-react'

/**
 * Componente Blocked.
 *
 * @param {React.PropsWithChildren<{ className?: string }>} props - Propriedades do componente.
 * @returns {JSX.Element} - Elemento JSX que representa o componente bloqueado.
 */
export default function Blocked({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`group relative cursor-not-allowed ${className}`}>
      {children}
      <div className='absolute inset-0 flex min-h-[30px] w-full items-center justify-center truncate rounded-lg bg-slate-800 bg-opacity-60 p-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100'>
        <Lock className='mr-2' size={20} />
        Em desenvolvimento
      </div>
    </div>
  )
}
