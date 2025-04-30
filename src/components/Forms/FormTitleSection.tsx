import React from 'react'

interface FormSectionProps {
  title: string
  subtitle?: string
  className?: string
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={`w-full pb-6 ${className}`}>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-bold'>{title}</h1>
        {subtitle && <span className='text-sm text-gray-500'>{subtitle}</span>}
        <hr className='mt-4 w-full border-gray-300' />
      </div>
    </div>
  )
}

export default FormSection
