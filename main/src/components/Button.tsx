import Link from 'next/link'
import clsx from 'clsx'

interface ButtonProps {
  invert?: boolean
  className?: string
  children?: React.ReactNode
  href?: string
  [key: string]: any
}

export function Button({ 
  invert = false, 
  className, 
  children, 
  href,
  ...props 
}: ButtonProps) {
  const combinedClassName = clsx(
    className,
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all cursor-pointer shadow-sm',
    invert
      ? 'bg-white text-neutral-950 hover:bg-neutral-200'
      : 'bg-neutral-950 text-white hover:bg-neutral-800 hover:shadow-md',
    props.disabled && 'opacity-50 cursor-not-allowed'
  )

  const inner = (
    <>
      <span>{children}</span>
      {!props.disabled && <span className="transition-transform group-hover:translate-x-1">→</span>}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={clsx(combinedClassName, 'group')} {...props}>
        {inner}
      </Link>
    )
  }

  return (
    <button className={clsx(combinedClassName, 'group')} {...props}>
      {inner}
    </button>
  )
}
