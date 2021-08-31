import { Transforms, Element, Node, Editor, Path, Text } from 'slate'
import { ReactEditor } from 'slate-react'
import { SPEditor } from '@udecode/plate-core'

const emptyPage = {
  type: 'page',
  children: [{ type: 'p', children: [{ type: 'text', text: '' }] }]
}

export const normalizePage = (editor: ReactEditor & SPEditor) => {
  // can include custom normalisations---
  const { normalizeNode } = editor
  return (entry: any) => {
    const [node, path] = entry
    console.log('into normalizePage')
    // if the node is Page
    if (Element.isElement(node) && (node as any).type === 'page') {
      console.log('into page')
      let PageNode
      // afaik pageNode if inserted as new page is not available here as a dom node because it hasnt rendered yet
      try {
        PageNode = ReactEditor.toDOMNode(editor, node)
      } catch (e) {
        return
        // return normalizeNode(entry)
      }
      // if next node is page, and now page is not fill, shou move next page child node
      const nextElement = Editor.next(editor, { at: path })
      const [nextPageNode, nextPagePath] = nextElement || []
      const hasNextPage =
        nextPageNode && (node as any).type === 'page' && nextPagePath

      const style = window.getComputedStyle(PageNode)
      const computedHeight = PageNode.offsetHeight
      const padding =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

      const pageHeight = computedHeight - padding

      let currentPageHeight = 0

      const children: globalThis.Element[] = Array.from(PageNode.children)
      console.log(pageHeight, 'is pageHeight')
      // top bottom margin merge
      let preElementBottomMargin = 0
      children.forEach((child, index) => {
        const { height: childHeight, marginBottom } = computeItemHeight(
          child,
          preElementBottomMargin
        )
        preElementBottomMargin = marginBottom
        currentPageHeight = currentPageHeight + childHeight
        if (currentPageHeight > pageHeight) {
          // if has next page, only move nodes
          if (hasNextPage && nextPagePath) {
            moveChildToNextPage(editor, index, path, nextPagePath)
          } else {
            createPageAndMove(editor, index, path, node)
          }
        }
      })
      // if current page have enough height can contain next page first child node,
      //  we need move this node
      if (currentPageHeight < pageHeight && nextPageNode && nextPagePath) {
        console.log('if current page have enough height can contain next')
        let empytHeiht = pageHeight - currentPageHeight
        const nextPageNodes = ReactEditor.toDOMNode(editor, nextPageNode)
        const nextPageChildren = Array.from(nextPageNodes.children)
        // top bottom margin merge
        let preElementBottomMargin = 0
        nextPageChildren.forEach((child, index) => {
          const { height: childHeight, marginBottom } = computeItemHeight(
            child,
            preElementBottomMargin
          )
          preElementBottomMargin = marginBottom
          if (empytHeiht < childHeight) return
          empytHeiht = empytHeiht - childHeight
          if (empytHeiht < childHeight) {
            const toPath = path.concat([children.length - 1])
            riseElementToPrevPage(editor, index, nextPagePath, toPath)
          }
          // if move done, this page is empty, remove this page
          if (index === nextPageChildren.length - 1) {
            Transforms.removeNodes(editor, {
              at: nextPagePath
            })
          }
        })
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    return normalizeNode(entry)
  }
}

function computeItemHeight(
  dom: globalThis.Element,
  mergeMargin: number
): {
  height: number
  marginBottom: number
} {
  const style = window.getComputedStyle(dom)
  const clientHeight = dom.clientHeight
  const marginTop = parseFloat(style.marginBottom)
  const mergeMarginVal = Math.max(marginTop - mergeMargin, 0)
  const marginBottom = parseFloat(style.marginBottom)
  const margin = mergeMarginVal + marginBottom
  const padding = parseFloat(style.paddingBottom) + parseFloat(style.paddingTop)
  const border =
    parseFloat(style.borderLeftWidth) +
    parseFloat(style.borderRightWidth) +
    parseFloat(style.borderTopWidth) +
    parseFloat(style.borderBottomWidth)

  const height = clientHeight + margin + padding + border
  return { height, marginBottom: marginBottom }
}

function moveChildToNextPage(
  editor: ReactEditor,
  splitIndex: number,
  formPath: Path,
  toPath: Path
): void {
  Transforms.moveNodes(editor, {
    at: formPath,
    match(n) {
      if (
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        (n as any).type !== 'page'
      ) {
        let path = null
        try {
          path = ReactEditor.findPath(editor, n)
        } catch (error) {
          // i dont know, if node path equal to selection, will throw error
          path = (editor.selection && editor.selection.anchor.path) || []
        }
        return path[1] >= splitIndex
      }
      return false
    },
    to: toPath.concat([0])
  })
}

function createPageAndMove(
  editor: ReactEditor,
  splitIndex: number,
  formPath: Path,
  entryNode: Node
) {
  // need create page node
  Transforms.wrapNodes(editor, emptyPage, {
    at: formPath,
    split: true,
    match(n) {
      if (
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        (n as any).type !== 'page'
      ) {
        let path = null
        try {
          path = ReactEditor.findPath(editor, n)
        } catch (error) {
          // i dont know, if node path equal to selection, will throw error
          path = (editor.selection && editor.selection.anchor.path) || []
        }
        return path[1] >= splitIndex
      }
      return false
    }
  })
  Transforms.moveNodes(editor, {
    at: formPath,
    match(n) {
      if (
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        (n as any).type === 'page' &&
        n !== entryNode
      ) {
        return true
      }
      return false
    },
    to: [formPath[0] + 1]
  })
}

function riseElementToPrevPage(
  editor: ReactEditor,
  splitIndex: number,
  formPath: Path,
  toPath: Path
) {
  Transforms.moveNodes(editor, {
    at: formPath,
    // eslint-disable-next-line space-before-function-paren
    match(n) {
      if (
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        (n as any).type !== 'page'
      ) {
        let path
        try {
          path = ReactEditor.findPath(editor, n)
        } catch (error) {
          return false
        }
        return path[1] <= splitIndex
      }
      return false
    },
    to: toPath // move to previous page last position
  })
}
