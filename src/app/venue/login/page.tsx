import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Venue Login',
}

export default function VenueLoginPage() {
  return <LoginForm />
}
