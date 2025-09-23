import * as React from 'react'
import clsx from 'clsx'

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx('inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px]', className)} {...props} />
}
export default Badge
