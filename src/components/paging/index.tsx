import React, { useContext } from 'react'

import { PageContext } from '../../env'
import PageHeader from './Pageheader'

// 一页的高度  用于计算位置
const pageHeight = 1122
// const pageToolHeight = 0
const pageToolHeight = 60
const selfHeight = 44

export default function Paging() {
  const data = useContext(PageContext)
  const arrs = new Array(data.page).fill('')

  return (
    <div className='paging-com'>
      {arrs.map((v, index) => {
        return (
          <div key={'page-warp' + index}>
            {/* <InputDiv
              style={{
                top: index * pageHeight + pageToolHeight + 'px'
              }}
              changeValue={changeHeader}
              page={index + 1}
              value={data.headerValue}
              placeholder={'点击输入页眉'}
            ></InputDiv> */}
            {/* <div
              className='page-input-warp'
              style={{
                top: index * pageHeight + pageToolHeight + 'px'
              }}
            ></div> */}
            <PageHeader
              top={index * pageHeight + pageToolHeight + 'px'}
              index={index + 1}
              all={arrs.length}
              isHeader={true}
            ></PageHeader>
            <PageHeader
              top={
                (index + 1) * pageHeight + pageToolHeight - selfHeight + 'px'
              }
              index={index + 1}
              all={arrs.length}
            ></PageHeader>
          </div>
        )
      })}
    </div>
  )
}
