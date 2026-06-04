import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { UserProvider } from '../context/UserContext'
import Header from '../components/Header'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Header />
      <Component {...pageProps} />
    </UserProvider>
  )
}
