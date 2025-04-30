'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, ChevronDown, Circle, Loader, Loader2, XIcon, BrainCircuit, Target, ListChecks } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Headers/Header'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import LoadingScreen from '@/containers/LoadingScreen'
import { CreateProductButton } from '@/components/CreateProductButton'
import { toast } from 'react-toastify'
import { IoSparkles } from 'react-icons/io5'
import { cn } from "@/lib/utils"
import { WhatsappLogo } from '@phosphor-icons/react'
import { z } from 'zod'

interface StepProps {
  stepNumber: number;
  title: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

const Step = ({ stepNumber, title, isCurrent, isCompleted }: StepProps) => {
  const circleClass = cn(
    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ease-in-out',
    isCompleted
      ? 'border-blue-600 bg-blue-600 text-white'
      : isCurrent
      ? 'border-blue-600 bg-white text-blue-600 scale-110 ring-2 ring-blue-300 ring-offset-2'
      : 'border-gray-300 bg-gray-100 text-gray-400'
  );

  const titleClass = cn(
    'mt-2 text-center text-sm font-medium transition-colors duration-300 ease-in-out',
    isCurrent ? 'text-blue-600' : 'text-gray-500'
  );

  return (
    <div className="flex flex-col items-center">
      <div className={circleClass}>
        {isCompleted ? (
          <Check className="h-5 w-5" />
        ) : (
          stepNumber
        )}
      </div>
      <span className={titleClass}>{title}</span>
    </div>
  );
};

interface StepperProps {
  currentStep: number;
  steps: { title: string }[];
}

const Stepper = ({ currentStep, steps }: StepperProps) => {
  return (
    <div className="my-8 px-4 sm:px-6">
      <div className="relative flex items-start justify-between">
        <div className="absolute left-0 top-[16px] h-0.5 w-full bg-gray-200" />

        <div
          className="absolute left-0 top-[16px] h-0.5 bg-blue-600 transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length -1 )) * 100}%`
          }}
        />

        {steps.map((step, index) => (
          <div key={index} className="z-10 flex flex-1 flex-col items-center bg-white px-1">
            <Step
              stepNumber={index + 1}
              title={step.title}
              isCurrent={currentStep === index + 1}
              isCompleted={currentStep > index + 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const types = [
  {
    value: 'sell',
    title: 'Vender',
    description: '',
    icon: '💰',
  },
]

const automationTemplates = [
  {
    value: 'jeff_ecom',
    title: 'Jeff ECOM - Venda Direta',
    description:
      'Template otimizado para estratégias de vendas direta seguindo uma persuasão de 9 etapas.',
    image: `url('/flows/preview-flow-jeff.png')`,
    type: 'sell',
  },
]

const stepSchema = [
  z.object({
    platform: z.string().min(1, 'Selecione uma plataforma'),
    campaignName: z.string().min(1, 'Digite o nome do chatbot'),
  }),
  z.object({
    productName: z.string().min(1, 'Nome do produto é obrigatório'),
    productDescription: z.string().min(1, 'Descrição é obrigatória'),
    mainBenefit: z.string().min(1, 'Benefício principal é obrigatório'),
    painPoints: z.string().min(1, 'Pontos de dor são obrigatórios'),
    targetAudience: z.string().min(1, 'Público alvo é obrigatório'),
    price: z.string().min(1, 'Preço é obrigatório'),
    priceDescription: z.string().optional(),
    cta: z.string().min(1, 'CTA é obrigatório'),
  }),
  z.object({
    prompt: z.object({
      custom_flow: z.string().optional(),
    }),
  }),
  z.object({}), // Geração
]

// ----> DIRECT SALE PROMPT TEMPLATE <-----
const directSalePromptTemplate = `
Segue exemplo de fluxo de um chatbot, com mensagens de texto, áudio, imagem, inputs e botões:

## **GRUPO 1. Conexão**

**Texto**: Oi. Tudo bem?

**Input**: [Aguardar resposta do cliente]

**Texto**: Vi que você está buscando maneiras de se sentir melhor, com mais energia e disposição no dia a dia, é isso mesmo? 😊

**Input**: [Aguardar resposta do cliente]

**Texto**: Eu sou {{nomeAtendente}}, da {{nomeProduto}}.

[Aguarde 2 segundos]

**Texto**: A gente é especialista em cuidar da saúde de forma natural, e estou aqui para te ajudar!

[Aguarde 3 segundos]

**Texto**: Antes de tudo, me fala qual é o teu nome pra eu salvar aqui! 😊

**[INPUT]** [coletar NOME]

**Texto**: Que bom falar contigo, [NOME]!

[Aguarde 2 segundos]

**Texto**: Me conta, qual é a tua principal preocupação com a saúde no momento? Estou aqui pra te ouvir. 💬

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 2. Conscientização**

**Texto**: Eu entendo exatamente o que você está sentindo...

[Aguarde 2 segundos]

**Texto**: Vou te mandar um áudio rapidinho pra gente conversar melhor, tá?

[Aguarde 2 segundos]

**Áudio**: "Eu sei como é frustrante tentar de tudo para melhorar a saúde e não ver os resultados que a gente espera. Você já tentou algum método pra resolver isso?"

[Aguarde 5 segundos]

**Áudio**: "Me conta um pouquinho, quero saber mais sobre a tua experiência."

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 3. Curiosidade**

**Texto**: Entendi, [NOME]!

[Aguarde 2 segundos]

**Texto**: Parece que a gente tá no caminho certo pra te ajudar...

[Aguarde 2 segundos]

**Texto**: "Muitas pessoas que enfrentam desafios como os seus têm encontrado uma solução prática e natural para transformar a saúde de dentro pra fora…"

[Aguarde 5 segundos]

**Texto**: Você já ouviu falar do programa **{{nomeProduto}}**?

**Input**: [Aguardar resposta do cliente]

**Texto**: Ele é um método que tem mudado a vida de muita gente!

[Aguarde 2 segundos]

**Texto**: O **{{nomeProduto}}** é um programa que pode transformar sua saúde em apenas 21 dias!

[Aguarde 3 segundos]

**Texto**: 🚀 Ele é super prático e foi desenvolvido para lidar exatamente com questões como:

[Aguarde 2 segundos]

**Texto**: [NOME], você se identifica com algum destes problemas? 🤔

**Texto**:

- 🌞 **Pouca Energia**: Tá difícil acordar com disposição e vontade de viver o dia a dia?
- 😩 **Estresse Constante**: Parece que a carga emocional tá sempre pesada?
- 🛌 **Dificuldade para Dormir**: Acorda mais cansado(a) do que foi dormir?
- 🌿 **Sensação de Inchaço**: Aquela sensação de corpo pesado que não vai embora?
- 🧠 **Problemas de Concentração**: Não consegue focar nas tarefas e se distrai fácil?
- 💪 **Imunidade Baixa**: Sempre pegando alguma coisa e querendo se sentir mais forte?
- 🧘 **Desequilíbrio Emocional**: Emocional fora de controle e precisando de equilíbrio?
- ⚖️ **Metabolismo Lento**: Dificuldade em perder peso, mesmo com dieta e exercício?
- 🍽️ **Problemas Digestivos**: Digestão lenta, desconforto e inchaço abdominal?

**Texto**: "Qual desses mais te incomoda, [NOME]?"

**Input**: [Aguardar resposta do cliente]

**Texto**: O **{{nomeProduto}}** foi feito especialmente pra ajudar em todos esses problemas.

[Aguarde 2 segundos]

**Texto**: Posso te explicar rapidinho como funciona? 😊

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 4. Mecanismo**

**Texto**: O {{nomeProduto}} é único porque ele utiliza o **Mecanismo Exclusivo de Reequilíbrio Natural™**, que é como uma jardinagem para o seu corpo. 🌿

[Aguarde 3 segundos]

**Texto**: "A gente ajuda a limpar o que não tá bom (toxinas e estresse) e nutrir o que precisa (corpo e mente), de forma simples e natural. Nada de truques mágicos ou soluções temporárias, aqui a gente foca nas causas reais pra resultados duradouros."

[Aguarde 3 segundos]

**Texto**: E o melhor, [NOME], é que você vai ver as mudanças acontecendo dia após dia...

[Aguarde 2 segundos]

**Texto**: Posso continuar e te contar um pouquinho mais?

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 5. Benefícios**

**Texto**: "Dá uma olhada nesses benefícios incríveis que você pode conquistar com o {{nomeProduto}}…"

[Aguarde 3 segundos]

**Texto**: Com o {{nomeProduto}}, você pode esperar:

1. ✨ **Mais energia** para aproveitar o dia a dia com disposição.
2. 😴 **Sono profundo** e acordar renovado(a) todos os dias.
3. 🌱 **Desintoxicação natural** para um corpo mais leve e saudável.
4. 🧘 **Redução de estresse** e ansiedade.
5. 🧠 **Foco e concentração** para ser mais produtivo(a).
6. 💪 **Sistema imunológico fortalecido** para evitar doenças.
7. 🔥 **Perda de peso saudável** sem dietas restritivas.
8. ⚡ **Metabolismo acelerado** para queima de gordura eficiente.
9. 🍽️ **Melhora na digestão** e redução de desconfortos gastrointestinais.

**Texto**: E o mais impressionante: tudo isso em apenas 21 dias!

[Aguarde 3 segundos]

**Texto**: Posso te mostrar alguns resultados de pessoas que seguiram o programa por 21 dias?

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 6. Prova Social**

**Texto**: Olha o que o pessal tá falando sobre o {{nomeProduto}}:

- "Em menos de uma semana, já senti uma diferença enorme na minha energia e disposição." – Camila, São Paulo 🌟

[Aguarde 3 segundos]

**Texto**: Outro depoimento:

- "Depois de anos tentando resolver meus problemas de saúde, finalmente encontrei algo que realmente funciona." – Ana, Belo Horizonte 💪

[Aguarde 3 segundos]

**Texto**: E mais um:

- "Estava sempre estressado e sem energia, mas agora me sinto renovado e equilibrado." – Lucas, Curitiba 🧘‍♂️

[Aguarde 3 segundos]

**Texto**: Olha só esse relato:

- "Olha só o depoimento da Fernanda, de Porto Alegre: 'Minha imunidade melhorou muito e não fiquei mais doente como antes. Recomendo pra todo mundo!' 💚"

[Aguarde 3 segundos]

**Texto**: E para finalizar:

- "Em 21 dias, meu corpo e mente estão mais equilibrados. O suporte e a comunidade fizeram toda a diferença!" – Beatriz, Salvador 🌿

[Aguarde 3 segundos]

**Texto**: E o melhor de tudo vem agora, posso continuar [NOME]? Tu não vai acreditar…

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 7. Oportunidade**

**Texto**: Agora, você deve estar se perguntando quanto custa uma transformação dessas…

[Aguarde 3 segundos]

**Texto**: Um programa como o {{nomeProduto}} poderia facilmente ser vendido por **R$ 197** ou mais!

[Aguarde 3 segundos]

**Texto**: Mas queremos tornar isso acessível para o máximo de pessoas possível…

[Aguarde 3 segundos]

**Texto**: Por tempo limitado, você pode começar sua transformação por **apenas {{valorProduto}}**! 😲

[Aguarde 3 segundos]

**Texto**: Fechando hoje, além do desconto, você ainda leva **os 5 bônus exclusivos**:

1. **E-book "30 Receitas Detox para um Corpo Saudável"** 🥗
2. **Guia "Mindfulness para o Dia a Dia"** 🧘‍♀️
3. **Desafio de 7 Dias de Alongamento e Relaxamento** 🧎‍♂️
4. **Workshop Online "Como Acelerar seu Metabolismo"** 🚀
5. **Acesso VIP ao Suporte Personalizado** 💬

[Aguarde 3 segundos]

**Texto**: E tem mais: você tem **7 dias de garantia incondicional por LEI DO CONSUMIDOR.**

[Aguarde 3 segundos]

**Texto**: Se não estiver satisfeito(a), devolvemos 100% do seu dinheiro. Sem complicação! 😊

[Aguarde 3 segundos]

**Texto**: A notícia ruim é que eu consigo manter esse preço promocional somente até hoje.

[Aguarde 3 segundos]

**Texto**: O que você acha, [NOME]?

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 8. Riscos e Perdas**

**Texto**: Eu entendo que decidir pode ser difícil para algumas pessoas…

[Aguarde 3 segundos]

**Texto**: Mas continuar insistindo em métodos que não funcionam pode ser ainda mais desgastante, né? 😔

[Aguarde 3 segundos]

**Texto**: Ao escolher o {{nomeProduto}}, você evita:

1. ⌛ **Perder tempo** com soluções que não trazem resultados.

2. 💸 **Gastar mais dinheiro** em tratamentos caros e ineficazes.

3. 🚑 **Deixar problemas de saúde piorarem** sem uma solução eficaz.

4. 😖 **Frustração constante** de tentar e não ver resultados.

5. 🕰️ **Perder a oportunidade** de viver de forma plena e saudável agora.

6. 🤯 **Ficar sobrecarregado(a)** com métodos complicados e difíceis de seguir.

7. 😔 **Desanimar** ao sentir que está sempre no mesmo lugar, sem evolução.

8. 🌧️ **Sofrer com falta de suporte** e orientação para alcançar seus objetivos.

9. 🧩 **Sentir que falta algo** para realmente transformar sua saúde e bem-estar.

[Aguarde 5 segundos]

**Texto**: Você gostaria de aproveitar a oferta exclusiva ({{valorProduto}}) para fazer parte do {{nomeProduto}}?

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 9. Fechamento da Venda**

**Texto**: [NOME], essa é a sua oportunidade!!!

[Aguarde 3 segundos]

**Texto**: Clique no link pra garantir seu acesso por apenas **{{valorProduto}}**.

[Aguarde 2 segundos]

**Texto**: Vai ser incrível ter você com a gente! 🤗

[Aguarde 2 segundos]

**Texto**: Se tiver qualquer dúvida ou precisar de algo, me avisa.

[Aguarde 2 segundos]

**Texto**: E eu tenho uma surpresa pra ti, [NOME]…

[Aguarde 2 segundos]

**Texto**: Assim que finalizar o pagamento, vou liberar um bônus extra que foi autorizado para você por ter ficado comigo até agora...

**Link**: [Link para página de pagamento]

---

Abaixo foi coletado informações de um novo produto ou infoproduto.

Nome do Produto: {{nomeProduto}}
Descrição do Produto: {{descricaoProduto}}
Nome da Atendente: {{nomeAtendente}}
Valor do Produto: {{valorProduto}} reais

Baseado nas informações que lhe passei, crie um fluxo com a mesma estrutura de copy do exemplo.

Caso tenha [Áudio] crie a copy do áudio logo em seguida. Não coloque INPUT nos áudios. Crie nomes fictícios nas provas sociais. Coloque um tempo de espera entre as mensagens, como exemplo [Esperar 1 segundo]. Responda no idioma português do Brasil. Evite comentários!
`;
// <----------------------------------------------->

// ----> DEFINE LEAD CAPTURE PROMPT TEMPLATE <-----
const leadCapturePromptTemplate = `
Segue exemplo de fluxo de um chatbot:

## **GRUPO 1. Atração e Início da Conversa**

**Texto**: Olá! Que bom ter você aqui 🎉.

[Aguarde 2 segundos]

**Texto**: Eu sou {{nomeAtendente}}, e estou aqui para te ajudar com [problema que o lead possivelmente enfrenta baseado no produto].

[Aguarde 4 segundos]

**Texto**: Podemos conversar sobre isso agora, e no final, tenho algo especial para você! 😉

[Aguarde 3 segundos]

**Texto**: Antes da gente continuar, como posso te chamar? 😊

**Input**: [coletar NOME]

**Texto**: Me diz, qual dessas áreas é seu maior desafio no momento?
A) Problema 1
B) Problema 2
C) Problema 3

**Input**: [coletar DESAFIO]

---

## **GRUPO 2. Construção de Rapidez e Confiança**

**Texto**: Entendi! Isso é super comum! Muitas pessoas com quem conversamos têm enfrentado o mesmo desafio.

[Aguarde 3 segundos]

**Texto**: Recentemente, ajudamos [citar um exemplo ou cliente fictício] a resolver exatamente isso.

[Aguarde 3 segundos]

**Texto**: Eles conseguiram [solução ou resultado alcançado]. Posso te contar como fizemos isso? 🔍

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 3. Entendimento das Barreiras do Lead**

**Texto**: Às vezes, as pessoas pensam que essa solução pode ser cara ou demorada de implementar.

[Aguarde 3 segundos]

**Texto**: Você sente que isso pode ser um obstáculo para você? 🤔

**Input**: [Aguardar resposta do cliente]

**Texto**: Eu entendo! Isso é uma dúvida bem comum e faz total sentido. O que muitos dos nossos clientes descobriram é que, independentemente de parecer caro ou demorado no início, o retorno é muito maior do que o investimento, tanto em termos de tempo quanto de dinheiro. 😊

[Aguarde 8 segundos]

**Texto**: Na verdade, temos casos em que conseguimos implementar a solução em um curto período e, o melhor, com resultados rápidos e mensuráveis. Você se surpreenderia ao ver como esse processo pode ser simples e eficiente!

[Aguarde 7 segundos]

**Texto**: Gostaria que eu te mostrasse como isso funciona para [DESAFIO]? Acho que você vai gostar de ver os detalhes. 😉

**Input**: [Aguardar resposta do cliente]

---

## **GRUPO 4. Entrega de Valor**

**Texto**: Baseado no que você mencionou, acredito que você vai se beneficiar muito do nosso [material específico]. Ele te mostra passo a passo como [solução específica para o problema]. 😊

[Aguarde 7 segundos]

**Texto**: Posso te enviar isso diretamente agora. Só preciso de seu e-mail para que eu possa garantir que você receba direitinho. Pode ser?

[Aguarde 6 segundos]

**Texto**: Perfeito, por favor, me passe seu e-mail e eu envio imediatamente!

**Input**: [coletar EMAIL]

**Texto**: Ah, posso te mandar por WhatsApp também. Qual é o seu número?

**Input**: [coletar WHATSAPP]

---

## **GRUPO 5. Confirmação**

**Texto**: Obrigado, [NOME]! 🎉 Aqui está o link para o seu [material prometido]. Tenho certeza de que vai te ajudar muito!

[Aguarde 4 segundos]

**Texto**: Vou continuar compartilhando dicas e conteúdos que podem te ajudar a resolver [DESAFIO]. Então, fique de olho no seu e-mail/WhatsApp!

[Aguarde 6 segundos]

**Texto**: Se precisar de algo, é só me chamar por aqui. 😊 Até logo!

---

Abaixo foi coletado informações de um novo produto ou infoproduto.

Nome do Produto: {{nomeProduto}}
Descrição do Produto: {{descricaoProduto}}
Nome da Atendente: {{nomeAtendente}}

Baseado nas informações que lhe passei, crie um fluxo de captura de lead com a mesma estrutura de copy do exemplo.

Crie nomes fictícios nas provas sociais. Coloque um tempo de espera entre as mensagens, como exemplo [Esperar 1 segundo]. Responda no idioma português do Brasil. Evite comentários!
`;
// <----------------------------------------------->

export default function New() {
  const [currentStep, setCurrentStep] = useState(1)
  const [aiLoading, setAiLoading] = useState(false)
  const [productLoading, setProductLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const useAiParam = searchParams.get('useAi')
  const useAi = useAiParam === 'true'

  const [selectedValueSelect1, setSelectedValueSelect1] = useState('whatsapp')
  const [currentDescription, setCurrentDescription] = useState('')
  const [currentEmoji, setCurrentEmoji] = useState('')
  
  const [productType, setProductType] = useState('')
  const [targetGender, setTargetGender] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [market, setMarket] = useState('')
  const [productProgress, setProductProgress] = useState(0)
  
  const [data, setData] = useState({
    name: '',
    type: 'ecommerce',
    prompt: {
      product_info: '',
      custom_flow: '',
    },
    platform: 'whatsapp',
    url: '',
    id: '',
  })
  const { user } = useKindeAuth()
  const descriptions = [
    {
      emoji: '📝',
      description: 'Escrevendo copy...',
    },
    {
      emoji: '💬',
      description: 'Criando mensagens...',
    },
    {
      emoji: '⏳',
      description: 'Configurando delays...',
    },
    {
      emoji: '🎙️',
      description: 'Gravando áudios...',
    },
    {
      emoji: '😎',
      description: 'Seu chatbot está quase pronto...',
    },
  ]

  const [totalSteps, setTotalSteps] = useState(useAi ? 4 : 1)
  const [selectedTemplateType, setSelectedTemplateType] = useState('')

  const handleChangeSelect1 = (value: string) => {
    setSelectedValueSelect1(value)
    setData({ ...data, platform: value })
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) setCurrentStep(step)
  }

  const goToChatPage = (chatId: string) => {
    router.push(`/builder/${chatId}`)
  }

  const handleCreateChat = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(500000),
      })
      if (!response.ok) {
        throw new Error('Erro ao criar chat')
      }

      const result = await response.json()
      goToChatPage(result.id)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleCreateChatWithAi = async () => {
    console.log("[handleCreateChatWithAi] - Iniciando função.");
    try {
      setAiLoading(true)
      console.log("[handleCreateChatWithAi] - setAiLoading(true) chamado.");
      setCurrentEmoji(descriptions[0].emoji)
      setCurrentDescription(descriptions[0].description)

      let finalCustomFlow: string | undefined = undefined;
      console.log("[handleCreateChatWithAi] - Processando template selecionado: ", selectedTemplateType);

      if (selectedTemplateType === 'direct_sale') {
        finalCustomFlow = directSalePromptTemplate
          .replace(/{{nomeProduto}}/g, data.name || 'nosso produto')
          .replace(/{{descricaoProduto}}/g, data.prompt.product_info || 'descrição detalhada do produto')
          .replace(/{{nomeAtendente}}/g, 'nosso especialista')
          .replace(/{{valorProduto}}/g, 'o valor promocional');
      } else if (selectedTemplateType === 'lead_capture') {
        finalCustomFlow = leadCapturePromptTemplate
          .replace(/{{nomeProduto}}/g, data.name || 'nosso produto')
          .replace(/{{descricaoProduto}}/g, data.prompt.product_info || 'descrição detalhada do produto')
          .replace(/{{nomeAtendente}}/g, 'nosso especialista');
      }

      console.log("[handleCreateChatWithAi] - Template processado.");

      const payload = {
        user_id: user?.id,
        name: data.name,
        type: 'ecommerce',
        template_type: selectedTemplateType,
        prompt: {
          product_info: data.prompt.product_info,
          custom_flow: finalCustomFlow,
        },
        platform: data.platform,
      }

      console.log("[handleCreateChatWithAi] - Payload construído: ", payload);

      if (!selectedTemplateType) {
        console.error("[handleCreateChatWithAi] - Erro: Tipo de template não selecionado.");
        toast.error('Por favor, selecione um tipo de template.');
        setAiLoading(false);
        return;
      }

      const requestBody = JSON.stringify(payload)
      console.log("[handleCreateChatWithAi] - Corpo da requisição pronto: ", requestBody);
      
      console.log("[handleCreateChatWithAi] - >>> PRESTES A FAZER FETCH para /api/chat/create-with-ai <<<<");
      const response = await fetch('/api/chat/create-with-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      })
      console.log("[handleCreateChatWithAi] - Fetch concluído, status: ", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Erro ao criar chatbot com IA';
        console.error("[handleCreateChatWithAi] - Erro na resposta do fetch: ", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("[handleCreateChatWithAi] - Resposta da API recebida: ", result);

      if (result.id) {
        toast.success('Chatbot criado com sucesso!');
        goToChatPage(result.id);
      } else {
        console.error("[handleCreateChatWithAi] - Erro: ID não encontrado na resposta.");
        throw new Error('ID do chatbot não foi retornado pela API');
      }
    } catch (error) {
      console.error('[handleCreateChatWithAi] - Erro no bloco catch:', error);
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido ao criar chatbot com IA')
    } finally {
      console.log("[handleCreateChatWithAi] - Bloco finally executado.");
      setAiLoading(false)
    }
  }

  const handleGenerateProduct = async () => {
    try {
      setProductLoading(true)
      setProductProgress(0)
      
      const intervalTime = (40 * 1000) / 100
      const interval = setInterval(() => {
        setProductProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 1
        })
      }, intervalTime)
      
      const response = await fetch('/api/ai/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `
            Gere uma descrição detalhada e persuasiva de um produto com as seguintes características:
            
            Tipo de produto: ${productType}
            Gênero do público alvo: ${targetGender}
            Faixa etária do público alvo: ${ageRange}
            Mercado de atuação: ${market}
            
            A descrição deve incluir:
            - Nome atrativo para o produto
            - Principais benefícios e diferenciais
            - Problemas que resolve para o cliente
            - Características técnicas relevantes
            - Linguagem adequada ao público-alvo
            
            Formate a resposta de forma clara e organizada, usando parágrafos.
          `
        })
      })
      
      clearInterval(interval)
      setProductProgress(100)
      
      if (!response.ok) {
        throw new Error('Erro ao gerar o produto com IA')
      }
      
      const result = await response.json()
      
      if (!result.result) {
        throw new Error('Resposta da IA inválida')
      }
      
      const sanitizedProductInfo = result.result.replace(/\[.*?\]/g, '').trim();
      console.log('Sanitized Product Info:', sanitizedProductInfo);

      setData({
        ...data,
        prompt: {
          ...data.prompt,
          product_info: sanitizedProductInfo,
        },
      })
      
      toast.success("Produto gerado com sucesso!");
      handleNext();
    } catch (error) {
      console.error('Error generating product:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar o produto. Por favor, tente novamente.')
    } finally {
      setProductLoading(false)
      setProductProgress(0)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted on step:", currentStep)
    console.log(`[handleSubmit] Verificando condição: currentStep === ${currentStep}, useAi === ${useAi}`);

    if (currentStep === 3 && useAi) {
      console.log("[handleSubmit] Condição atendida. Chamando handleCreateChatWithAi...");
      handleCreateChatWithAi()
    } else if (currentStep === 1 && !useAi) {
      console.log("[handleSubmit] Condição atendida. Chamando handleCreateChat...");
      handleCreateChat()
    } else {
      console.log("[handleSubmit] Nenhuma ação de submit definida para este passo/condição. Chamando handleNext().");
      handleNext()
    }
  }

  useEffect(() => {
    if (!aiLoading) return
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % descriptions.length;
      setCurrentEmoji(descriptions[index].emoji);
      setCurrentDescription(descriptions[index].description);
    }, 12000);

    return () => clearInterval(interval);
  }, [aiLoading]);

  const stepDefinitions = useAi
    ? [{ title: 'Informações' }, { title: 'Produto' }, { title: 'Template' }, { title: 'Geração' }]
    : [{ title: 'Informações' }]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Funções wrapper para logar mudanças nos Selects do Passo 2
  const handleProductTypeChange = (value: string) => {
    console.log("DEBUG - productType changed to:", value);
    setProductType(value);
  };
  const handleTargetGenderChange = (value: string) => {
    console.log("DEBUG - targetGender changed to:", value);
    setTargetGender(value);
  };
  const handleAgeRangeChange = (value: string) => {
    console.log("DEBUG - ageRange changed to:", value);
    setAgeRange(value);
  };
  const handleMarketChange = (value: string) => {
    console.log("DEBUG - market changed to:", value);
    setMarket(value);
  };

  // Log geral (manter por enquanto)
  console.log("DEBUG - Renderizou com Estados Step 2:", { productType, targetGender, ageRange, market });

  if (aiLoading) {
    return (
      <>
        <Header />
        <LoadingScreen
          emoji={currentEmoji || descriptions[0].emoji}
          text={currentDescription || descriptions[0].description}
          description={'Isso pode levar alguns minutos'}
        />
      </>
    )
  }

  return (
    <>
      <Header />
      <Card className='relative mx-auto mt-[50px] flex w-full max-w-[890px] flex-col gap-4 p-[24px] shadow-sm border-gray-100'>
        <Button
          variant={'outline'}
          className='absolute right-6 top-6 h-[40px] w-[40px] rounded-full'
          onClick={() => {
            router.push('/')
          }}
        >
          <XIcon />
        </Button>
        
        <CardHeader className='px-0 pt-0'>
          <CardTitle className="text-xl font-semibold">Nova conversa</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Configure seu novo chatbot em {useAi ? 'quatro' : 'um'} passo{useAi ? 's' : ''}
          </CardDescription>
        </CardHeader>
        
        <Stepper currentStep={currentStep} steps={stepDefinitions} />
        
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <CardContent className="space-y-6 px-6">
                <div className="space-y-2">
                  <Label htmlFor="platform-selection">Selecione a plataforma</Label>
                  <div id="platform-selection" className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
                    <Card
                      onClick={() => handleChangeSelect1('whatsapp')}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 border-2 p-3 transition-all hover:border-blue-400',
                        selectedValueSelect1 === 'whatsapp' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      )}
                    >
                      {typeof WhatsappLogo !== 'undefined' ? <WhatsappLogo size={24} color="#25D366" weight="light" /> : <span className="h-6 w-6">W</span>}
                      <span className="font-medium text-gray-800">WhatsApp</span>
                    </Card>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor='automationName'>Nome do chatbot</Label>
                  <Input
                    className='flex h-[45px] mt-1 placeholder:text-sm focus-visible:ring-offset-0 focus-visible:ring-blue-500'
                    id='automationName'
                    name='automationName'
                    type='text'
                    placeholder='Digite o nome do seu chatbot'
                    required
                    value={data.name}
                    onChange={(e) =>
                      setData((prevData) => ({
                        ...prevData,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="mt-4 flex justify-end border-t px-6 py-4">
                {useAi ? (
                  <Button type='button' onClick={handleNext} className="bg-[#0C88EE] hover:bg-[#0C88EE]/90" disabled={!selectedValueSelect1 || !data.name}>Próximo</Button>
                ) : (
                  <Button type='submit' className="bg-[#0C88EE] hover:bg-[#0C88EE]/90" disabled={!selectedValueSelect1 || !data.name}>Criar</Button>
                )}
              </CardFooter>
            </div>
          )}

          {currentStep === 2 && useAi && (
            <div className="animate-fadeIn">
              <CardContent className="space-y-6 px-6">
                <div>
                  <h2 className='text-base font-semibold text-gray-800'>Informações do produto</h2>
                  <p className='mt-1 text-sm text-gray-500'>
                    Preencha os campos para gerar a descrição do seu produto com IA.
                  </p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2'>
                  <div className="space-y-1.5">
                    <Label>Tipo de produto</Label>
                    <Select value={productType} onValueChange={handleProductTypeChange}>
                      <SelectTrigger className='h-[45px] border-gray-300 focus:ring-blue-500 focus:border-blue-500'>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Curso Online'>Curso Online</SelectItem>
                        <SelectItem value='E-Book'>E-Book</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gênero do público alvo</Label>
                    <Select value={targetGender} onValueChange={handleTargetGenderChange}>
                      <SelectTrigger className='h-[45px] border-gray-300 focus:ring-blue-500 focus:border-blue-500'>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Masculino'>Masculino</SelectItem>
                        <SelectItem value='Feminino'>Feminino</SelectItem>
                        <SelectItem value='Unissex'>Unissex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Faixa etária</Label>
                    <Select value={ageRange} onValueChange={handleAgeRangeChange}>
                      <SelectTrigger className='h-[45px] border-gray-300 focus:ring-blue-500 focus:border-blue-500'>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Crianças (0-12 anos)'>Crianças (0-12 anos)</SelectItem>
                        <SelectItem value='Adolescentes (13-17 anos)'>Adolescentes (13-17 anos)</SelectItem>
                        <SelectItem value='Adultos (18+ anos)'>Adultos (18+ anos)</SelectItem>
                        <SelectItem value='Idosos (65+ anos)'>Idosos (65+ anos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mercado de atuação</Label>
                    <Select value={market} onValueChange={handleMarketChange}>
                      <SelectTrigger className='h-[45px] border-gray-300 focus:ring-blue-500 focus:border-blue-500'>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Desenvolvimento Pessoal'>Desenvolvimento Pessoal</SelectItem>
                        <SelectItem value='Finanças Pessoais'>Finanças Pessoais</SelectItem>
                        <SelectItem value='Emagrecimento e Fitness'>Emagrecimento e Fitness</SelectItem>
                        <SelectItem value='Marketing Digital'>Marketing Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-4 flex justify-between border-t px-6 py-4">
                <Button
                  type='button'
                  variant="outline"
                  onClick={handlePrev}
                >
                  Voltar
                </Button>
                <Button
                  type='button'
                  onClick={handleGenerateProduct}
                  className='bg-[#0C88EE] hover:bg-[#0C88EE]/90'
                  disabled={productLoading || !productType || !targetGender || !ageRange || !market}
                >
                  {productLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IoSparkles className="mr-2 h-4 w-4" />}
                  {productLoading ? 'Gerando...' : 'Gerar Produto'}
                </Button>
              </CardFooter>
            </div>
          )}
          
          {currentStep === 3 && useAi && (
            <div className="animate-fadeIn">
              <CardContent className="space-y-6 px-6">
                <div className="space-y-1.5">
                  <Label htmlFor="product-info-area">Produto gerado</Label>
                  <p className='text-sm text-gray-500'>
                    Confira e edite a descrição do produto gerado pela IA.
                  </p>
                  <div className='mt-2 rounded-lg border border-gray-200 p-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'>
                    <Textarea
                      id="product-info-area"
                      className='min-h-[150px] w-full resize-y border-0 bg-transparent p-3 focus-visible:ring-0 focus-visible:ring-offset-0'
                      value={data.prompt.product_info}
                      onChange={(e) => setData({ ...data, prompt: { ...data.prompt, product_info: e.target.value } }) }
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                   <Label className="text-base font-medium">Selecione o tipo de template</Label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card
                         onClick={() => setSelectedTemplateType('direct_sale')}
                         className={cn(
                           'group cursor-pointer rounded-lg border-2 p-5 transition-all hover:shadow-lg hover:border-blue-400',
                           selectedTemplateType === 'direct_sale'
                             ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-300 ring-offset-2'
                             : 'border-gray-200 bg-white hover:bg-gray-50'
                         )}
                      >
                         <div className="flex items-start gap-4">
                           <div className="mt-1"><Target className="h-6 w-6 text-blue-600 transition-transform group-hover:scale-110" /></div>
                           <div>
                             <CardHeader className="p-0"><CardTitle className="text-lg font-semibold">Venda Direta</CardTitle></CardHeader>
                             <CardDescription className="mt-1.5 text-sm text-gray-600">Foco em converter o lead em cliente o mais rápido possível.</CardDescription>
                           </div>
                         </div>
                      </Card>
                      <Card
                         onClick={() => setSelectedTemplateType('lead_capture')}
                         className={cn(
                           'group cursor-pointer rounded-lg border-2 p-5 transition-all hover:shadow-lg hover:border-blue-400',
                           selectedTemplateType === 'lead_capture'
                             ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-300 ring-offset-2'
                             : 'border-gray-200 bg-white hover:bg-gray-50'
                         )}
                      >
                         <div className="flex items-start gap-4">
                           <div className="mt-1"><ListChecks className="h-6 w-6 text-green-600 transition-transform group-hover:scale-110" /></div>
                           <div>
                             <CardHeader className="p-0"><CardTitle className="text-lg font-semibold">Captura de Leads</CardTitle></CardHeader>
                             <CardDescription className="mt-1.5 text-sm text-gray-600">Foco em coletar informações do lead para nutrição posterior.</CardDescription>
                           </div>
                         </div>
                      </Card>
                   </div>
                 </div>
              </CardContent>
              <CardFooter className="mt-4 flex justify-between border-t px-6 py-4">
                <Button
                  type='button'
                  variant="outline"
                  onClick={handlePrev}
                >
                  Voltar
                </Button>
                <Button
                  type='submit'
                  className='bg-[#0C88EE] hover:bg-[#0C88EE]/90'
                  disabled={!data.prompt.product_info || !selectedTemplateType || aiLoading}
                >
                  {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Gerar Chatbot
                </Button>
              </CardFooter>
            </div>
          )}
          
          {currentStep === 4 && useAi && (
            <div className="animate-fadeIn p-6 text-center">
              <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <p className="text-lg text-gray-600 mt-4">Gerando seu chatbot...</p>
                <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns instantes.</p>
              </CardContent>
            </div>
          )}
        </form>
      </Card>
      
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
