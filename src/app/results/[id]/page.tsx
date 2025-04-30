import Protected from '@/components/AuthProtection'
import Header from '@/components/Headers/Header'
import ResultsScreen from '@/containers/ResultsScreen'

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const chatId = resolvedParams.id

  return (
    <>
      <Protected>
        <Header />
        <ResultsScreen chatId={chatId} />
      </Protected>
    </>
  )
}
