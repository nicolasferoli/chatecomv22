import AuthProtection from '@/components/AuthProtection'
import Header from '@/components/Headers/Header'
import SettingsScreen from '@/containers/SettingsScreen'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const chatId = resolvedParams.id

  return (
    <>
      <AuthProtection>
        <Header />
        <SettingsScreen chatId={chatId} />
      </AuthProtection>
    </>
  )
}
