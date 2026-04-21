var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator['throw'](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useState } from 'react';
import { Card, Radio, Table } from 'antd';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { getHttpDoneRank } from '@/src/api';
import { TableItem } from '@/src/components/tableItem';
import { showHttpDetail } from '@/src/utils/enventBus';
export const HttpSlow = () => {
    const [day, setDay] = useState(1);
    const { active } = useSelector((state) => state.app);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const columns = [
        {
            title: '接口URL',
            dataIndex: 'url',
            key: 'url',
            width: 200,
            render: (val) => TableItem.renderUrl(val, 40, false),
        },
        {
            title: '请求方法',
            dataIndex: 'method',
            key: 'method',
            width: 100,
        },
        {
            title: '访问量',
            dataIndex: 'count',
            key: 'count',
            width: 100,
        },
        {
            title: '平均响应时间',
            dataIndex: 'cost',
            key: 'cost',
            width: 100,
            render: (val) => TableItem.renderHttpCost(val),
        },
        {
            title: '操作',
            width: 120,
            render: (_, record) => React.createElement('a', { onClick: () => {
                    showHttpDetail.publish({
                        link: record.url,
                        requestType: 'done',
                        beginTime: dayjs().add(-(day - 1), 'day').format('YYYY-MM-DD:00:00:00'),
                        endTime: dayjs().format('YYYY-MM-DD 23:59:59'),
                    });
                } }, '\u67E5\u770B\u8BE6\u60C5'),
        },
    ];
    const getData = () => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(true);
        const { data } = yield getHttpDoneRank({
            appId: active,
            beginTime: dayjs().add(-(day - 1), 'day').format('YYYY-MM-DD:00:00:00'),
            endTime: dayjs().format('YYYY-MM-DD 23:59:59'),
        });
        const result = data.map((item) => (Object.assign({ count: item.doc_count, cost: item.avg_cost.value }, item.key)));
        setData(result);
        setLoading(false);
    });
    useEffect(() => {
        if (active) {
            getData();
        }
    }, [active, day]);
    return (React.createElement(Card, { style: { boxShadow: '0px 1px 5px 0px rgba(0, 21, 41, 0.11)' }, title: '\u6162\u54CD\u5E94Top50', extra: React.createElement(Radio.Group, { value: day, onChange: (e) => {
                setDay(e.target.value);
            }, size: 'small' },
            React.createElement(Radio.Button, { value: 7 }, '7\u5929\u5185'),
            React.createElement(Radio.Button, { value: 3 }, '3\u5929\u5185'),
            React.createElement(Radio.Button, { value: 1 }, '\u4ECA\u5929')) },
        React.createElement(Table, { sticky: true, rowKey: 'url', loading: loading, columns: columns, dataSource: data, pagination: {
                total: data.length,
                pageSize: 10,
            }, scroll: { x: 1300 } })));
};
