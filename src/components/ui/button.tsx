import * as React from 'react'
import clsx from 'clsx'

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx('inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700 focus:outline-none', className)} {...props} />
}
export default Button
