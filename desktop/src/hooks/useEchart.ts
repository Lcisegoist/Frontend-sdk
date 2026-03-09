import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import * as loadsh from 'lodash';

export const useEchart = () => {
  const ref = useRef();
  const chartRef = useRef<echarts.ECharts>();

  useEffect(() => {
    // 当dom元素挂载好后
    if (ref.current) {
      const chart = echarts.init(ref.current);
      chartRef.current = chart;
      // dom元素尺寸变化后自适应
      const resizeObserver = new ResizeObserver(loadsh.throttle(() => {
        setTimeout(() => {
          chart.resize();
        }, 0);
      }, 20));
      resizeObserver.observe(ref.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [ref.current]);

  const setOption = async (option: any) => {
    // 将setOption推到宏任务队列，保证chartRef初始化完成
    setTimeout(() => {
      chartRef.current.setOption(option);
    }, 0);
  };

  return { ref, setOption, chartCurrent: chartRef.current };
};
