import AuthProtection from '@/components/AuthProtection'
import Header from '@/components/Headers/Header'
import ChatsScreen from '@/containers/ChatsScreen'

export default function Home() {
  return (
    <div>
      <AuthProtection>
        <Header />
        <ChatsScreen />
      </AuthProtection>
    </div>
  )
}
