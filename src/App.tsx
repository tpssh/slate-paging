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
import { ConfigContext, PageContext } from './env'
import { createPagePlugin } from './plugins/page'
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

  // const initialValueBasicElements = config.value || [
  //   { type: 'p', children: [{ text: '' }] }
  // ]
  const initialValuePasteHtml: any = [
    {
      type: 'page',
      children: [
        {
          type: 'h1',
          children: [
            {
              text: '🍪 Deserialize HTML'
            }
          ]
        },
        {
          type: 'p',
          children: [
            {
              text: "By default, pasting content into a Slate editor will use the clipboard's "
            },
            { text: "'text/plain'", code: true },
            {
              text: " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintain its formatting. To do this, your editor needs to handle "
            },
            { text: "'text/html'", code: true },
            { text: ' data. ' }
          ]
        }
      ]
    }
  ]
  const styledComponents = useStyledComponents()

  const defaultOptions = createPlateOptions()

  // const Tootip = useMemo(() => {
  //   return modelenv === 'read' ? null : <BallonToolbarMarks />
  // }, [modelenv])

  const Editor = () => {
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
    const pageContext = useContext(PageContext)
    return (
      <ConfigContext.Provider value={config}>
        <Plate
          id={id}
          plugins={pluginsMemo}
          onChange={(val) => {
            console.log(val)
            editor && slateEditor.normalize(editor)
            console.log('normalize 开始拉')
            pageContext.setData(val)
            // setValue(val)
            // pubInstance.publish('update', val)
          }}
          components={styledComponents}
          options={defaultOptions}
          editableProps={editableProps}
          initialValue={value}
        >
          {/* <HeadingToolbar styles={{ root: { margin: '0px -20px 0' } }}>
            <ToolbarButtonsBasicElements />
            <ToolbarButtonsList />
            <ToolbarButtonsBasicMarks />
            <ToolbarButtonsAlign />
            <ToolbarButtonsTable />
          </HeadingToolbar>
          <BallonToolbarMarks></BallonToolbarMarks> */}
        </Plate>
      </ConfigContext.Provider>
    )
  }

  return (
    <div
      ref={componentRef}
      className={
        modelenv === 'read'
          ? 'readmodel-editor slate-editor-core'
          : 'slate-editor-core'
      }
    >
      <Editor />
    </div>
  )
}

export default RichText
