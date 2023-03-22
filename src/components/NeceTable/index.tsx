import { Form, Pagination, PaginationProps, Table, TableProps } from "antd";
import React, { useEffect, useRef, useState } from "react";


export interface FetchParamsType {
  /**
   * 当前页
   */
  current?: number;
  /**
   * 当前页数
   */
  pageSize?: number;
}

interface NiceTableProps<T> extends Omit<TableProps<T>, "pagination"> {
  fetchDataSource?: (params: FetchParamsType) => Promise<any>;
  scroll?: { y: "100%" } | { x: "100%" };
  pagination?: PaginationProps | null;
  onPaginationChange?: (page: number, size: number) => void;
}

const NiceTable = React.forwardRef(
  <T extends {}>(props: NiceTableProps<T>, ref: any) => {
    const {
      fetchDataSource,
      onPaginationChange,
      scroll = { y: "100%" },
      pagination = {},
      ...restProps
    } = props;

    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState<any>([]);
    const pageSizeRef = useRef({
      current: 1,
      pageSize: 10,
    });

    /**
     *  初始化数据
     * @param params 
     */
    const getDataSource = async (params?: FetchParamsType) => {
      if (fetchDataSource && !("dataSource" in props)) {
        setLoading(true);
        const res = await fetchDataSource({
          ...pageSizeRef.current,
          ...params,
        });
        if (res) {
          setTableData(res);
        }
        setLoading(false);
      }
    };

    useEffect(() => {
      getDataSource();
    }, []);



    /**
     * 分页change
     * @param page 当前页
     * @param size 当前分页
     */
    const handlePaginationChange = (page: number, size: number) => {
      if (!("current" in (pagination as FetchParamsType))) {
        pageSizeRef.current = {
          ...pageSizeRef.current,
          current: page,
        };
      }
      if (!("pageSize" in (pagination as FetchParamsType))) {
        pageSizeRef.current = {
          ...pageSizeRef.current,
          pageSize: size,
        };
      }
      if (onPaginationChange) {
        onPaginationChange?.(page, size);
      }
      getDataSource();
    };


    const totalCount = pagination?.total || tableData.totalCount || 0
    const paginationProps: PaginationProps =  {
      size: "small",
      current: pageSizeRef.current.current,
      pageSize: pageSizeRef.current.pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ["10", "20", "50", "100"],
      onChange: handlePaginationChange,
      ...pagination,
      total: totalCount,
      showTotal: () => <></>,
    };

    return (
      <div style={{ width: '70%', height: '50%'}} >
        <Form></Form>
        <div>
          <Table
            loading={loading}
            dataSource={tableData.data ?? tableData}
            {...restProps}
            pagination={false}
            scroll={scroll}
          />
        </div>
        <div>
          <Pagination {...paginationProps} />
        </div>
      </div>
    );
  }
);

export default NiceTable;
