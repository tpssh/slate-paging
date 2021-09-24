import { Transforms, Element, Node, Editor, Path, Range } from 'slate'
import { ReactEditor } from 'slate-react'
import { SPEditor } from '@udecode/plate-core'

const emptyPage = {
  type: 'page',
  children: []
}

const dirtyNodes: Set<any> = new Set()
let isPageNormalize = false

// TODO
/**
 * 如果当前只有一页，或者当前不存在page 元素，需要包裹一个 page 元素
 */

/**
 * 在编辑器进行 normalize 的时候
 *  1、记录下当前 normalize 的 page 元素，为了防止分页修改，把上下页的 page 元素 也要记录下来
 *  2、normalize 完，react 操作 DOM 后就可以访问到 DOM 数据。 进行高度计算
 *    2.1、 为了能够在操作 DOM 再进行高度判断， 设置了个状态  isPageNormalize。
 *          isPageNormalize 用来判断是否是 DOM 高度分页造成的 normalize 触发，
 *          这种情况下就不需要再记录 page 元素了，否则会无限循环
 * 3、当前页面高度累加超出当前页面高度，则后续的元素都需要移动到下一页
 * 4、当前页面高度累加不足，且存在下页，则需要把下一页元素向上移动
 */
export const normalizePage = (editor: ReactEditor & SPEditor) => {
  // can include custom normalisations---
  const { normalizeNode } = editor
  return (entry: any) => {
    let [node, path] = entry
    console.log('into normalizePage')
    // if the node is Page
    if (Element.isElement(node) && (node as any).type === 'page') {
      if (!isPageNormalize && !dirtyNodes.size) {
        Promise.resolve().then(() => {
          setTimeout(() => {
            isPageNormalize = false
            dirtyNodes.clear()
          })
          console.log(dirtyNodes.size, 'dirtyNodesdirtyNodes 长度')
          isPageNormalize = true
          // 遍历page
          const dirtyNodesArr = Array.from(dirtyNodes)
          while (dirtyNodesArr.length) {
            node = dirtyNodesArr.shift()
            let PageNode
            // afaik pageNode if inserted as new page is not available here as a dom node because it hasnt rendered yet
            try {
              // dom maybe unrender, so node children length diff dom children length
              PageNode = ReactEditor.toDOMNode(editor, node)
              console.log(PageNode)
              console.log(
                PageNode.children.length,
                node.children.length,
                'node.children.length'
              )
            } catch (e) {
              return
            }
            const hasNextPage = !!dirtyNodesArr.length
            const path = ReactEditor.findPath(editor, node)
            const nextPagePath = [path[0] + 1]
            console.log(
              ReactEditor.findPath(editor, node),
              ' ReactEditor.findPath(editor, node)'
            )
            const style = window.getComputedStyle(PageNode)
            const computedHeight = PageNode.offsetHeight
            const padding =
              parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

            const pageHeight = computedHeight - padding

            let currentPageHeight = 0

            const children: globalThis.Element[] = Array.from(PageNode.children)
            // top bottom margin merge
            let preElementBottomMargin = 0
            // eslint-disable-next-line no-loop-func
            children.forEach((child, index) => {
              const { height: childHeight, marginBottom } = computeItemHeight(
                child,
                preElementBottomMargin
              )
              preElementBottomMargin = marginBottom
              currentPageHeight = currentPageHeight + childHeight
              if (currentPageHeight > pageHeight) {
                if (hasNextPage && nextPagePath) {
                  moveChildToNextPage(editor, index, path, nextPagePath)
                } else {
                  createPageAndMove(editor, index, path, node)
                }
              }
            })
            // if current page have enough height can contain next page first child node,
            //  we need move this node
            if (currentPageHeight < pageHeight && hasNextPage && nextPagePath) {
              console.log('if current page have enough height can contain next')
              let empytHeiht = pageHeight - currentPageHeight
              const nextPageNodes = ReactEditor.toDOMNode(
                editor,
                dirtyNodesArr[0]
              )
              const nextPageChildren = Array.from(nextPageNodes.children)
              // top bottom margin merge
              let preElementBottomMargin = 0
              for (let index = 0; index < nextPageChildren.length; index++) {
                const nextPageChildNode = nextPageChildren[index]
                const { height: childHeight, marginBottom } = computeItemHeight(
                  nextPageChildNode,
                  preElementBottomMargin
                )
                preElementBottomMargin = marginBottom
                if (empytHeiht < childHeight) break
                empytHeiht = empytHeiht - childHeight
                const toPath = path.concat([node.children.length])
                riseElementToPrevPage(editor, index, nextPagePath, toPath)
                // if move done, this page is empty, remove this page
                if (index === nextPageChildren.length - 1) {
                  Transforms.removeNodes(editor, {
                    at: nextPagePath
                  })
                }
              }
            }
          }
        })
      }
      if (!isPageNormalize) {
        // 前后一页都要变脏
        if (!dirtyNodes.size) {
          const [prevNode] =
            Editor.previous(editor, {
              at: path
            }) || []
          if (prevNode) {
            !dirtyNodes.has(prevNode) && dirtyNodes.add(prevNode)
          }
        }
        !dirtyNodes.has(node) && dirtyNodes.add(node)

        const [nextNode] =
          Editor.next(editor, {
            at: path
          }) || []
        if (nextNode) {
          !dirtyNodes.has(nextNode) && dirtyNodes.add(nextNode)
        }
      }
      return
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
  let nodePathIndex = 0
  Transforms.moveNodes(editor, {
    at: formPath,
    match(n) {
      if (
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        (n as any).type !== 'page'
      ) {
        return nodePathIndex++ >= splitIndex
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
  // use index record nodes path, because node cant find path in this time.
  let nodePathIndex = 0
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
        return nodePathIndex++ >= splitIndex
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
