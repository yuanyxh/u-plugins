/** 回弹动画时长 */
export const BOUNCE_TIME = 600;

/** 事件类型 */
export const eventType = {
  /**
   * @description 触摸事件类型 1
   */
  touchstart: 1,
  touchmove: 1,
  touchend: 1,
  touchcancel: 1,


  /**
   * @description 鼠标事件类型 2
   */
  mousedown: 2,
  mousemove: 2,
  mouseup: 2,

  /**
   * @description 指针事件类型 3
   */
  pointerdown: 3,
  pointermove: 3,
  pointerup: 3,

  /**
   * @description IE 指针事件类型 4
   */
  MSPointerDown: 3,
  MSPointerMove: 3,
  MSPointerUp: 3,

  /**
   * @description  app 端 onTouch 事件类型 5
   */
  onTouchstart: 4,
  onTouchmove: 4,
  onTouchend: 4,
  onTouchcancel: 4
};

/** start 事件类型 */
export const startEventType = ['touchstart', 'mousedown', 'pointerdown', 'MSPointerDown', 'onTouchstart'];

/** 暴露的事件 */
export const event = {
  SCROLL_TO_UPPER: 'scrolltoupper',
  SCROLL_TO_LOWER: 'scrolltolower',
  SCROLL: 'scroll',
  ON_SCROLL: 'onScroll',
  REFRESHER_PULLING: 'refresherpulling',
  REFRESHER_REFRESH: 'refresherrefresh',
  REFRESHER_RESTORE: 'refresherrestore',
  REFRESHER_ABORT: 'refresherabort'
}

/** 默认回弹动画事件函数 */
export const circular = {
  style: "cubic-bezier(0.1, 0.57, 0.1, 1)",
  fn: function(k) {
    return Math.sqrt(1 - --k * k);
  },
};

/** 特定回弹动画事件函数 */
export const quadratic = {
  style: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  fn: function(k) {
    return k * (2 - k);
  },
};


let timerId = 0;
/**
 * @param {number} time
 * @param {Function} fn
 */
export function debounce(time, fn) {
  if (timerId) {
    clearTimeout(timerId);
  }

  timerId = setTimeout(() => {
    timerId = 0;
    fn.apply(this, Array.from(arguments).slice(2));
  }, time);
}