import { getRenderElement, PlatePlugin } from '@udecode/plate-core'
import { ELEMENT_PAGE } from './defaults'
import { withPage } from './withPage'

/**
 * Enables support for hyperlinks.
 */
export const createPagePlugin = (): PlatePlugin => ({
  pluginKeys: ELEMENT_PAGE,
  renderElement: getRenderElement(ELEMENT_PAGE),
  withOverrides: withPage()
})
