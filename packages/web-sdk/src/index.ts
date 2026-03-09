import { onFID, onLCP, onFCP, onTTFB } from 'web-vitals/attribution';
import { _history } from './history';
import { generateShortUUID, getUrlQuery } from './utils';
import type { JsErrorReportMsg, ResourceStatus, MonitorConfig, PerfamceReportMsg, PageMsg, PageStatus, RequestReportMsg, ReportItem } from './type';
export class Monitor {
  // static静态属性，所有实例共享
  static config: MonitorConfig;
  static userId: string;

  // 私有属性，每个实例独立
  private performance: PerfamceReportMsg;

  private firstPageMsg: PageMsg;

  private lastPageMsg: PageMsg;

  private curPageStatus: PageStatus;

  private reportStack: ReportItem[];

  private markUserId: string; // 匿名用户ID


  constructor(config: MonitorConfig) {
    Monitor.config = config;
    // 从本地存储中获取markUserId,如果不存在则随机生成一个
    const markUserId = window.localStorage.getItem(`web-watch-dog-markUserId-${Monitor.config.appId}`);
    if (markUserId) {
      this.markUserId = markUserId;
    } else {
      const id = generateShortUUID();
      window.localStorage.setItem(`web-watch-dog-markUserId-${Monitor.config.appId}`, id);
      this.markUserId = id;
    }

    Monitor.userId = window.localStorage.getItem(`web-watch-dog-userId-${Monitor.config.appId}`);

    this.performance = {
      type: 'performance',
      dnsTime: 0,
      tcpTime: 0,
      whiteTime: 0,
      fcp: 0,
      ttfb: 0,
      lcp: 0,
      fid: 0,
      rescources: [],
    };

    this.firstPageMsg = Object.assign({ isFirst: true }, getUrlQuery());

    this.reportStack = [];

    this.caughtError();

    // 拦截xmlhttp和fetch请求
    this.resetXmlHttp();

    this.resetFetch();

    this.catchRouterChange();

    this.lastPageMsg = Object.assign({ isFirst: false }, getUrlQuery());

    this.curPageStatus = {
      inTime: new Date().getTime(),
      leaveTime: 0,
      residence: 0,
    };

    window.addEventListener('load', async () => {
      const endTime = window.performance.now();
      const [data] = window.performance.getEntriesByType('navigation');
      this.performance.whiteTime = endTime - data.startTime;
      this.getWebPerformance();
    });

    window.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const getTagMsg = (tag) => {
        if (tag) {
          const className = tag.getAttribute('class');
          const id = tag.getAttribute('id');
          const tagName = tag.tagName.toLocaleLowerCase(); // h1,div,span ...
          return `${tagName}${id ? `#${id}` : ''}${className ? `.${className}` : ''}`;
        }
      };

      const track = [getTagMsg(target)];
      let curTarget = event.target as any;
      while (curTarget && curTarget.parentNode !== document) {
        track.unshift(getTagMsg(curTarget.parentNode));
        curTarget = curTarget.parentNode;
      }

      this.toReport({
        type: 'click',
        clickElement: track.join('>'),
        ...this.getPageMsg(),
      });
    }, true);

    window.onbeforeunload = () => {
      const { api } = Monitor.config;
      const img = document.createElement('img');
      const curTime = new Date().getTime();
      // 这里不用toReport是因为有可能reportStack还没达到cacheMax无法触发img beacon上报，手动img上报把剩下的数据上报
      this.reportStack.push({
        type: 'pageStatus',
        appId: Monitor.config.appId,
        userTimeStamp: new Date().getTime(),
        markUserId: this.markUserId,
        userId: Monitor.userId,
        ...this.lastPageMsg,
        ...{
          ...this.curPageStatus,
          leaveTime: curTime,
          residence: curTime - this.curPageStatus.inTime,
        },
      });
      img.src = `${api}?data=${encodeURIComponent(JSON.stringify(this.reportStack))}&appId=${Monitor.config.appId}`;
    };
  }

  private getPageMsg = () => Object.assign({ isFirst: false }, getUrlQuery());

  private catchRouterChange = () => {
    // 处理上一个页面的状态上报
    const dealWithPageInfo = () => {
      const curTime = new Date().getTime();
      const lastPageStatus = {
        ...this.curPageStatus,
        leaveTime: curTime,
        residence: curTime - this.curPageStatus.inTime,
      };
      // 更新当前页面状态
      this.curPageStatus = {
        inTime: curTime,
        leaveTime: 0,
        residence: 0,
      };
      // 上报上一页面状态
      this.toReport({
        type: 'pageStatus',
        ...this.lastPageMsg,
        ...lastPageStatus,
      });
      // 更新上一页面信息
      this.lastPageMsg = this.getPageMsg();
    };
    // 随后路由变化和hashchange时就上报上一页面状态
    _history.addEventListener(() => {
      dealWithPageInfo();
    });
    window.addEventListener('hashchange', () => {
      dealWithPageInfo();
    });
  };

  private toReport(data: ReportItem) {
    data.userTimeStamp = new Date().getTime();
    data.markUserId = this.markUserId;
    data.userId = Monitor.userId;
    data.appId = Monitor.config.appId;

    this.reportStack.push(data);
    // 缓存栈上报
    const { api, cacheMax } = Monitor.config;
    if (this.reportStack.length === cacheMax) {
      // 使用image Beacon上报，因为创建img会自动触发请求
      const img = document.createElement('img');
      img.src = `${api}?data=${encodeURIComponent(JSON.stringify(this.reportStack))}&appId=${Monitor.config.appId}`;
      this.reportStack = [];
    }
  }
  // 通过performance api获取页面性能数据
  private async getWebPerformance() {
    const [{ domainLookupEnd, domainLookupStart, connectEnd, connectStart }] = window.performance.getEntriesByType('navigation');
    this.performance.dnsTime = domainLookupEnd - domainLookupStart;
    this.performance.tcpTime = connectEnd - connectStart;
    const getWebvitals = (fn: (data: any) => void): Promise<number> => new Promise((resolve) => {
      const timerId = setTimeout(() => {
        resolve(0); // 超时返回0
      }, Monitor.config.webVitalsTimeouts);
      fn((data) => {
        clearTimeout(timerId);
        resolve(data.value);
      });
    });
    this.performance.rescources = this.getEnteries();
    const [fcp, ttfp, lcp, fid] = await Promise.all([
      getWebvitals(onFCP),
      getWebvitals(onTTFB),
      getWebvitals(onLCP),
      getWebvitals(onFID),
    ]);
    this.performance.fcp = fcp;
    this.performance.ttfb = ttfp;
    this.performance.lcp = lcp;
    this.performance.fid = fid;
    this.toReport({
      type: 'performance',
      ...this.firstPageMsg,
      ...this.performance,
    });
  }

  private getEnteries() {
    const resources = window.performance.getEntriesByType('resource');
    return resources.map((item) => ({
      resource: item.name,
      duration: item.duration,
      size: item.decodedBodySize, // 解码后的资源大小
      type: item.initiatorType,
    }));
  }

  private caughtError() {
    const monitor = this;
    window.addEventListener(
      'error',
      (error: ErrorEvent | Event) => {
        // js执行错误
        if (error instanceof ErrorEvent) {
          console.log(error);

          monitor.toReport({
            ...monitor.getPageMsg(),
            type: 'jsError',
            message: error.message,
            stack: error.error.stack,
            colno: error.colno,
            lineno: error.lineno,
            filename: error.filename,
          });
        } else {
          // 资源加载错误
          const { type, target } = error as any;
          monitor.toReport({
            ...monitor.getPageMsg(),
            type: 'loadResourceError',
            resourceType: type,
            resourceUrl: target.src,
          });
        }
      },
      true
    );

    window.addEventListener('unhandledrejection', (error) => {
      this.toReport({
        type: 'rejectError',
        reason: error.reason.toString(),
        ...monitor.getPageMsg(),
      });
    });
  }

  private resetXmlHttp() {
    if (!window.XMLHttpRequest) return;
    const xmlhttp = window.XMLHttpRequest;

    const monitor = this;

    const originOpen = xmlhttp.prototype.open;

    // 重写XMLHttpRequest的open方法，插入上报请求信息的逻辑
    xmlhttp.prototype.open = function (args) {
      const xml = this as XMLHttpRequest;
      const url = args[1];
      const method = args[0];
      const isGet = method.toLocaleLowerCase() === 'get';
      const reqUrl = isGet ? url.split('?')[0] : url;

      const config: RequestReportMsg = {
        type: 'request',
        url: reqUrl,
        method: args[0].toLocaleLowerCase(),
        reqHeaders: '',
        reqBody: '',
        status: 0,
        requestType: 'done',
        cost: 0,
      };

      config.reqBody = method.toLocaleLowerCase() === 'get' ? url.split('?')[1] : '';

      let startTime;

      const originSend = xml.send;

      const originSetRequestHeader = xml.setRequestHeader;

      const requestHeader = {};
      xml.setRequestHeader = function (key: string, val: string) {
        requestHeader[key] = val; // 偷窥记录请求头
        return originSetRequestHeader.apply(xml, [key, val]);
      };

      xml.send = function (args: Document | XMLHttpRequestBodyInit) {
        if (args) {
          config.reqBody = typeof args === 'string' ? args : JSON.stringify(args);
        }
        return originSend.apply(xml, [args]);
      };

      xml.addEventListener('readystatechange', function (ev: Event) {
        if (this.readyState === XMLHttpRequest.DONE) {
          config.status = this.status;
          config.cost = performance.now() - startTime;
          config.reqHeaders = JSON.stringify(requestHeader);
          config.requestType = this.status < 200 || this.status >= 300 ? 'error' : 'done';
          monitor.toReport({
            type: 'request',
            ...monitor.getPageMsg(),
            ...config,
          });
        }
      });
      xml.addEventListener('loadstart', function (data: ProgressEvent<XMLHttpRequestEventTarget>) {
        startTime = performance.now();
      });
      // xml.addEventListener('error', function(data: ProgressEvent<XMLHttpRequestEventTarget>){
      //   console.log('error', config.url);

      //   config.requestType = 'error';
      //   config.status = this.status;
      //   config.cost = performance.now() - startTime;
      //   config.reqHeaders = JSON.stringify(requestHeader);
      //   // monitor.toReport({
      //   //   type: 'request',
      //   //   ...monitor.getPageMsg(),
      //   //   ...config,
      //   // });
      // });
      return originOpen.apply(this, args);
    };
  }

  private resetFetch() {
    const _oldFetch = window.fetch;
    window.fetch = (...args) => {
      let url: string;
      let options: RequestInit = {};

      // 处理不同的 fetch 调用方式
      if (typeof args[0] === 'string') {
        url = args[0];
        options = args[1] || {};
        // 2.fetch(Request)
      } else if (args[0] instanceof Request) {
        url = (args[0] as Request).url;
        options = (args[0] as Request);
      } else {
        url = String(args[0]);
      }

      const startTime = performance.now();
      const data: RequestReportMsg = {
        type: 'request',
        url,
        method: options.method ? options.method.toLocaleLowerCase() : 'get',
        reqHeaders: options.headers ? JSON.stringify(options.headers) : '',
        reqBody: options.body ? JSON.stringify(options.body) : '',
        status: 0,
        requestType: 'done',
        cost: 0,
      };
      return new Promise((resolve, reject) => {
        _oldFetch
          .apply(window, args)
          // fetch正常执行，使用monkey patch上报请求信息
          .then((res) => {
            const endTime = performance.now();
            data.cost = endTime - startTime;
            data.status = res.status;
            data.requestType = res.ok ? 'done' : 'error';
            this.toReport({
              type: 'request',
              ...this.getPageMsg(),
              ...data,
            });
            resolve(res);
          })
          .catch((error: any) => {
            const endTime = performance.now();
            data.cost = endTime - startTime;
            data.status = 0;
            data.requestType = 'error';
            this.toReport({
              type: 'request',
              ...this.getPageMsg(),
              ...data,
            });
            reject(error);
          });
      });
    };
  }

  static setUserId(userId: string) {
    window.localStorage.setItem(`web-watch-dog-userId-${Monitor.config.appId}`, userId);
  }
}

export type { JsErrorReportMsg, ResourceStatus, PerfamceReportMsg, PageMsg, PageStatus, RequestReportMsg, ReportItem };
