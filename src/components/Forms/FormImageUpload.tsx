import React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { Label } from '../ui/label'

interface ImageUploadProps {
  label: string
  imageUrl: string
  onUpload: (url: string) => void
  chatId: string
  type: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  imageUrl,
  onUpload,
  chatId,
  type,
}) => {
  const handleUploadImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png'
    input.onchange = async (event: any) => {
      const file = event.target.files[0]
      if (file) {
        const canvas = document.createElement('canvas')
        const ctx: any = canvas.getContext('2d')
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = async () => {
          const maxWidth =
            type === 'favicon' ? 100 : type === 'share-image' ? 600 : 800
          const maxHeight =
            type === 'favicon' ? 100 : type === 'share-image' ? 313 : 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(async (blob: any) => {
            const formData = new FormData()
            formData.append('file', blob, file.name)
            formData.append('type', type)
            formData.append('chatId', chatId)
            formData.append('filename', file.name)

            try {
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              })

              if (response.ok) {
                const data = await response.json()
                toast.success('Upload bem-sucedido!')
                onUpload(data.url)
              } else {
                toast.error('Erro ao fazer upload da imagem.')
              }
            } catch (error) {
              toast.error('Erro ao fazer upload da imagem.')
            }
          }, file.type)
        }
      }
    }
    input.click()
  }

  return (
    <>
      <Label htmlFor={label}>{label}</Label>
      <div className='mt-2 flex h-fit min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-slate-100 p-6'>
        {imageUrl && (
          <img src={imageUrl} alt={`${label} Preview`} className='h-full' />
        )}
        <Button
          className='border-[1px] bg-white text-gray-600 hover:bg-gray-100'
          onClick={handleUploadImage}
        >
          Enviar imagem
        </Button>
      </div>{' '}
    </>
  )
}

export default ImageUpload
