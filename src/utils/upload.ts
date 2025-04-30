import imageCompression from 'browser-image-compression'

type UploadResponse = {
  message: string
  url?: string
  filename?: string
}

export async function uploadMedia(
  file: File,
  kindeId: string
): Promise<UploadResponse | undefined> {
  try {
    if (!kindeId) {
      throw new Error('Kinde ID is required for upload.')
    }

    let compressedFile = file

    // Compressão de imagens
    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1, // Tamanho máximo do arquivo em MB
        maxWidthOrHeight: 800, // Largura ou altura máxima
        useWebWorker: true,
      }
      compressedFile = await imageCompression(file, options)
    }

    const formData = new FormData()
    formData.append('file', compressedFile)
    formData.append('filename', file.name)

    const response = await fetch(`/api/upload?kinde_id=${kindeId}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorDetails = 'Erro desconhecido no upload.'
      try {
        const errorData = await response.json()
        errorDetails = errorData.error || errorData.message || JSON.stringify(errorData)
      } catch (jsonError) {
        errorDetails = await response.text()
      }
      throw new Error(`Erro ao fazer upload: ${response.status} - ${errorDetails}`)
    }

    const data: UploadResponse = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao fazer upload da mídia:', error)
  }
}
