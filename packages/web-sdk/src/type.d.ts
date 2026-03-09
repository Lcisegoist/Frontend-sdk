export interface PageMsg {
  /** 是否是首屏 */
  isFirst?: boolean;
  /** 域名 */
  domain: string;
  /** 网页链接 */
  pageUrl: string;
  /** 请求参数 */
  query: string;
}

export interface PageStatus {
  /** 页面进入时间 */
  inTime: number;
  /** 离开页面时间 */
  leaveTime: number;
  /** 页面停留时间 */
  residence: number;
}

export interface ClickReportMsg {
  type: 'click';
  clickElement: string;
}

export interface PerfamceReportMsg {
  type: 'performance';
  /** 页面Dns解析时长 */
  dnsTime: number;
  /** 页面TCP链接时长 */
  tcpTime: number;
  /** 页面白屏时间 */
  whiteTime: number;
  /** 首次内容 */
  fcp: number;
  /** 首字节时间 */
  ttfb: number;
  /** 最大内容绘制 */
  lcp: number;
  /** 用户首次与页面交互 */
  fid: number;
  /** 资源加载数据 */
  rescources: ResourceStatus[];
}

export interface ResourceStatus {
  /** 资源链接 */
  resource: string;
  /** 资源请求耗时 */
  duration: number;
  /** 资源大小 */
  size: number;
  /** 资源类型 */
  type: string;
}

export type RequestReportMsg = {
  type: 'request';
  url: string;
  method: string;
  reqHeaders: string; // 请求头
  reqBody: string; // url参数
  status: number;
  requestType: 'done' | 'error';
  cost: number; // 耗时
}

export type JsErrorReportMsg = {
  type: 'jsError';
  message: string;
  colno: number;
  lineno: number;
  stack: string;
  filename: string;
}

export type LoadResourceErrorReportMsg = {
  type: 'loadResourceError';
  resourceType: string;
  resourceUrl: string;
}

export type RejectErrorReportMsg = {
  type: 'rejectError';
  reason: 'string';
}

export interface PageStatusReportMsg extends PageStatus {
  type: 'pageStatus';
}

export type ReportItem = (
  | PerfamceReportMsg
  | PageStatusReportMsg
  | RequestReportMsg
  | JsErrorReportMsg
  | LoadResourceErrorReportMsg
  | RejectErrorReportMsg
  | ClickReportMsg
) & PageMsg & {
  userTimeStamp?: number;
  markUserId?: string;
  userId?: string;
  appId?: string;
}; // 上报类型+pageMsg+用户信息


export interface MonitorConfig {
  appId: string;
  cacheMax: number; // 缓存达到10条后上报
  webVitalsTimeouts?: number; // 性能指标超时时间
  api: string;
}
// History的所有方法
export interface Historys {
  back(): void;
  forward(): void;
  go(delta?: number): void;
  pushState(data: any, title: string, url?: string | null): void;
  replaceState(data: any, title: string, url?: string | null): void;
}

export type Listener = () => void
