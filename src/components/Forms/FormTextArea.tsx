import React from 'react'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface FormTextAreaProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  className,
}) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`mt-2 ${className}`}
      />
    </div>
  )
}

export default FormTextArea
