import { SPEditor, WithOverride } from '@udecode/plate-core'
import { normalizePage } from './normalizers/normalizePage'
import { ReactEditor } from 'slate-react'

// import { ELEMENT_LINE } from './defaults'

export const withPage =
  (): WithOverride<ReactEditor & SPEditor> => (editor) => {
    const { insertText } = editor
    editor.normalizeNode = normalizePage(editor)
    editor.insertText = (text) => {
      console.log('insertText', text)
      // debugger
      insertText(text)
    }
    return editor
  }
