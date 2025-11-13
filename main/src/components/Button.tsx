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
    'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition cursor-pointer',
    invert
      ? 'bg-white text-neutral-950 hover:bg-neutral-200'
      : 'bg-neutral-950 text-white hover:bg-neutral-800',
  )

  const inner = <span className="relative top-px">{children}</span>

  if (href) {
    return (
      <Link href={href} className={combinedClassName} {...props}>
        {inner}
      </Link>
    )
  }

  return (
    <button className={combinedClassName} {...props}>
      {inner}
    </button>
  )
}
