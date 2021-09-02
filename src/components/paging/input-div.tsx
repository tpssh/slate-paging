import React, { useState } from 'react'
import { useCallback } from 'react'
import { useEffect } from 'react'
const compile = require('lodash.template')
const compileOptions = {
  escape: /{{([^{][\s\S]+?[^}])}}/g,
  interpolate: /{{{([\s\S]+?)}}}/g
}
// 优化 回车后跳回编辑器

export default function InputDiv(props: any) {
  const { value, changeValue, className = '', placeholder, style, page } = props
  const [state, setState] = useState({
    focus: false,
    compileValue: ''
  })

  const getCompileValue = useCallback(
    (inputValue: string) => {
      let compileValue = ''
      try {
        const compileFn = compile(inputValue, compileOptions)
        const val = compileFn({
          page
        })
        console.log(val, 'is value  compile')
        compileValue = val
      } catch (error) {
        console.log(' 无效  变量 呀兄弟 is value  compile')
        compileValue = '无效表达式'
      }
      compileValue = compileValue.replaceAll(' ', '\u00a0')
      return compileValue
    },
    [page]
  )

  const onBlur = () => {
    setState({
      ...state,
      focus: false,
      compileValue: getCompileValue(value)
    })
  }

  useEffect(() => {
    const compileValue = getCompileValue(value)
    setState((state) => {
      state.compileValue = compileValue
      return state
    })
  }, [value, getCompileValue])

  const changeHeader = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('changeHeader')
    changeValue(e.target.value)
  }
  const onclick = () => {
    setState({
      ...state,
      focus: true
    })
  }

  return (
    <div
      className={
        state.focus
          ? `${className} page-input-warp active`
          : `${className} page-input-warp`
      }
      style={style || {}}
    >
      {state.focus ? (
        <input
          className='page-input'
          value={value}
          autoFocus
          onChange={changeHeader}
          onBlur={onBlur}
          type='text'
        />
      ) : null}
      <div
        className='page-content'
        style={{
          display: state.focus ? 'none' : 'block',
          fontSize: '14px'
        }}
        onClick={onclick}
      >
        {state.compileValue || placeholder}
      </div>
    </div>
  )
}
