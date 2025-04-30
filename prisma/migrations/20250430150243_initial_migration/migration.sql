-- CreateEnum
CREATE TYPE "MessageTypeEnum" AS ENUM ('text', 'image', 'audio', 'embed', 'buttons', 'section', 'question', 'redirect');

-- CreateEnum
CREATE TYPE "MessageFromEnum" AS ENUM ('user', 'bot');

-- CreateEnum
CREATE TYPE "QuestionsType" AS ENUM ('text', 'email', 'cpf', 'whatsapp', 'number');

-- CreateEnum
CREATE TYPE "ChatAction" AS ENUM ('viewed', 'answered_question', 'flux_completed', 'clicked_button', 'clicked_link');

-- CreateEnum
CREATE TYPE "DefaultPlans" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "SubEventType" AS ENUM ('sub_confirmed', 'sub_cancelled');

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bot_name" TEXT NOT NULL,
    "bot_picture" TEXT,
    "description" TEXT,
    "theme" TEXT,
    "prompt" JSONB,
    "template" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domain" JSONB,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "favicon_url" TEXT,
    "share_image" TEXT,
    "facebook_id" TEXT,
    "google_tag" TEXT,
    "tiktok_ads" TEXT,
    "status" TEXT,
    "verified" BOOLEAN,
    "hasNotifySound" BOOLEAN DEFAULT false,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "type" "MessageTypeEnum" NOT NULL,
    "content" JSONB NOT NULL,
    "from" "MessageFromEnum" NOT NULL DEFAULT 'bot',
    "chatId" TEXT NOT NULL,
    "variableId" TEXT,
    "hasDynamicDelay" BOOLEAN NOT NULL DEFAULT true,
    "delayValue" INTEGER NOT NULL DEFAULT 1000,
    "position" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_action_logs" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" "ChatAction" NOT NULL,
    "question_type" "QuestionsType",
    "question_variable" TEXT,
    "question_answer" TEXT,
    "question_text" TEXT,
    "button_question" TEXT,
    "button_answer" TEXT,
    "clicked_link_url" TEXT,
    "flux_completed_value" BOOLEAN,

    CONSTRAINT "chat_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "imported_default_plan" "DefaultPlans",
    "kinde_id" TEXT NOT NULL,
    "stripe_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionEvents" (
    "id" TEXT NOT NULL,
    "kinde_id" TEXT NOT NULL,
    "event_type" "SubEventType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT,
    "gateway" TEXT,
    "plan" TEXT,
    "payment_value" DOUBLE PRECISION,

    CONSTRAINT "SubscriptionEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_variableId_key" ON "messages"("variableId");

-- CreateIndex
CREATE INDEX "messages_chat_position_idx" ON "messages"("chatId", "position");

-- CreateIndex
CREATE INDEX "variables_chatId_idx" ON "variables"("chatId");

-- CreateIndex
CREATE INDEX "variables_runId_idx" ON "variables"("runId");

-- CreateIndex
CREATE INDEX "profiles_email_idx" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "profiles_stripe_id_idx" ON "profiles"("stripe_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_kinde_id_key" ON "profiles"("kinde_id");

-- CreateIndex
CREATE INDEX "SubscriptionEvents_kinde_id_idx" ON "SubscriptionEvents"("kinde_id");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "variables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variables" ADD CONSTRAINT "variables_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_action_logs" ADD CONSTRAINT "chat_action_logs_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
