import { Layout as AntLayout } from 'antd'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header />
      <AntLayout.Content style={{ padding: 24 }}>{children}</AntLayout.Content>
      <Footer />
    </AntLayout>
  )
}
