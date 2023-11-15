<template>
  <scroll-view
    class="scroller-container"
    :style="scrollerStyle"
    :scroll-x="scrollX"
    :scroll-y="scrollY"
    :scroll-top="scrollTop"
    :scroll-left="scrollLeft"
    :upper-threshold="upperThreshold"
    :lower-threshold="lowerThreshold"
    :scroll-into-view="scrollIntoView"
    :scroll-with-animation="scrollWithAnimation"
    :enable-back-to-top="enableBackToTop"
    :show-scrollbar="showScrollbar"
    :refresher-enabled="refresherEnabled"
    :refresher-threshold="refresherThreshold"
    :refresher-default-style="refresherDefaultStyle"
    :refresher-background="refresherBackground"
    :refresher-triggered="refresherTriggered"
    :enable-flex="enableFlex"
    :scroll-anchoring="scrollAnchoring"
    @transitionend="handleTransitionend"
    @scrolltoupper="handleEvent"
    @scrolltolower="handleEvent"
    @scroll="handleEvent"
    @refresherpulling="handleEvent"
    @refresherrefresh="handleEvent"
    @refresherrestore="handleEvent"
    @refresherabort="handleEvent"
    @touchstart="handleStart"
    @touchmove="handleMove"
    @touchend="handleEnd"
    @touchcancel="handleCancel"
    @mousedown="handleStart"
    @mousemove="handleMove"
    @mouseup="handleEnd"
  >
    <view class="scroller">
      <slot name="default"></slot>
    </view>
  </scroll-view>
</template>

<script>
import {
  BOUNCE_TIME,
  eventType,
  startEventType,
  event,
  circular,
  quadratic,
  debounce
} from './scroll-view-bounce.js';

/** 滚动容器 rect */
let scrollerContainerRect = {
  left: 0,
  top: 0,
  width: 0,
  height: 0
};
/** 滚动目标 rect */
let scrollerRect = {
  left: 0,
  top: 0,
  width: 0,
  height: 0
};
/** 到顶 */
let isTop = false;
/** 到底 */
let isBottom = false;
/** 是否滚动恢复状态, 防止 scroll-view 内置滚动时快速触发回弹导致卡顿 */
let isScrollRecover = false;
/** 是否在过渡中 */
let isInTransition = false;
/** 开始时间 */
let startTime = 0;
/** 结束时间 */
let endTime = 0;
/** 当前事件类型，同属一组的事件数据一致，(touchstart, touchmove, touchend) */
let initiated = 0;
/** 是否移动中 */
let moved = false;
/** x 点 */
let x = 0;
/** y 点 */
let y = 0;
/** 开始 x 点 */
let startX = 0;
/** 开始 y 点 */
let startY = 0;
/** 页面 x 点 */
let pointX = 0;
/** 页面 y 点 */
let pointY = 0;
/** 区域 x 点 */
let distX = 0;
/** 区域 y 点 */
let distY = 0;
/** 方向 x 点 */
let directionX = 0;
/** 方向 y 点 */
let directionY = 0;

export default {
  data() {
    return {
      /** 到顶 */
      isTop: false,
      /** 到底 */
      isBottom: false,
      /** 过渡时间线函数 */
      transitionTimingFunction: circular.style,
      /** 过渡时长 */
      transitionTime: 0,
      /** 当前位置 */
      pos: {
        x: 0,
        y: 0
      }
    };
  },
  props: {
    /** 滚动容器高度 */
    height: {
      type: [String, Number],
      require: true
    },
    /** x 轴滚动 */
    scrollX: {
      type: Boolean,
      default: false
    },
    /** y 轴滚动 */
    scrollY: {
      type: Boolean,
      default: false
    },
    /** x 轴滚动距离 */
    scrollLeft: {
      type: Number,
      default: 0
    },
    /** y 轴滚动距离 */
    scrollTop: {
      type: Number,
      default: 0
    },
    /**
     *
     * uniapp scroll-view 属性
     * https://zh.uniapp.dcloud.io/component/scroll-view.html#scroll-view
     * */
    upperThreshold: {
      type: [Number, String],
      default: 50
    },
    lowerThreshold: {
      type: [Number, String],
      default: 50
    },
    scrollIntoView: {
      type: String
    },
    scrollWithAnimation: {
      type: Boolean,
      default: false
    },
    enableBackToTop: {
      type: Boolean,
      default: false
    },
    showScrollbar: {
      type: Boolean,
      default: false
    },
    refresherEnabled: {
      type: Boolean,
      default: false
    },
    refresherThreshold: {
      type: Number,
      default: 45
    },
    refresherDefaultStyle: {
      type: String,
      default: 'black'
    },
    refresherBackground: {
      type: String,
      default: '#FFF'
    },
    refresherTriggered: {
      type: Boolean,
      default: false
    },
    enableFlex: {
      type: Boolean,
      default: false
    },
    scrollAnchoring: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** 滚动容器样式 */
    scrollerStyle() {
      return {
        height: this.height,
        transform: `translate(${this.pos.x}px, ${this.pos.y}px) translateZ(0)`,
        transitionTimingFunction: this.transitionTimingFunction,
        transitionDuration: this.transitionTime + 'ms'
      };
    },
    /** 是否已经滚动到边界 */
    isBoundary() {
      return this.isTop || this.isBottom;
    }
  },
  watch: {
    isBoundary(val) {
      // 不在边界时触发回弹
      if (val === false) {
        this.translate(0, 0);
      }
    },
    height() {
      this.$nextTick(() => {
        this.getRect('.scroller-container').then((res) => {
          scrollerContainerRect = res;
        });
      });
    }
  },
  mounted() {
    // 获取滚动容器 rect
    this.getRect('.scroller-container').then((res) => {
      scrollerContainerRect = res;
    });
    // 获取滚动目标 rect
    this.getRect('.scroller').then((res) => {
      scrollerRect = res;
    });

    // mounted 时，判断当前是否是在边界
    this.$nextTick(() => {
      this.isTop = this.getTop(this.scrollTop);
      this.isBottom = this.getBottom(this.scrollTop, scrollerRect.height);
    });
  },
  methods: {
    /**
     *
     * @description 设置过渡时长
     * @param {number} time
     */
    setTransitionTime(time) {
      this.transitionTime = time;
    },
    /**
     *
     * @description 设置过渡时间线函数
     * @param {string} easing
     */
    setTransitionTimingFunction(easing) {
      this.transitionTimingFunction = easing;
    },
    /**
     *
     * @description 获取是否到顶部
     * @param {number} scrollTop
     */
    getTop(scrollTop) {
      return scrollTop === 0;
    },
    /**
     *
     * @description 获取是否到底部
     * @param {number} scrollTop
     * @param {number} scrollHeight
     */
    getBottom(scrollTop, scrollHeight) {
      return this.compared(scrollTop + scrollerContainerRect.height, scrollHeight);
    },
    /**
     *
     * @description 获取元素尺寸信息
     * @param {string} selector
     */
    getRect(selector) {
      return new Promise((resolve, reject) => {
        uni
          .createSelectorQuery()
          .in(this)
          .select(selector)
          .boundingClientRect()
          .exec((res) => {
            if (res[0]) {
              return resolve({
                ...res[0]
              });
            }

            reject('error in getRect function');
          });
      });
    },
    /**
     *
     * @description 向父组件发送消息
     * @param {string} type
     * @param {any} payload
     */
    emit(type, payload) {
      this.$emit(type, payload);
    },
    /**
     *
     * @description 统一运行环境
     * @param {string} type
     * @param {Function} fn
     */
    async runIn(type, fn) {
      if ((this.isTop || this.isBottom) === false) {
        return;
      }

      // if (isScrollRecover) {
      //   return;
      // }

      if (initiated === 0 && startEventType.includes(type)) {
        initiated = eventType[type];
      }

      if (initiated !== eventType[type]) {
        return;
      }

      fn.apply(this, Array.from(arguments).slice(2));
    },
    /**
     *
     * @description 重置 (回弹) 位置
     * @param {number} time
     */
    resetPosition(time = 0) {
      let _x = x;
      let _y = y;

      if (this.scrollX === false || x > 0) {
        _x = 0;
      } else if (x < 0) {
        // TODO: 判断条件后续可能需要修改
        _x = 0;
      }

      if (this.scrollY === false || y > 0) {
        _y = 0;
      } else if (y < 0) {
        // TODO: 判断条件后续可能需要修改
        _y = 0;
      }

      if (_x === x && _y === y) {
        return false;
      }

      this.scrollTo(_x, _y, time, circular);

      return true;
    },
    /**
     *
     * @description 计算目标点及到底目标点应该使用的时间
     * @param {number} current
     * @param {number} start
     * @param {number} time
     * @param {number} lowerMargin
     * @param {number} wrapperSize
     */
    momentum(current, start, time, lowerMargin, wrapperSize) {
      // 距离
      let distance = current - start;
      // 目的地
      let destination = 0;
      // 时长
      let duration = 0;

      // 阻尼系数
      const deceleration = 0.0006;
      // 速度
      const speed = Math.abs(distance) / time;

      destination = current + ((speed * speed) / (2 * deceleration)) * (distance < 0 ? -1 : 1);

      duration = speed / deceleration;

      if (destination < lowerMargin) {
        destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5) * (speed / 8) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
      } else if (destination > 0) {
        destination = wrapperSize ? (wrapperSize / 2.5) * (speed / 8) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
      }

      return {
        destination: Math.round(destination),
        duration: duration
      };
    },
    /**
     *
     * @description 移动元素
     * @param {number} _x
     * @param {number} _y
     */
    translate(_x, _y) {
      _x = Math.round(_x);
      _y = Math.round(_y);

      this.pos = {
        x: _x,
        y: _y
      };

      x = _x;
      y = _y;
    },
    /**
     *
     * @description 滚动到目标
     * @param {number} _x
     * @param {number} _y
     * @param {number} time
     * @param {object} easing
     */
    scrollTo(_x, _y, time = 0, easing) {
      isInTransition = time > 0;

      if (easing) {
        this.setTransitionTimingFunction(easing.style);
      }

      this.setTransitionTime(time);

      this.translate(_x, _y);
    },
    /**
     *
     * @description 对比两者相差距离是否小于一定量
     * @param {number} num
     * @param {number} num2
     */
    compared(num, num2) {
      const MAXIMUM_ALLOWABLE_VALUE = 10;

      return Math.abs(num - num2) <= MAXIMUM_ALLOWABLE_VALUE;
    },
    /**
     *
     * @description 统一事件管理
     * @param {CustomEvent} e
     */
    handleEvent(e) {
      this.emit(e.type, e);

      switch (e.type) {
        case event.SCROLL:
        case event.ON_SCROLL:
          this.handleScroll(e);
          break;
        default:
      }
    },
    /**
     *
     * @description 滚动处理程序
     * @param {CustomEvent} param0
     */
    handleScroll({ detail }) {
      this.isTop = this.getTop(detail.scrollTop);
      this.isBottom = this.getBottom(detail.scrollTop, detail.scrollHeight);

      if (
        (this.compared(scrollerRect.height, detail.scrollHeight) &&
          this.compared(scrollerRect.width, detail.scrollWidth)) === false
      ) {
        scrollerRect.width = detail.scrollWidth;
        scrollerRect.height = detail.scrollHeight;
      }

      // isScrollRecover = true;
      // debounce(300, () => (isScrollRecover = false));
    },
    /**
     *
     * @description 事件开始处理程序
     * @param {MouseEvent|TouchEvent} e
     */
    handleStart(e) {
      this.runIn(e.type, () => {
        // 获取触摸点
        const point = e.touches ? e.touches[0] : e;

        // 未移动
        moved = false;

        // 每次移动的距离
        distX = 0;
        distY = 0;

        // 计算方向
        directionX = 0;
        directionY = 0;

        // 获取开始时间
        startTime = Date.now();

        // 如果在滚动中，取消滚动
        if (isInTransition) {
          this.setTransitionTime(0);

          isInTransition = false;

          // 获取当前位置，以便暂停滚动，防止完全回弹
          // const {
          //   left,
          //   top
          // } = this.getRect('.scroller');

          // this.pos = {
          //   x: left,
          //   y: top
          // }

          this.translate(this.pos.x, this.pos.y);

          // scrollEnd 滚动结束
        }

        // 开始点
        startX = x;
        startY = y;

        // 此次事件点在页面上的位置
        pointX = point.pageX;
        pointY = point.pageY;

        // beforeScrollStart 滚动即将开始
      });
    },
    /**
     *
     * @description 移动中事件处理程序
     * @param {MouseEvent|TouchEvent} e
     */
    handleMove(e) {
      this.runIn(e.type, () => {
        // 当前点
        const point = e.touches ? e.touches[0] : e;

        // 距上次的偏移
        let deltaX = point.pageX - pointX;
        let deltaY = point.pageY - pointY;

        // 当前时间
        const timestamp = Date.now();

        // 新的位置
        let newX = 0;
        let newY = 0;

        // 绝对距离
        let absDistX = 0;
        let absDistY = 0;

        // 点在页面上的位置
        pointX = point.pageX;
        pointY = point.pageY;

        // 累计距离加上本次移动距离
        distX += deltaX;
        distY += deltaY;

        // 绝对偏移距离
        absDistX = Math.abs(distX);
        absDistY = Math.abs(distY);

        // 结束时间到现在必须大于 300ms, 且移动距离超过 10 像素
        if (timestamp - endTime > 300 && absDistX < 10 && absDistY < 10) {
          return;
        }

        // 判断是否需要锁定某个方向
        deltaX = this.scrollX ? deltaX : 0;
        deltaY = this.scrollY ? deltaY : 0;

        // 新的位置
        newX = x + deltaX;
        newY = y + deltaY;

        if (newX > 0) {
          newX = x + deltaX / 3;
        }

        if (newY > 0) {
          newY = y + deltaY / 3;
        }

        // 当前方向
        directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

        // 未移动
        if (moved === false) {
          // scrollStart 滚动开始
        }

        // 开始移动
        moved = true;

        // 改变位置
        this.translate(newX, newY);

        // 设置数据
        if (timestamp - startTime > 300) {
          startTime = timestamp;
          startX = x;
          startY = y;
        }
      });
    },
    /**
     *
     * @description 结束事件处理程序
     * @param {MouseEvent|TouchEvent} e
     */
    handleEnd(e) {
      this.runIn(e.type, () => {
        // 获取点
        const point = e.changedTouches ? e.changedTouches[0] : e;

        // 持续时长
        const duration = Date.now() - startTime;

        // 新的点
        let newX = Math.round(x);
        let newY = Math.round(y);

        // 距离
        const distanceX = Math.abs(newX - startX);
        const distanceY = Math.abs(newY - startY);

        // 时长
        let time = 0;

        // 时间线函数
        let easing = undefined;

        // 距上次移动偏移
        let momentumX = 0;
        let momentumY = 0;

        // 非过渡状态
        isInTransition = false;

        // isScrollRecover = false;

        // 重置事件
        initiated = 0;

        // 获取结束时间
        endTime = Date.now();

        // 如果重置位置
        if (this.resetPosition(BOUNCE_TIME)) {
          return;
        }

        // 滚动到新位置
        this.scrollTo(newX, newY);

        if (!moved) {
          // scrollCancel 滚动取消事件
          return;
        }

        // 持续时长小于 300ms
        if (duration < 300) {
          momentumX = this.scrollX
            ? this.momentum(
                x,
                startX,
                duration,
                0, // 原 this.maxScrollX
                scrollerContainerRect.height
              )
            : {
                destination: newX,
                duration: 0
              };

          momentumY = this.scrollY
            ? this.momentum(
                y,
                startY,
                duration,
                0, // 原 this.maxScrollY
                scrollerContainerRect.height
              )
            : {
                destination: newY,
                duration: 0
              };

          newX = momentumX.destination;
          newY = momentumY.destination;

          time = Math.max(momentumX.duration, momentumY.duration);

          isInTransition = true;
        }

        if (newX !== x || newY !== y) {
          if (newX > 0 || newY > 0) {
            easing = quadratic;
          }

          this.scrollTo(newX, newY, time, easing);

          return;
        }
        // scrollEnd 滚动结束事件
      });
    },
    /**
     *
     * @description 事件中断处理程序
     * @param {MouseEvent|TouchEvent} e
     */
    handleCancel(e) {
      this.handleEnd(e);
    },
    /**
     *
     * @description 过渡结束事件处理程序
     * @param {Event} e
     */
    handleTransitionend(e) {
      if (isInTransition === false) {
        return;
      }

      this.setTransitionTime(0);

      if (this.resetPosition(BOUNCE_TIME) === false) {
        isInTransition = false;

        // scrollEnd 滚动结束事件
      }
    }
  }
};
</script>

<style></style>
