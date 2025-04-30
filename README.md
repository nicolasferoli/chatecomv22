# ChatEcom V22

Este é um projeto Next.js v15 para uma aplicação de chat e/ou e-commerce, utilizando uma stack moderna de tecnologias.

## ✨ Visão Geral

O ChatEcom V22 integra funcionalidades de chat em tempo real com possíveis recursos de e-commerce, oferecendo uma experiência de usuário rica e interativa. O projeto utiliza autenticação segura, interage com um banco de dados robusto e pode incluir integrações com serviços de IA.

## 🚀 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (v15.0.4) com App Router & Turbopack
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (v3.4.1)
*   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/), [Phosphor Icons](https://phosphoricons.com/), [React Icons](https://react-icons.github.io/react-icons/)
*   **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/)
*   **ORM:** [Prisma](https://www.prisma.io/) (v6.6.0)
*   **Backend/Auth/DB:** [Supabase](https://supabase.io/) (JS Client), [Kinde Auth](https://kinde.com/)
*   **API:** [Axios](https://axios-http.com/), [OpenAI](https://openai.com/)
*   **Utilitários:** `clsx`, `tailwind-merge`, `react-markdown`, `emoji-picker-react`, `wavesurfer.js`, `react-toastify`, `react-beautiful-dnd`, `jsonwebtoken`, `uuid`
*   **Linting/Formatting:** ESLint, Prettier

## 🛠️ Getting Started

Siga estas instruções para configurar e executar o projeto localmente.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
*   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), ou [pnpm](https://pnpm.io/)
*   Acesso a um banco de dados PostgreSQL (para Prisma/Supabase)
*   Contas e chaves de API para:
    *   Supabase
    *   Kinde Auth
    *   OpenAI (se aplicável)

### Configuração

1.  **Clone o repositório:**
    ```bash
    # (Após criar o repo no GitHub)
    git clone https://github.com/nicolasferoli/chatecomv22.git
    cd chatecomv22
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    # yarn install
    # ou
    # pnpm install
    ```

3.  **Variáveis de Ambiente:**
    *   Crie um arquivo `.env.local` na raiz do projeto.
    *   Copie as variáveis de ambiente do exemplo (`.env.example`, se existir) ou configure as seguintes (consulte a documentação de cada serviço para obter os valores corretos):
        ```env
        # Prisma/Database
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

        # Supabase
        NEXT_PUBLIC_SUPABASE_URL="SUA_SUPABASE_URL"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_SUPABASE_ANON_KEY"
        # SUPABASE_SERVICE_ROLE_KEY="SUA_SUPABASE_SERVICE_KEY" (se necessário no backend)

        # Kinde Auth
        KINDE_CLIENT_ID="SEU_KINDE_CLIENT_ID"
        KINDE_CLIENT_SECRET="SEU_KINDE_CLIENT_SECRET"
        KINDE_ISSUER_URL="https://sua-organizacao.kinde.com"
        KINDE_SITE_URL="http://localhost:3000"
        KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
        KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/dashboard" # ou outra rota

        # OpenAI
        OPENAI_API_KEY="SUA_OPENAI_API_KEY" # (se aplicável)

        # Outras variáveis necessárias...
        ```

4.  **Configuração do Banco de Dados (Prisma):**
    *   Certifique-se de que seu banco de dados esteja acessível com a `DATABASE_URL` configurada.
    *   Gere o cliente Prisma:
        ```bash
        npx prisma generate
        ```
    *   Aplique as migrações (ou sincronize o schema):
        ```bash
        npx prisma db push --force-reset
        # OU, se estiver usando migrações: npx prisma migrate deploy
        ```

5.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📜 Scripts Disponíveis

*   `npm run dev`: Inicia o servidor de desenvolvimento com Turbopack.
*   `npm run build`: Gera a build de produção.
*   `npm run start`: Inicia o servidor de produção (após `build`).
*   `npm run lint`: Executa o linter (ESLint).
*   `npm run format`: Formata o código com Prettier.
*   `npm run prisma:push`: Sincroniza o schema Prisma com o banco de dados (usando `.env.local`).

## ☁️ Deploy

O projeto está configurado para fácil deploy na [Vercel](https://vercel.com/). Certifique-se de configurar as variáveis de ambiente necessárias nas configurações do projeto Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.