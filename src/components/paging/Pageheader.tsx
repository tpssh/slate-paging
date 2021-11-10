import React, {
  createRef,
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useContext
} from 'react'
import {
  Tooltip,
  Popover,
  Form,
  Input,
  Button,
  Radio,
  Select,
  Space
} from 'antd'
import { PageContext, PageDispatchContext } from '../../env'
import { pageOption } from './formatting'
const { Option } = Select
const FormLayout = forwardRef(
  ({ cancel, submit, initValue }: any, ref: React.Ref<unknown> | undefined) => {
    const [form] = Form.useForm()
    const selectOp = [
      {
        text: '1,2,3',
        formatFunIndex: 0
      },
      {
        text: '-1-,-2-,-3-',
        formatFunIndex: 1
      },
      {
        text: ' 1 , 2 , 3 ',
        formatFunIndex: 2
      },
      {
        text: '第1页',
        formatFunIndex: 3
      },
      {
        text: '第一页',
        formatFunIndex: 4
      },
      {
        text: '第1页 共x页',
        formatFunIndex: 5
      },
      {
        text: '第一页 共x页',
        formatFunIndex: 6
      }
    ]
    const raidoOp = [
      {
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABkAgMAAABY7Z6ZAAAADFBMVEXi5u3////Axs89R1de/pOQAAAAO0lEQVQ4y2NYhQEYsAgtDUUDUXQQ+k+UUPwgFaJmSDCAAXWE6B+PDEiAUqFR14+6ftT1o0KDTIioWhQANqY3iwBuOv0AAAAASUVORK5CYII=',
        name: '居左',
        value: 'left'
      },
      {
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABkAgMAAABY7Z6ZAAAADFBMVEXi5u3////Axs89R1de/pOQAAAAO0lEQVQ4y2NYhQEYsAgtDUUDUfQS+k+UUPwgFaJSSDCAAXWE6B+PDEiAUqFR14+6ftT1o0KDTIioWhQALnI3iwaTK+sAAAAASUVORK5CYII=',
        name: '居中',
        value: 'center'
      },
      {
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABkAgMAAABY7Z6ZAAAADFBMVEXi5u3////Axs89R1de/pOQAAAAO0lEQVQ4y2NYhQEYsAgtDUUDUfQV+k+UUPwgFaI4JBjAgDpC9I9HBiRAqdCo60ddP+r6UaFBJkRULQoAJJo3i/rbBzgAAAAASUVORK5CYII=',
        name: '居右',
        value: 'right'
      }
    ]
    useImperativeHandle(ref, () => ({
      getFormData: () => {
        return form.getFieldsValue()
      }
    }))
    return (
      <>
        <Form initialValues={initValue} layout='horizontal' form={form}>
          <Form.Item name='formatFunIndex' label='页码样式'>
            <Select allowClear>
              {selectOp.map((item) => {
                return (
                  <Option key={item.text} value={item.formatFunIndex}>
                    {item.text}
                  </Option>
                )
              })}
            </Select>
          </Form.Item>
          <Form.Item label='页码位置' name='direction'>
            <Radio.Group>
              {raidoOp.map((item) => {
                return (
                  <Radio key={item.name} value={item.value}>
                    <div>
                      <img src={item.img} alt='' />
                      <div style={{ textAlign: 'center' }}>{item.name}</div>
                    </div>
                  </Radio>
                )
              })}
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={submit} type='primary'>
                确认
              </Button>
              <Button onClick={cancel}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </>
    )
  }
)

export default function PageHeader({ top, index, isHeader, all }: any) {
  const pageContext = useContext(PageContext)
  const dataKey = isHeader ? 'headerAttribute' : 'footerAttribute'
  const { dispatchPageInfo } = useContext(PageDispatchContext)
  const context = pageContext[dataKey]
  const direction = context.data.direction
  const [state, setState] = useState(() => {
    return {
      current: false,
      modelOpen: false
    }
  })
  const inputRef = createRef<Input>()
  const refForm = useRef(null)
  const openButton = () => {
    setState({
      ...state,
      current: true
    })
  }
  const openInsert = () => {
    console.log('openInsert')
    setState({
      ...state,
      modelOpen: true
    })
  }

  const cancel = () => {
    console.log('cancel')
    setState({
      ...state,
      modelOpen: false
    })
  }
  const submit = () => {
    // 关闭弹窗 插入页码 或者修改页码
    setState({
      ...state,
      modelOpen: false
    })
    // 修改页码展示信息
    syncContext(true)
  }
  const exit = () => {
    setState({
      ...state,
      current: false,
      modelOpen: false
    })
    syncContext()
  }
  const setText = (val: string) => {
    dispatchPageInfo({
      ...pageContext,
      [dataKey]: {
        ...context,
        value: val
      }
    })
  }
  const delInsert = () => {
    console.log('del删除页码')
    dispatchPageInfo({
      ...pageContext,
      [dataKey]: {
        ...context,
        showPage: false
      }
    })
  }
  const syncContext = (showPage?: boolean) => {
    const formData = refForm.current && (refForm.current as any).getFormData()
    const obj = {
      ...context,
      data: formData || context.data,
      showPage: !!showPage || context.showPage
    }
    dispatchPageInfo({ ...pageContext, [dataKey]: obj })
  }
  const dialogContenet = (
    <FormLayout
      cancel={cancel}
      ref={refForm}
      submit={submit}
      initValue={context.data}
    ></FormLayout>
  )
  const { current, modelOpen } = state
  const handleVisibleChange: (v: boolean) => void = (visible) => {
    console.log(visible, 'visible')
    setState({ ...state, modelOpen: !!visible })
  }
  const pageText = useMemo(() => {
    const findex = context.data.formatFunIndex
    const fn = pageOption[findex]
    const text = fn(index, all)
    console.log(text, 'is text')
    return text
  }, [index, all, context])
  useEffect(() => {
    if (current && inputRef.current) {
      inputRef.current.focus()
    }
  }, [current, inputRef])

  return (
    <div
      className='page-input-warp'
      style={{
        top: top
      }}
    >
      <Tooltip placement='top' title={state.current ? '' : '双击编辑页眉'}>
        <div className='page-input-model'>
          <div className='header-com'>
            <span
              className='page-header-value'
              onDoubleClick={openButton}
              style={{ userSelect: 'none' }}
            >
              <Input
                ref={inputRef}
                disabled={!state.current}
                bordered={false}
                value={context.value}
                onChange={(e) => {
                  setText(e.target.value)
                }}
              ></Input>
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              top: isHeader ? 40 + 'px' : -40 + 'px'
            }}
          >
            {state.current ? (
              <Space>
                <Popover
                  placement='topLeft'
                  content={dialogContenet}
                  visible={modelOpen}
                  trigger='click'
                  onVisibleChange={handleVisibleChange}
                >
                  <Button onClick={openInsert}>
                    {context.showPage ? '页码设置' : '插入页码'}
                  </Button>
                </Popover>
                {context.showPage ? (
                  <Button onClick={delInsert}>删除页码</Button>
                ) : null}
                <Button onClick={exit}>退出编辑</Button>
              </Space>
            ) : null}
          </div>
          {context.showPage ? (
            <div
              className='page-header-page-text'
              style={{ textAlign: direction }}
            >
              {pageText}
            </div>
          ) : null}
        </div>
      </Tooltip>
    </div>
  )
}
