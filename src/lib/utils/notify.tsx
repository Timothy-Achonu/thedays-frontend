import { toast } from 'react-toastify'
import type { ToastContent, ToastOptions } from 'react-toastify'
import { NotificationMsg } from '@/components/ui/notification-msg'

interface NotifyProps extends ToastOptions {
  content?: ToastContent
  message?: string
  subtitle?: string
}

export function success({
  content,
  message,
  subtitle,
  ...options
}: NotifyProps) {
  return toast.success(
    content ??
      (() => <NotificationMsg message={message} subtitle={subtitle} />),
    { role: 'status', ...options },
  )
}

export function error({ content, message, subtitle, ...options }: NotifyProps) {
  return toast.error(
    content ??
      (() => (
        <NotificationMsg message={message} subtitle={subtitle} tone="error" />
      )),
    { role: 'alert', ...options },
  )
}

export function warning({
  content,
  message,
  subtitle,
  ...options
}: NotifyProps) {
  return toast.warning(
    content ??
      (() => (
        <NotificationMsg message={message} subtitle={subtitle} tone="warning" />
      )),
    { role: 'status', ...options },
  )
}

export function dismissAll() {
  toast.dismiss()
}
