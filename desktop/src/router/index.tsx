
import React, { Suspense, lazy, ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import { AppstoreOutlined, BarChartOutlined, OrderedListOutlined, FileSearchOutlined, RadarChartOutlined, MedicineBoxOutlined, ThunderboltOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { Loading } from '@/src/components/loading';

// 懒加载组件定义
const Home = lazy(() => import('../pages/home'));
const VisitorStats = lazy(() => import('../pages/visitorStats'));
const Performance = lazy(() => import('../pages/performance'));
const PerformanceSearch = lazy(() => import('../pages/performanceSearch'));
const HttpError = lazy(() => import('../pages/httpError'));
const HttpSearch = lazy(() => import('../pages/httpSearch'));
const JsError = lazy(() => import('../pages/jsError'));
const TopAnalyse = lazy(() => import('../pages/topAnalyse'));
const GeographicalDistribution = lazy(() => import('../pages/geographicalDistribution'));
const Login = lazy(() => import('../pages/login'));
const Content = lazy(() => import('../pages/content'));
const NotFound = lazy(() => import('@/src/pages/notFound'));

// 封装 Suspense，返回函数组件（用于 Component 属性）
const withSuspense = (Component: ComponentType) => {
  // WithSuspense是函数组件FC，因此可以作为Component属性
  const WithSuspense = () => (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
  WithSuspense.displayName = `withSuspense(${Component.displayName || Component.name || 'Component'})`;
  return WithSuspense;
};

export const munuRouters = [
  {
    path: '/',
    name: '应用列表',
    icon: AppstoreOutlined,
    Component: withSuspense(Home),
  },
];

export const hasAppRouters = [
  {
    path: '/visitorStats',
    name: '流量分析',
    icon: BarChartOutlined,
    Component: withSuspense(VisitorStats),
  },
  {
    path: '/performance',
    name: '性能分析',
    icon: ThunderboltOutlined,
    Component: withSuspense(Performance),
  },
  {
    path: '/performanceSearch',
    name: '首屏查询',
    icon: FileSearchOutlined,
    Component: withSuspense(PerformanceSearch),
  },
  {
    path: '/httpError',
    name: '接口分析',
    icon: NodeIndexOutlined,
    Component: withSuspense(HttpError),
  },
  {
    path: '/httpSearch',
    name: '接口查询',
    icon: FileSearchOutlined,
    Component: withSuspense(HttpSearch),
  },
  {
    path: '/jsError',
    name: '健康情况',
    icon: MedicineBoxOutlined,
    Component: withSuspense(JsError),
  },
  {
    path: '/topAnalyse',
    name: 'Top分析',
    icon: OrderedListOutlined,
    Component: withSuspense(TopAnalyse),
  },
  {
    path: '/geographicalDistribution',
    name: '地域分布',
    icon: RadarChartOutlined,
    Component: withSuspense(GeographicalDistribution),
  },
];

export const routes: RouteObject[] = [
  {
    path: '/login',
    Component: withSuspense(Login),
  },
  {
    path: '/',
    Component: withSuspense(Content),
    children: [
      ...munuRouters,
      ...hasAppRouters,
      {
        path: '/*',
        Component: withSuspense(NotFound),
      },
    ],
  },
  {
    path: '/test',
    Component: withSuspense(Home),
  },
  {
    path: '*',
    Component: withSuspense(NotFound),
  },
];


