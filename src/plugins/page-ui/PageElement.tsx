import * as React from 'react'
import { StyledElementProps } from '@udecode/plate-styled-components'
import './page.css'
export const PageElement = ({
  attributes,
  children,
  nodeProps
}: StyledElementProps) => {
  return (
    <div {...attributes} {...nodeProps} className='custom-page'>
      {children}
    </div>
  )
}
