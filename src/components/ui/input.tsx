import * as React from 'react'
import clsx from 'clsx'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx('flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm outline-none', className)} {...props} />
}
export default Input
