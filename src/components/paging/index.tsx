import React, { useContext, useState } from 'react'
import { PageContext } from '../../env'
import InputDiv from './input-div'

export default function Paging(props: any) {
  const pageContext = useContext(PageContext)
  const data = pageContext.data
  const arrs = new Array(data.page).fill('')
  // 一页的高度  用于计算位置
  const pageHeight = 1122
  // const pageToolHeight = 0
  const pageToolHeight = 60
  const selfHeight = 44
  const changeHeader = (e: string) => {
    pageContext.setPageData({ ...data, headerValue: e })
  }
  const changeFooter = (e: string) => {
    pageContext.setPageData({ ...data, footerValue: e })
  }

  return (
    <div className='paging-com'>
      {arrs.map((v, index) => {
        return (
          <div key={'page-warp' + index}>
            <InputDiv
              style={{
                top: index * pageHeight + pageToolHeight + 'px'
              }}
              changeValue={changeHeader}
              page={data.page}
              value={data.headerValue}
              placeholder={'点击输入页眉'}
            ></InputDiv>
            <InputDiv
              style={{
                top:
                  (index + 1) * pageHeight + pageToolHeight - selfHeight + 'px'
              }}
              changeValue={changeFooter}
              page={data.page}
              value={data.footerValue}
              placeholder={'点击输入页脚'}
            ></InputDiv>
          </div>
        )
      })}
    </div>
  )
}
