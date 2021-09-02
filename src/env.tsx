import React, { useMemo, useState } from 'react'

interface Config {
  model?: string
  id?: string
  value?: {}
}

interface reactStyleAttr {
  textAlign?: 'left' | 'right' | 'center'
  color?: string
}
interface PageInfo {
  state: any
  page: number
  headerValue: string
  footerValue: string
  headerAttribute: reactStyleAttr
  footerAttribute: reactStyleAttr
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
  headerValue: '',
  footerValue: '',
  headerAttribute: {},
  footerAttribute: {}
}

export const PageContext = React.createContext<{
  data: PageInfo
  setPageData(val: PageInfo): any
  setData: any
}>({
  data: pageInfo,
  setPageData: () => {},
  setData: () => {}
})

export const PageProvider = (props: any) => {
  const [data, setData] = useState<PageInfo>(pageInfo)

  const providerValue = useMemo(() => {
    return {
      data,
      setData: (val: any) => {
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
        const pageInfo = {
          ...data,
          page: page
        }
        setData(pageInfo)
      },
      setPageData(state: PageInfo) {
        setData(state)
      }
    }
  }, [data, setData])

  return (
    <PageContext.Provider value={providerValue}>
      {props.children}
    </PageContext.Provider>
  )
}
