import { useMemo } from 'react'
import {
  withPlaceholders,
  createPlateComponents,
  withProps,
  // CodeBlockElement,
  TableElement,
  StyledElement,
  TodoListElement,
  StyledLeaf,
  // ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TABLE,
  ELEMENT_TODO_LI,
  ELEMENT_PARAGRAPH,
  ELEMENT_ALIGN_RIGHT,
  ELEMENT_ALIGN_CENTER,
  ELEMENT_ALIGN_JUSTIFY,
  ELEMENT_ALIGN_LEFT,
  MARK_UNDERLINE
} from '@udecode/plate'

import { ELEMENT_PAGE } from './plugins/page'
import { PageElement } from './plugins/page-ui'

export const withStyledPlaceHolders = (components: any) =>
  withPlaceholders(components, [
    {
      key: ELEMENT_PARAGRAPH,
      placeholder: '输入文字...',
      hideOnBlur: true
    }
  ])
const FONT_COLOR = '#000'
const FONT_FAMILY = 'songti, "SimSun", STSong'
const useStyledComponents = () => {
  return useMemo(() => {
    return withStyledPlaceHolders(
      createPlateComponents({
        [ELEMENT_PAGE]: PageElement as any,
        [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
          styles: {
            root: {
              color: FONT_COLOR,
              fontFamily: FONT_FAMILY,
              fontWeight: 600,
              fontSize: '15.6px',
              // fontSize: '18px',
              lineHeight: '1.5',
              margin: '0.33em 0'
            }
          }
        }),
        [ELEMENT_TODO_LI]: withProps(TodoListElement, {
          styles: {
            root: {
              color: FONT_COLOR,
              fontFamily: FONT_FAMILY,
              fontWeight: 600,
              fontSize: '15.6px',
              lineHeight: '1.5'
            },
            text: {
              textDecoration: 'none',
              opacity: 1
            }
          }
        }),
        [ELEMENT_H1]: withProps(StyledElement, {
          styles: {
            root: {
              color: FONT_COLOR,
              fontFamily: FONT_FAMILY,
              fontWeight: 600,
              fontSize: '32px',
              textAlign: 'center',
              lineHeight: '1.4',
              paddingBottom: '16px'
            }
          }
        }),
        [ELEMENT_H2]: withProps(StyledElement, {
          styles: {
            root: {
              color: FONT_COLOR,
              fontFamily: FONT_FAMILY,
              fontWeight: 600,
              fontSize: '18px',
              textAlign: 'center',
              lineHeight: '1.5'
            }
          }
        }),
        [ELEMENT_TD]: withProps(StyledElement, {
          as: 'td',
          styles: {
            root: {
              backgroundColor: '#fff',
              color: FONT_COLOR,
              fontFamily: FONT_FAMILY,
              border: '1px solid #000',
              padding: '3px 10px',
              minWidth: '48px',
              selectors: {
                '> *': {
                  margin: 0
                }
              }
            }
          }
        }),
        [ELEMENT_TABLE]: withProps(TableElement, {
          styles: {
            root: {
              border: '2px solid #000'
            }
          }
        }),
        [ELEMENT_TH]: withProps(StyledElement, {
          as: 'th',
          styles: {
            root: {
              color: FONT_COLOR,
              fontFamily: FONT_FAMILY,
              backgroundColor: '#fff',
              border: '1px solid #000',
              padding: '3px 10px',
              minWidth: '48px',
              textAlign: 'left',
              selectors: {
                '> *': {
                  margin: 0
                }
              }
            }
          }
        }),
        [MARK_UNDERLINE]: withProps(StyledLeaf, {
          as: 'u',
          styles: {
            root: {
              textDecoration: 'none',
              // backgroundImage: 'linear-gradient(to top, currentColor, currentColor 0.1em, transparent 0.1em)',
              borderBottom: '0.1em solid',
              paddingBottom: '0.15em'
            }
          }
        }),
        [ELEMENT_ALIGN_RIGHT]: withProps(StyledElement, {
          styles: {
            root: {
              textAlign: 'right !important',
              selectors: {
                '> *': {
                  textAlign: 'right !important'
                }
              }
            }
          }
        }),
        [ELEMENT_ALIGN_CENTER]: withProps(StyledElement, {
          styles: {
            root: {
              textAlign: 'center'
            }
          }
        }),
        [ELEMENT_ALIGN_JUSTIFY]: withProps(StyledElement, {
          styles: {
            root: {
              textAlign: 'justify !important',
              selectors: {
                '> *': {
                  textAlign: 'justify !important'
                }
              }
            }
          }
        }),
        [ELEMENT_ALIGN_LEFT]: withProps(StyledElement, {
          styles: {
            root: {
              textAlign: 'left !important',
              selectors: {
                '> *': {
                  textAlign: 'left !important'
                }
              }
            }
          }
        })
      })
    )
  }, [])
}

export default useStyledComponents
