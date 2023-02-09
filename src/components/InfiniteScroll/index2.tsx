import React, { createElement, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'


interface Props {
  /** 页面初始页 */
  pageStart?: number,
  /** 获取 parentElement 的回调  */
  getScrollParent?: () => HTMLElement | null,
  /** 是否以 window 作为 scrollEl */
  useWindow?: boolean,
  /** 是否为相反的无限滚动 */
  isReverse?: boolean,
  /** offset 临界值，小于则开始加载 */
  threshold?: number,
  /** 显示 Loading 的元素 */
  loader: ReactNode,
  /** 加载更多的回调 */
  loadMore: (pageLoaded: number) => void,
  /** 是否注册为捕获事件 */
  useCapture?: boolean,
  /** 是否还有更多可以加载 */
  hasMore?: boolean,
  /** 是否第一次就加载 */
  initialLoad?: boolean,
  /** 获取要滚动的元素 */
  ref?: (node: HTMLElement | null) => void,
  /** 元素 tag 名  */
  element?: string,

  children: React.ReactNode
}

interface EventListenerOptions {
  Capture: boolean
  passive: boolean
}

const InfiniteScroll: React.FC<Props> = (props) => {
  const {
    pageStart,
    getScrollParent,
    useWindow,
    isReverse,
    threshold,
    loader,
    loadMore,
    useCapture,
    hasMore,
    initialLoad,
    ref,
    element,
    children
  } = props

  const scrollComponentRef = useRef<HTMLElement | null>(null) // 当前滚动的组件
  const [eventOptions, setEventOptions] = useState<any>({})
  const [beforeScrollTop, setBeforeScrollTop] = useState<number>(0)
  const [beforeScrollHeight , setBeforeScrollHeight ] = useState<number>(0)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const pageLoadedRef = useRef<number>(0) 

  const getParentElement = (node: HTMLElement | null): HTMLElement | null => {
    const scrollParentNode =  getScrollParent && getScrollParent()

    if (scrollParentNode) {
      return scrollParentNode
    }
    return node && node.parentElement
  }


  const calculateOffset = (node: HTMLElement | null, scrollTop: number) => {
    if (!node) return 0

    return calculateTopPosition(node) + (node.offsetHeight - scrollTop - window.innerHeight)
  }

  const calculateTopPosition = (node: HTMLElement | null): number => {
    if (!node) return 0

    return node.offsetTop + calculateTopPosition(node.offsetParent as HTMLElement)
  }

  const detachListeners = () => {
    const scrollEl = useWindow ? window : getParentElement(scrollComponentRef.current)

    if (!scrollEl) return

    scrollEl.removeEventListener('scroll', scrollListener, eventOptions)
    scrollEl.removeEventListener('resize', scrollListener, eventOptions)
  }

  const scrollListener = () => {
    const el = scrollComponentRef.current
    if (!el) return

    const parentElement  = getParentElement(el)
    if (!parentElement) return 
    let offset

    if (useWindow) {
      const doc = document.documentElement || document.body.parentElement || document.body
      const scrollTop = window.pageYOffset || doc.scrollTop

      offset = isReverse ? scrollTop : calculateOffset(el, scrollTop)

    } else {
      offset = isReverse ? parentElement.scrollTop : el.scrollHeight - parentElement.scrollTop - parentElement.clientHeight
    }
    // 是否到达阈值，是否可见
    if (offset < (threshold || 300 ) && (el && el.offsetParent !== null) ) {
      detachListeners()
      setBeforeScrollHeight(parentElement.scrollHeight)
      setBeforeScrollTop(parentElement.scrollTop)
      if ( typeof loadMore === 'function') {
        loadMore(pageLoadedRef.current + 1)
        setLoadingMore(true)
      }
    } 
  }

  const isPassiveSupported = () => {
    let passive = false

    const testOptions  = {
      get passive() {
        passive = true
        return true
      }
    }

    try {
      const testListener = () => {}
      document.addEventListener('test', testListener, testOptions)
      // @ts-ignore 仅用于测试是否可以使用 passive listener
      document.removeEventListener('test', testListener, testOptions)
    } catch (e) {
      console.error(e)
    }
    return passive
  }

  const getEventListenerOptions = () => {
    const options: EventListenerOptions  = { Capture: useCapture || false, passive: false }

    if (isPassiveSupported()) {
      options.passive = true
    }

    return options
  }

  const mousewheelListener = (e: Event) => {
    // @ts-ignore mousewheel 事件里存在 deltaY
    if (e.deltaY === 1 && isPassiveSupported()) {
      e.preventDefault()
    }
  }

  const attachListeners = () => {
    const parentElement = getParentElement(scrollComponentRef.current)

    if (!parentElement || !hasMore) return

    const scrollEl = useWindow ? window : parentElement

    scrollEl.addEventListener('mousewheel',mousewheelListener, eventOptions)
    scrollEl.addEventListener('scroll', scrollListener, eventOptions)
    scrollEl.addEventListener('resize', scrollListener, eventOptions)

    if (initialLoad) {
      scrollListener()
    }
    debugger
  }

  const detachMousewheelListener = () => {
    const scrollEl = useWindow ? window : scrollComponentRef.current?.parentElement

    if (!scrollEl) return

    scrollEl.removeEventListener('mousewheel', mousewheelListener, eventOptions)
  }

  // useEffect(() => {
  //   scrollListener()
  //   getEventListenerOptions()
  //   return () => {
  //     detachListeners()
  //     detachMousewheelListener()
  //   }
  // }, [])


  // useLayoutEffect(() => {
  //   pageLoadedRef.current= pageStart || 0
  //   setEventOptions(getEventListenerOptions())
  //   attachListeners()
  // })


  useEffect(() => {
    if (isReverse && loadingMore) {
      const parentElement =  getParentElement(scrollComponentRef.current)
      if (parentElement) {
        parentElement.scrollTop = parentElement.scrollHeight - beforeScrollHeight + beforeScrollTop
        setLoadingMore(false)
      }
    }
    attachListeners()
  }, [isReverse, loadingMore])

  const childrenArray = [children]
  if (hasMore && loader) {
    isReverse ? childrenArray.unshift(loader) : childrenArray.push(loader)
  }
  const passProps = {
    ...props,
    ref: (node: HTMLElement | null) => {
      scrollComponentRef.current = node
      if (ref) {
        ref(node)
      }
    }
  }

  return (
    <div>
      {createElement(element || 'div', passProps, childrenArray)}
    </div>
  )
}

InfiniteScroll.defaultProps = {
  pageStart: 0,
  getScrollParent: () => null,
  useWindow: true,
  isReverse: false,
  threshold: 300,
  useCapture: false,
  hasMore: true,
  initialLoad: true,
  element: 'div'
}

export default InfiniteScroll
