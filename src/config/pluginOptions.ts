import {
  ExitBreakPluginOptions,
  ELEMENT_PARAGRAPH,
  KEYS_HEADING,
  ELEMENT_TD,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_TODO_LI,
  ResetBlockTypePluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  SoftBreakPluginOptions
} from '@udecode/plate'

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH
}

export const optionsResetBlockTypePlugin: ResetBlockTypePluginOptions = {
  rules: [
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Enter',
      predicate: isBlockAboveEmpty
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Backspace',
      predicate: isSelectionAtBlockStart
    }
  ]
}

export const optionsExitBreakPlugin: ExitBreakPluginOptions = {
  rules: [
    {
      hotkey: 'mod+enter',
      level: 1
    },
    {
      hotkey: 'mod+shift+enter',
      before: true,
      level: 1
    },
    {
      hotkey: 'enter',
      query: {
        start: true,
        end: true,
        allow: KEYS_HEADING
      }
    }
  ]
}

export const optionsSoftBreakPlugin: SoftBreakPluginOptions = {
  rules: [
    { hotkey: 'shift+enter' },
    {
      hotkey: 'enter',
      query: {
        allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD]
      }
    }
  ]
}
