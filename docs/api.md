# API Documentation

## Chats

### GET /api/chat

Retorna todos os chats com suas mensagens.

### POST /api/chat

Cria um novo chat.

Corpo da requisição:

```json
{
  "name": "Nome do Chat",
  "description": "Descrição opcional"
}
```

## Mensagens

### GET /api/chat/message?chatId={chatId}

Retorna todas as mensagens de um chat específico.

### POST /api/chat/message

Cria uma nova mensagem.

Corpo da requisição:

```json
{
  "chatId": "id_do_chat",
  "type": "text",
  "content": {
    "text": "Conteúdo da mensagem"
  }
}
```

### PUT /api/chat/message/{messageId}

Atualiza uma mensagem específica.

Corpo da requisição:

```json
{
  "type": "text",
  "content": {
    "text": "Novo conteúdo"
  }
}
```

### DELETE /api/chat/message/{messageId}

Deleta uma mensagem específica.

## Operações em Lote

### POST /api/chat/message/batch

Cria múltiplas mensagens de uma vez.

Corpo da requisição:

```json
{
  "chatId": "id_do_chat",
  "messages": [
    {
      "type": "text",
      "content": {
        "text": "Primeira mensagem"
      }
    },
    {
      "type": "image",
      "content": {
        "media_name": "imagem.jpg",
        "url": "https://exemplo.com/imagem.jpg"
      }
    }
  ]
}
```

### PUT /api/chat/message/batch

Atualiza múltiplas mensagens de uma vez.

Corpo da requisição:

```json
{
  "chatId": "id_do_chat",
  "messages": [
    {
      "id": "id_mensagem_1",
      "type": "text",
      "content": {
        "text": "Mensagem atualizada 1"
      }
    },
    {
      "id": "id_mensagem_2",
      "type": "text",
      "content": {
        "text": "Mensagem atualizada 2"
      }
    }
  ]
}
```

## Exemplos de Tipos de Mensagens

### Mensagem de Texto

```json
{
  "chatId": "chat_id",
  "type": "text",
  "content": {
    "text": "Olá, mundo!"
  }
}
```

### Mensagem de Questão

```json
{
  "chatId": "chat_id",
  "type": "question",
  "content": {
    "text": "Qual é a sua cor favorita?",
    "options": {
      "type": "text",
      "variable": "cor_favorita"
    }
  }
}
```

### Mensagem de Áudio

```json
{
  "chatId": "chat_id",
  "type": "audio",
  "content": {
    "media_name": "audio.mp3",
    "url": "https://exemplo.com/audio.mp3"
  }
}
```

### Mensagem de Imagem

```json
{
  "chatId": "chat_id",
  "type": "image",
  "content": {
    "media_name": "foto.jpg",
    "url": "https://exemplo.com/foto.jpg"
  }
}
```

## Códigos de Status

- 200: Sucesso
- 400: Erro de validação ou requisição inválida
- 404: Recurso não encontrado
- 500: Erro interno do servidor
