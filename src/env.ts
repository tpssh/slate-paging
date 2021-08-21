import React from 'react'

interface Config {
  model?: string
  id?: string
  value?: {}
}

let configValue: Config = {}

export const getConfigValue = () => {
  return configValue
}
export const setConfigValue = (val: Config) => {
  configValue = val
}

export const ConfigContext = React.createContext<Config>({})
