import React from 'react';
import NiceTable, { FetchParamsType } from './components/NeceTable';
// import NiceForm from './components/NiceForm';
// import DivScroller from './examples/WindowScroller';



const App: React.FC = () => {

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
  ];
  const getDatas = async(params: FetchParamsType) => {
   let arr = []
   const {current, pageSize} = params

   for (let i = 0; i < current! * pageSize!; i ++) {
    arr.push({
      key: i,
      name: `Edward King ${i}`,
      age: `1${i}`,
      address: `London, Park Lane no. ${i}`,
    })
   }

   return {
    data: arr,
    totalCount: arr.length
   }

  }



  return (
    <div>
      {/* <DivScroller /> */}
    测试组件
    <NiceTable
      fetchDataSource={(params) => getDatas(params as  FetchParamsType )}
      columns={columns}
      />
    </div>
  );
};
export default App;
