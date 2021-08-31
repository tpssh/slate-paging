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
  pageNumber: number
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
  pageNumber: 0,
  headerValue: '',
  footerValue: '',
  headerAttribute: {},
  footerAttribute: {}
}

export const PageContext = React.createContext<{
  data: PageInfo
  setData: any
}>({
  data: pageInfo,
  setData: () => {}
})

export const PageProvider = (props: any) => {
  const [data, setData] = useState<PageInfo>(pageInfo)

  const providerValue = useMemo(() => {
    return {
      data,
      setData: (val) => {
        console.log(val, '编辑器的数据')
        // 计算page
        const pageInfo = {
          state: {},
          pageNumber: 0,
          headerValue: '',
          footerValue: '',
          headerAttribute: {},
          footerAttribute: {}
        }
        setData(pageInfo)
      }
    }
  }, [data, setData])

  return (
    <PageContext.Provider value={providerValue}>
      {props.children}
    </PageContext.Provider>
  )
}
