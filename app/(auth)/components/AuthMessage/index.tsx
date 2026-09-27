import '@/app/(auth)/components/LoginForm/index.scss'
import Alert, { AlertColor } from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthMessageProps {
  title: string
  severity: AlertColor
  children: ReactNode
  linkHref?: string
  linkLabel?: string
}

/** Simple message screen of the auth module (verify email, invalid links...). */
export default function AuthMessage({
  title,
  severity,
  children,
  linkHref = '/login',
  linkLabel = 'Ir a ingresar'
}: AuthMessageProps) {
  return (
    <div className="auth-form">
      <Typography variant="h5" component="h1" className="title">
        {title}
      </Typography>
      <Alert severity={severity}>{children}</Alert>
      <Typography variant="body2" className="footer">
        <Link href={linkHref} className="text-link">
          {linkLabel}
        </Link>
      </Typography>
    </div>
  )
}
