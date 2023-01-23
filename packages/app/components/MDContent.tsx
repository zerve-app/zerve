import { ReactNode } from 'react'

export function MDContent({ children }: { children: ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.ZMdContent {
    display:flex;
    flex-grow:1;
    align-self: stretch;
    font-size: 20px;
    flex-direction: column;
}
.ZMdContent ul, li {
    display: flex;
    flex-direction: column;
}
      `,
        }}
      />
      <div className="ZMdContent">{children}</div>
    </>
  )
}
