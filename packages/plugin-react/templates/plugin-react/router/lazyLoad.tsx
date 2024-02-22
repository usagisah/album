import React, { ReactNode } from "react"

export function lazyLoad(
  factory: () => Promise<{
    default: any
  }>,
  fallback?: ReactNode
) {
  const Component = React.lazy(factory)
  return (
    <React.Suspense fallback={fallback}>
      <Component />
    </React.Suspense>
  )
}
