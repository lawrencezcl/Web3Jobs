import * as React from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('rounded-xl border border-slate-800 bg-slate-900', className)} {...props} />
}
export default Card
