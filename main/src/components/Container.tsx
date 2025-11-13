import clsx from 'clsx'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

interface ContainerProps<T extends ElementType = 'div'> {
  as?: T
  className?: string
  children: ReactNode
}

export function Container<T extends ElementType = 'div'>({
  as,
  className,
  children,
}: ContainerProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ContainerProps<T>>) {
  const Component = as ?? ('div' as ElementType)

  return (
    <Component className={clsx('mx-auto max-w-7xl px-6 lg:px-8', className)}>
      <div className="mx-auto max-w-2xl lg:max-w-none">{children}</div>
    </Component>
  )
}

