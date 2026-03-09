type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: { [eventName: string]: EventCallback[] } = {};

  subscribe(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }
  // 单次订阅，触发过就取消订阅
  once(eventName: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.unsubscribe(eventName, onceCallback);
    };
    // 实际订阅的是临时函数，在执行callback后就手动取消订阅，实现单次订阅效果
    this.subscribe(eventName, onceCallback);
  }

  publish(eventName: string, ...args: any[]): void {
    const callbacks = this.events[eventName];
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...args);
      });
    }
  }

  unsubscribe(eventName: string, callbackToDelete?: EventCallback): void {
    const callbacks = this.events[eventName];
    if (callbackToDelete) {
      this.events[eventName] = callbacks.filter((callback) => callback !== callbackToDelete);
    } else {
      this.events[eventName] = [];
    }
  }
}

const eventBus = new EventBus();


interface ShowHttpDetailQuery {
  link?: string;
  requestType?: 'done' | 'error' | string;
  beginTime?: string;
  endTime?: string;
  open?: boolean;
}
export const showHttpDetail = {
  eventKey: 'showHttpDetail',
  subscribe(fn: (query: ShowHttpDetailQuery) => void) {
    eventBus.subscribe(this.eventKey, fn);
  },
  unsubscribe() {
    eventBus.unsubscribe(this.eventKey);
  },
  publish(data: ShowHttpDetailQuery) {
    eventBus.publish(this.eventKey, data);
  },
};
