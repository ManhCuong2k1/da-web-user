import 'antd/dist/reset.css'
import '../styles/globals.css'
import ThemeProvider from '../components/ThemeProvider'
import { Provider } from 'react-redux';
import store from '../store';
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const isLogin = router.pathname === '/login' || router.pathname === '/register'

  return (
    <Provider store={store}>
      <ThemeProvider>
        {isLogin ? <Component {...pageProps} /> : <Layout><Component {...pageProps} /></Layout>}
      </ThemeProvider>
    </Provider>
  )
}
