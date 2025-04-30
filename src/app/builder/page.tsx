import { redirect } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export default function Builder() {
  // Redireciona para um novo ID aleatório
  redirect(`/builder/${uuidv4()}`)
}
