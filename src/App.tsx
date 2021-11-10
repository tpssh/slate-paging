/* eslint-disable no-console */
import React, { useEffect, useMemo, useState, useRef, useContext } from 'react'
import {
  Plate,
  createReactPlugin,
  createHistoryPlugin,
  createParagraphPlugin,
  // createBlockquotePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createCodePlugin,
  createUnderlinePlugin,
  createBoldPlugin,
  createTablePlugin,
  createSuperscriptPlugin,
  createHighlightPlugin,
  createSubscriptPlugin,
  createTodoListPlugin,
  createKbdPlugin,
  // createNormalizeTypesPlugin,
  // createTrailingBlockPlugin,
  createSelectOnBackspacePlugin,
  createDeserializeHTMLPlugin,
  createAlignPlugin,
  createExitBreakPlugin,
  ExitBreakPluginOptions,
  createNodeIdPlugin,
  createListPlugin,
  createHeadingPlugin,
  // createCodeBlockPlugin,
  ELEMENT_PARAGRAPH,
  // ELEMENT_H1,
  KEYS_HEADING,
  // ELEMENT_H2,
  ELEMENT_TD,
  ELEMENT_IMAGE,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  // ELEMENT_CODE_LINE,
  ELEMENT_TODO_LI,
  // CodeBlockElement,
  // 搜索插件
  // useFindReplacePlugin,
  // MARK_BOLD,
  // withPlaceholders,
  createPlateOptions,
  // createSlatePluginsComponents,
  // withProps,
  ResetBlockTypePluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  createResetNodePlugin,
  createSoftBreakPlugin,
  SoftBreakPluginOptions
  // createAutoformatPlugin,
  // useStoreState
} from '@udecode/plate'
import { useStoreEditorRef, useEventEditorStore } from '@udecode/plate-core'
import { useReactToPrint } from 'react-to-print'
import { ReactEditor } from 'slate-react'
import { Transforms, Editor as slateEditor } from 'slate'
import useStyledComponents from './styledComponents'
import { HeadingToolbar } from '@udecode/plate-toolbar'
import {
  ToolbarButtonsBasicElements,
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsTable,
  ToolbarButtonsList,
  ToolbarButtonsBasicMarks
} from './newplugin'

// markdown语法支持
// import { optionsAutoformat } from './autoformatRules'
// import DominInput from './components/domin/input'

import {
  optionsResetBlockTypePlugin,
  optionsExitBreakPlugin,
  optionsSoftBreakPlugin
} from './config/pluginOptions'
import { ConfigContext, PageDispatchContext, PageProvider } from './env'
import { createPagePlugin } from './plugins/page'
import Paging from './components/paging/index'
import initData from './initData'
const RichText = ({ config, eventBus }: any) => {
  const { model: modelenv, id } = config
  const componentRef = useRef(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    removeAfterPrint: false
  })

  useEffect(() => {
    ;(window as any).handlePrint = handlePrint
  }, [handlePrint])

  // const Tootip = useMemo(() => {
  //   return modelenv === 'read' ? null : <BallonToolbarMarks />
  // }, [modelenv])

  return (
    <div
      ref={componentRef}
      className={
        modelenv === 'read'
          ? 'readmodel-editor slate-editor-core'
          : 'slate-editor-core'
      }
    >
      <PageProvider>
        <Editor id={config.id} />
        <Paging></Paging>
      </PageProvider>
    </div>
  )
}

const Editor = ({ id }: any) => {
  const initialValuePasteHtml: any = initData
  const styledComponents = useStyledComponents()

  const defaultOptions = createPlateOptions()
  const pluginsMemo = useMemo(() => {
    const plugins = [
      createReactPlugin(),
      createHistoryPlugin(),
      createParagraphPlugin(),
      // createBlockquotePlugin(),
      createTodoListPlugin(),
      createHeadingPlugin(),
      createListPlugin(),
      createPagePlugin(),
      createTablePlugin(),
      // createCodeBlockPlugin(),
      createAlignPlugin(),
      createBoldPlugin(),
      createCodePlugin(),
      createItalicPlugin(),
      createHighlightPlugin(),
      createUnderlinePlugin(),
      createStrikethroughPlugin(),
      createSubscriptPlugin(),
      createSuperscriptPlugin(),
      // 键盘监听
      createKbdPlugin(),
      createNodeIdPlugin(),
      // markdown语法支持
      // createAutoformatPlugin(optionsAutoformat),
      // 设置默认模块
      createResetNodePlugin(optionsResetBlockTypePlugin),
      // 软换行
      createSoftBreakPlugin(optionsSoftBreakPlugin),
      // 退出当前块
      createExitBreakPlugin(optionsExitBreakPlugin),
      // 强制布局
      // createNormalizeTypesPlugin({
      //   rules: [{ path: [0, 0], strictType: ELEMENT_H1 }],
      // }),
      // createTrailingBlockPlugin({
      //   type: ELEMENT_PARAGRAPH,
      //   level: 1,
      // }),
      createSelectOnBackspacePlugin({ allow: ELEMENT_IMAGE })
    ]
    // 处理html文本插入
    plugins.push(createDeserializeHTMLPlugin({ plugins }))

    return plugins
  }, [])
  const { dispatchPageEidtor } = useContext(PageDispatchContext)
  const editor = useStoreEditorRef()
  let [value, setValue] = useState<any>(initialValuePasteHtml)
  const editableProps = {
    // placeholder: 'Type…',
    style: {
      width: '794px',
      minHeight: '500px',
      outline: '1px solid rgb(238, 238, 238)'
    }
  }
  useEffect(() => {
    dispatchPageEidtor(value)
  }, [])
  return (
    // <ConfigContext.Provider value={config}>
    <Plate
      id={id}
      plugins={pluginsMemo}
      onChange={(val) => {
        console.log(val)
        editor && slateEditor.normalize(editor)
        dispatchPageEidtor(val)
        // setValue(val)
        // pubInstance.publish('update', val)
      }}
      components={styledComponents}
      options={defaultOptions}
      editableProps={editableProps}
      initialValue={value}
    >
      <HeadingToolbar styles={{ root: { margin: '0px -20px 0' } }}>
        <ToolbarButtonsBasicElements />
        <ToolbarButtonsList />
        <ToolbarButtonsBasicMarks />
        <ToolbarButtonsAlign />
        <ToolbarButtonsTable />
      </HeadingToolbar>
      <BallonToolbarMarks></BallonToolbarMarks>
    </Plate>
    // </ConfigContext.Provider>
  )
}

export default RichText
