import { PaginationProps, Table } from 'antd'
import React from 'react'

const dataSource = [
  {
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
  },
];


const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
  },
];

  const NiceTable = React.forwardRef(() => {

    const paginationProps: PaginationProps  =  {
      size: 'small',
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: () => <></>
    }


    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        // pagination
        />

    )
  })


export default NiceTable;