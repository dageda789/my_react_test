
import React, {useEffect, useState} from 'react'
import InfiniteScroll from '../components/InfiniteScroll/index2';

type AsyncFn = () => Promise<void>


let counter = 0

const DivScroller = () => {
  const [items, setItems] = useState<string[]>([]);
  const delay = (asyncFn: AsyncFn) => new Promise<void>(resolve => {
    setTimeout(() => {
      asyncFn().then(() => resolve)
    }, 1500)
  })

  const fetchMore = async () => {
    await delay(async () => {
      const newItems = []

      for (let i = counter; i < counter + 150; i++) {
        newItems.push(`Counter: ${i} |||| ${new Date().toISOString()}`)
      }
      setItems([...items, ...newItems])

      counter += 150
    })
  }

  useEffect(() => {
    fetchMore().then()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{border: '1px solid blue'}}>
      <InfiniteScroll
        useWindow
        threshold={300}
        loadMore={fetchMore}
        loader={<div className="loader" key={0}>Loading ...</div>}
      >
        {items.map(item => <div key={item}>{item}</div>)}
      </InfiniteScroll>
    </div>
  )
}

export default DivScroller
