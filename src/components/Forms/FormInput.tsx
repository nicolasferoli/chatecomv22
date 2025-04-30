import React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface FormInputProps {
  id: string
  label?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  type?: string
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  className,
  type = 'text',
}) => {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`mt-2 ${className}`}
      />
    </div>
  )
}

export default FormInput
