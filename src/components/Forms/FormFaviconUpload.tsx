import React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { Label } from '../ui/label'
import { Pencil, X } from 'lucide-react'

interface ImageUploadProps {
  label: string
  imageUrl: string
  onUpload: (url: string) => void
  chatId: string
  type: string
}

const FaviconUpload: React.FC<ImageUploadProps> = ({
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
          const size =
            type === 'favicon' ? 100 : type === 'share-image' ? 600 : 800

          // Definir o menor lado para cortar no centro
          const cropSize = Math.min(img.width, img.height)
          const cropX = (img.width - cropSize) / 2
          const cropY = (img.height - cropSize) / 2

          // Configurar o canvas para proporção 1:1
          canvas.width = size
          canvas.height = size

          // Desenhar a imagem recortada no canvas
          ctx.drawImage(
            img,
            cropX, // Início do recorte em X
            cropY, // Início do recorte em Y
            cropSize, // Largura do recorte
            cropSize, // Altura do recorte
            0, // Início no canvas X
            0, // Início no canvas Y
            size, // Tamanho final no canvas X
            size // Tamanho final no canvas Y
          )

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
      <Label htmlFor={label}></Label>
      <div className='relative mt-2 flex h-fit min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-slate-100 p-6'>
        {imageUrl && (
          <img
            height={20}
            width={60}
            src={imageUrl}
            alt={`${label} Preview`}
            className='h-full rounded-full'
          />
        )}
        <div className='absolute bottom-2 right-3 flex flex-col gap-2'>
          <Button
            className='h-8 w-8 rounded-full border-[1px] bg-white text-gray-600 hover:bg-gray-100'
            onClick={handleUploadImage}
          >
            <Pencil />
          </Button>
          <Button
            className='h-8 w-8 rounded-full border-[1px] bg-white text-gray-600 hover:bg-gray-100'
            onClick={() => {}}
          >
            <X />
          </Button>
        </div>
      </div>{' '}
    </>
  )
}

export default FaviconUpload
