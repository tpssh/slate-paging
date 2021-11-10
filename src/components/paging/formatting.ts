interface pageStyleFunc {
  (index: number, all: number): string
}

export const pageOption: pageStyleFunc[] = [
  (index) => {
    return index + ''
  },
  (index) => {
    return `-${index}-`
  },
  (index) => {
    return ` ${index} `
  },
  (index) => {
    return `第${index}页`
  },
  (index) => {
    return `第${number2text(index)}页`
  },
  (index, all) => {
    return `第${index}页 共${all}页`
  },
  (index, all) => {
    return `第${number2text(index)}页 共${number2text(all)}页`
  }
]

/**
 * @description 数字转中文数码
 *
 * @param {Number|String}   num     数字[正整数]
 * @param {String}          type    文本类型，lower|upper，默认lower
 *
 * @example number2text(100000000) => "壹亿元整"
 */
const number2text = (
  number: Number | String,
  type: 'lower' | 'upper' = 'lower'
) => {
  // 配置
  const confs = {
    lower: {
      num: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
      unit: ['', '十', '百', '千', '万'],
      level: ['', '万', '亿']
    },
    upper: {
      num: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'],
      unit: ['', '拾', '佰', '仟'],
      level: ['', '万', '亿']
    },
    maxNumber: 999999999999
  }

  // 过滤不合法参数
  if (Number(number) > confs.maxNumber) {
    console.error(
      `The maxNumber is ${confs.maxNumber}. ${number} is bigger than it!`
    )
    return false
  }

  const conf = confs[type]
  const integer = String(Number(number)).split('')

  // 四位分级
  const levels = integer.reverse().reduce((pre: any, item: any, idx) => {
    let level = pre[0] && pre[0].length < 4 ? pre[0] : []
    let value =
      item === '0' ? conf.num[item] : conf.num[item] + conf.unit[idx % 4]
    level.unshift(value)

    if (level.length === 1) {
      pre.unshift(level)
    } else {
      pre[0] = level
    }

    return pre
  }, [])

  // 整数部分
  const _integer = levels.reduce(
    (pre: String, item: Array<number>, idx: number) => {
      let _level = conf.level[levels.length - idx - 1]
      let _item = item.join('').replace(/(零)\1+/g, '$1') // 连续多个零字的部分设置为单个零字

      // 如果这一级只有一个零字，则去掉这级
      if (_item === '零') {
        _item = ''
        _level = ''

        // 否则如果末尾为零字，则去掉这个零字
      } else if (_item[_item.length - 1] === '零') {
        _item = _item.slice(0, _item.length - 1)
      }

      return pre + _item + _level
    },
    ''
  )

  // 如果是整数，则补个整字
  return `${_integer}`
}
