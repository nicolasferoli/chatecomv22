import AuthProtection from '@/components/AuthProtection'
import Header from '@/components/Headers/Header'
import SubscriptionTable from '@/components/SubscriptionTable'
import LayoutSettings from '@/containers/LayoutSettings'

export default async function SettingsPage({}) {
  return (
    <AuthProtection>
      <Header />
      <LayoutSettings>
        <SubscriptionTable />
      </LayoutSettings>
    </AuthProtection>
  )
}
