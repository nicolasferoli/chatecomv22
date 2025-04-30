import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { IoSparkles } from 'react-icons/io5';
import { DialogOverlay } from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function CreateProductButton({setProductDescription}:{setProductDescription: (description: string) => void}) {
  const [productType, setProductType] = useState('');
  const [targetGender, setTargetGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [market, setMarket] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const intervalTime = (40 * 1000) / 100

  useEffect(() => {
    if(!loading) return 
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [intervalTime,loading])


  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    setProgress(0)
    const response = await fetch('/api/ai/product', {
      method: 'POST',
      body: JSON.stringify({
       question:`
       Qual é o tipo de produto?
       ${productType}

       Qual é o gênero do público alvo?
       ${targetGender}

       Qual é a faixa etária do público alvo?
       ${ageRange}

       Qual é o mercado de atuação do produto?
       ${market}
       `
      })
    })
    const data = await response.json()
    setProductDescription(data.text)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='flex items-center gap-2 border border-[#16A34A] bg-white text-black rounded-xl hover:bg-gray-200/10'>
          <IoSparkles size={16} color='#16A34A' /> Criar produto com IA
        </Button>
      </DialogTrigger>
      <DialogContent className='p-10 rounded-lg shadow-lg bg-gradient-to-t h-[660px] from-white to-green-50 border-[#30D06A]'>

        {!loading ? <div className=''>
          <DialogTitle className='text-xl font-semibold flex gap-3'><IoSparkles size={30} color='#16A34A' />  Descrever produto com IA</DialogTitle>
          <p className='mt-8 pb-4 text-sm text-gray-500'>
            Preencha os campos abaixo para gerar a descrição do seu produto utilizando a nossa tecnologia de IA.
          </p>
          <form className='mt-4 space-y-8' onSubmit={handleSubmit}>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Tipo de produto</label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger className='mt-2 h-[40px]'>
                  {productType || 'Selecione uma opção'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Curso Online'>Curso Online</SelectItem>
                  <SelectItem value='E-Book'>E-Book</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Gênero do público alvo</label>
              <Select value={targetGender} onValueChange={setTargetGender}>
                <SelectTrigger className='mt-2 h-[40px]'>
                  {targetGender || 'Selecione uma opção'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Masculino'>Masculino</SelectItem>
                  <SelectItem value='Feminino'>Feminino</SelectItem>
                  <SelectItem value='Unissex'>Unissex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Faixa etária</label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger className='mt-2 h-[40px]'>
                  {ageRange || 'Selecione uma opção'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Crianças (0-12 anos)'>Crianças (0-12 anos)</SelectItem>
                  <SelectItem value='Adolescentes (13-17 anos)'>Adolescentes (13-17 anos)</SelectItem>
                  <SelectItem value='Adultos (18+ anos)'>Adultos (18+ anos)</SelectItem>
                  <SelectItem value='Idosos (65+ anos)'>Idosos (65+ anos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>Mercado de atuação do produto</label>
              <Select value={market} onValueChange={setMarket}>
                <SelectTrigger className='mt-2 h-[40px]'>
                  {market || 'Selecione uma opção'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Desenvolvimento Pessoal'>Desenvolvimento Pessoal</SelectItem>
                  <SelectItem value='Finanças Pessoais'>Finanças Pessoais</SelectItem>
                  <SelectItem value='Emagrecimento e Fitness'>Emagrecimento e Fitness</SelectItem>
                  <SelectItem value='Marketing Digital'>Marketing Digital</SelectItem>
                  <SelectItem value='Relacionamentos e Conquista'>Relacionamentos e Conquista</SelectItem>
                  <SelectItem value='Habilidades Técnicas e Profissionais'>Habilidades Técnicas e Profissionais</SelectItem>
                  <SelectItem value='Espiritualidade'>Espiritualidade</SelectItem>
                  <SelectItem value='Aprender Inglês'>Aprender Inglês</SelectItem>
                  <SelectItem value='Hobbies Lucrativos'>Hobbies Lucrativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex justify-end space-x-2'>
              <Button type='submit' className='bg-gradient-to-t from-[#16A34A]/90 to-[#16A34A] rounded-lg text-white w-full'>Gerar Produto</Button>
            </div>
          </form>
        </div>:<div className='flex justify-center items-center h-full flex-col gap-10 px-10'>
          <Image src='/sparkles.gif' alt='Logo' width={100} height={100} />
          <h2 className='text-xl font-semibold text-center'>Aguarde enquanto geramos a descrição do seu produto com IA</h2>
          <div className='h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-2 rounded-full bg-green-500 transition-all duration-500 ease-in-out'
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        </div>}
      </DialogContent>
      <DialogOverlay className='fixed inset-0 bg-gradient-to-t from-green-500/90 to-green-600/50'/>
    </Dialog>
  );
}
