import { Transforms, Element, Node, Editor, Path, NodeEntry } from 'slate'
import { ReactEditor } from 'slate-react'
import { SPEditor } from '@udecode/plate-core'

const emptyPage = {
  type: 'page',
  children: []
}

const dirtyNodes: Set<any> = new Set()
let asyncPromise = Promise.resolve()
let isPageNormalize = false

const setTimeRunClearn = (() => {
  let timer: null | Number
  return () => {
    if (!timer) {
      timer = setTimeout(() => {
        isPageNormalize = false
        dirtyNodes.clear()
        timer = null
      })
    }
  }
})()

const heightWeakMap = new WeakMap()

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
    // if the node is Page
    if (Element.isElement(node) && (node as any).type === 'page') {
      if (!isPageNormalize && !dirtyNodes.size) {
        // 等待操作了 DOM 后，进行计算 DOM 位置信息
        asyncPromise.then(() => {
          computeRun(editor)
        })
      }
      if (!isPageNormalize) {
        // 前一页要变脏，上一页是空的，下一页要补上
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
      }
      return
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    return normalizeNode(entry)
  }
}

const computeRun = (editor: any) => {
  // console.log(dirtyNodes.size, 'dirtyNodesdirtyNodes 长度')
  // 清除状态
  setTimeRunClearn()
  isPageNormalize = true
  let pageNode: any
  // 遍历page
  console.time('while 循环')
  while (dirtyNodes.size) {
    const dirtyNodesArr = Array.from(dirtyNodes)
    pageNode = dirtyNodesArr.shift()
    dirtyNodes.delete(pageNode)
    const pageElement = getDom(editor, pageNode)
    const path = getPath(editor, pageNode)
    if (!path || !pageElement) {
      break
    }
    const nextPagePath = [path[0] + 1]
    let nextPageNodeEntry: NodeEntry<Node> | undefined
    try {
      nextPageNodeEntry = Editor.node(editor, nextPagePath) // 还是要基于 slate 的数据结构
    } catch (error) {
      console.log(nextPagePath, '没有这个slate 节点，已经是最后一个节点了')
    }
    const nextPageNode: any = nextPageNodeEntry && nextPageNodeEntry[0]
    const hasNextPage = !!nextPageNode // 还是要基于 slate 的数据结构
    let countPageHeight = 0
    // 进入高度计算
    const pageHeight = getPageHeight(pageElement)
    if (heightWeakMap.get(pageNode)) {
      console.error('获取到了缓存')
      countPageHeight = heightWeakMap.get(pageNode)
    } else {
      console.log('没有缓存')
      const {
        isOverStep,
        index: overIndex,
        countPageHeight: newCountPageHeight
      } = getElementChildHeight(pageElement, countPageHeight, pageHeight)
      countPageHeight = newCountPageHeight
      if (isOverStep && overIndex) {
        if (hasNextPage && nextPagePath) {
          moveChildToNextPage(editor, overIndex, path, nextPagePath)
          updateDirtyNode(editor, nextPagePath)
          // 后续所有元素进行迁移，停止循环
          break
        } else {
          createPageAndMove(editor, overIndex, path, pageNode)
          // 后续所有元素进行迁移，停止循环
          break
        }
      }
      heightWeakMap.set(pageNode, countPageHeight)
    }

    const prevPageNeedFill =
      countPageHeight < pageHeight &&
      hasNextPage &&
      nextPagePath &&
      nextPageNode
    // if current page have enough height can contain next page first child node,
    //  we need move this node
    if (prevPageNeedFill) {
      // console.log('if current page have enough height can contain next')
      let empytHeiht = pageHeight - countPageHeight
      let nextPageElement = getDom(editor, nextPageNode)
      if (!nextPageElement) {
        break
      }
      const nextPageChildren = Array.from(nextPageElement.children)
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
        const toPath = path.concat([pageNode.children.length])
        // 提升当前的 DOM
        debugger
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
  console.timeEnd('while 循环')
}

/**
 * 添加需要计算的 Node
 * @param editor
 * @param path
 */
function updateDirtyNode(editor: ReactEditor & SPEditor, path: any) {
  Promise.resolve()
    .then(() => {
      let nextPageNodeEntry: NodeEntry<Node> | undefined
      try {
        nextPageNodeEntry = Editor.node(editor, path) // 还是要基于 slate 的数据结构
      } catch (error) {
        console.error(error)
      }
      const nextPageNode = nextPageNodeEntry && nextPageNodeEntry[0]
      !dirtyNodes.has(nextPageNode) && dirtyNodes.add(nextPageNode)
      return Promise.resolve()
    })
    .then(() => {
      computeRun(editor)
    })
}

function getElementChildHeight(
  element: HTMLElement,
  countPageHeight: number,
  pageHeight: number
) {
  const children: globalThis.Element[] = Array.from(element.children)
  // top bottom margin merge
  let preElementBottomMargin = 0
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    const { height: childHeight, marginBottom } = computeItemHeight(
      child,
      preElementBottomMargin
    )
    preElementBottomMargin = marginBottom
    countPageHeight = countPageHeight + childHeight
    if (countPageHeight > pageHeight) {
      return { isOverStep: true, index, countPageHeight }
    }
  }
  return { isOverStep: false, countPageHeight }
}

/**
 * trycatch 获取path
 * @param editor
 * @param node
 * @returns
 */
function getPath(editor: ReactEditor & SPEditor, node: Node) {
  let path
  try {
    path = ReactEditor.findPath(editor, node)
  } catch (error) {
    console.log(error)
  }
  return path
}
/**
 * try catch 获取 DOM
 * @param editor
 * @param node
 * @returns
 */
function getDom(editor: ReactEditor & SPEditor, node: Node) {
  let nodeElement
  try {
    nodeElement = ReactEditor.toDOMNode(editor, node)
  } catch (error) {
    console.error('DOM 转换失败', error)
  }
  return nodeElement
}

// 进入高度计算
function getPageHeight(PageNode: HTMLElement) {
  const style = window.getComputedStyle(PageNode)
  const computedHeight = PageNode.offsetHeight
  const padding =
    parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0')

  const pageHeight = computedHeight - padding
  return pageHeight
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
        ['h1', 'h2', 'p', 'ul'].includes((n as any).type)
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
        ['h1', 'h2', 'p', 'ul'].includes((n as any).type)
      ) {
        // console.log((n as any).type, nodePathIndex, splitIndex)
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
        ['h1', 'h2', 'p', 'ul'].includes((n as any).type) &&
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
