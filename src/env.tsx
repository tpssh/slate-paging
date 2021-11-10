import React, { useCallback, useState } from 'react'

interface Config {
  model?: string
  id?: string
  value?: {}
}

// interface reactStyleAttr {
//   textAlign?: 'left' | 'right' | 'center'
//   color?: string
// }
interface PageInfo {
  state: any
  page: number
  headerAttribute: any
  footerAttribute: any
}

let configValue: Config = {}

export const getConfigValue = () => {
  return configValue
}
export const setConfigValue = (val: Config) => {
  configValue = val
}

export const ConfigContext = React.createContext<Config>({})

// 分页信息的
const pageInfo: PageInfo = {
  state: {},
  page: 1,
  headerAttribute: {
    data: {
      formatFunIndex: 0,
      direction: 'center'
    },
    value: '',
    showPage: false
  },
  footerAttribute: {
    data: {
      formatFunIndex: 0,
      direction: 'center'
    },
    value: '',
    showPage: false
  }
}

export const PageContext = React.createContext<PageInfo>(pageInfo)

export const PageDispatchContext = React.createContext<{
  dispatchPageInfo(val: PageInfo): any
  dispatchPageEidtor(val: any): any
}>({
  dispatchPageInfo: () => {},
  dispatchPageEidtor: () => {}
})

export const PageProvider = ({ children }: any) => {
  const [data, setData] = useState<PageInfo>(pageInfo)

  const dispatchPageEditInfo = useCallback((val) => {
    console.log(val, '编辑器的数据')
    // page 是顶级元素，只要进行一层遍历
    let page = 0
    for (let index = 0; index < val.length; index++) {
      const element = val[index]
      if (element.type === 'page') {
        page += 1
      }
    }
    // 计算page
    setData((prev) => {
      if (page === prev.page) return prev
      return {
        ...prev,
        page: page
      }
    })
  }, [])

  const dispatchPageInfo = useCallback((val) => {
    setData((prev) => {
      return {
        ...prev,
        ...val
      }
    })
  }, [])

  return (
    <PageContext.Provider value={data}>
      <PageDispatchContext.Provider
        value={{
          dispatchPageInfo,
          dispatchPageEidtor: dispatchPageEditInfo
        }}
      >
        {children}
      </PageDispatchContext.Provider>
    </PageContext.Provider>
  )
}
