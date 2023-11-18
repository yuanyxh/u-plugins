<template>
  <scroll-view
    id="scroller-container"
    class="scroller-container"
    :style="{ width: width, height: height }"

    :bounceScrollX="scrollX"
    :change:bounceScrollX="bounce.updateScrollX"
    :bounceScrollY="scrollY"
    :change:bounceScrollY="bounce.updateScrollY"

    :scroll-x="scrollX"
    :scroll-y="scrollY"
    :scrollLeft="scrollLeft"
    :scrollTop="scrollTop"
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

    @scrolltoupper="handleEvent"
    @scrolltolower="handleEvent"
    @scroll="handleEvent"
    @refresherpulling="handleEvent"
    @refresherrefresh="handleEvent"
    @refresherrestore="handleEvent"
    @refresherabort="handleEvent"

    @transitionend="bounce.handleTransitionend"
  >
    <view
      id="scroller"
      class="scroller"

      @touchstart="bounce.handleStart"
      @touchmove="bounce.handleMove"
      @touchend="bounce.handleEnd"
      @touchcancel="bounce.handleCancel"
      @mousedown="bounce.handleStart"
      @mousemove="bounce.handleMove"
      @mouseup="bounce.handleEnd"
    >
      <slot name="default"></slot>
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    /** 滚动容器宽度 */
    width: {
      type: [String, Number],
    },
    /** 滚动容器高度 */
    height: {
      type: [String, Number],
      require: true,
    },
    /** x 轴滚动 */
    scrollX: {
      type: Boolean,
      default: false,
    },
    /** y 轴滚动 */
    scrollY: {
      type: Boolean,
      default: false,
    },
    /** x 轴滚动距离 */
    scrollLeft: {
      type: Number,
      default: 0,
    },
    /** y 轴滚动距离 */
    scrollTop: {
      type: Number,
      default: 0,
    },
    /**
     *
     * uniapp scroll-view 属性
     * https://zh.uniapp.dcloud.io/component/scroll-view.html#scroll-view
     * */
    upperThreshold: {
      type: [Number, String],
      default: 50,
    },
    lowerThreshold: {
      type: [Number, String],
      default: 50,
    },
    scrollIntoView: {
      type: String,
    },
    scrollWithAnimation: {
      type: Boolean,
      default: false,
    },
    enableBackToTop: {
      type: Boolean,
      default: false,
    },
    showScrollbar: {
      type: Boolean,
      default: false,
    },
    refresherEnabled: {
      type: Boolean,
      default: false,
    },
    refresherThreshold: {
      type: Number,
      default: 45,
    },
    refresherDefaultStyle: {
      type: String,
      default: "black",
    },
    refresherBackground: {
      type: String,
      default: "#FFF",
    },
    refresherTriggered: {
      type: Boolean,
      default: false,
    },
    enableFlex: {
      type: Boolean,
      default: false,
    },
    scrollAnchoring: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
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
     * @description 统一事件管理
     * @param {CustomEvent} e
     */
    handleEvent(e) {
      this.emit(e.type, e);
    },
  },
};
</script>

<script module="bounce" lang="renderjs">

/**
 * TODO:
 * 
 * 1. 左右滚动回弹的行为未添加限制 (在最左侧时, 手指由右向左滑需要禁用 bounce 行为, 反之亦然)
 * 2. 列表数据量多时 (数量视列表项视图渲染、数据操作而定) 卡顿明显
 * 3. Chrome 极易误触下拉刷新
 * 4. 需要屏蔽 IOS 原生回弹效果 (H5 使用 iNoBounce, App 使用 uniapp 提供的配置)
 * 
*/

import {
  BOUNCE_TIME,
  eventType,
  startEventType,
  event,
  circular,
  quadratic,
  debounce
} from './scroll-view-bounce.js';

/** 当前位置 */
let ownnerPos = {
  x: 0,
  y: 0
}

/** 滚动容器 */
let scrollerContainer = null;
/** 滚动目标 */
let scroller = null;

/** x 轴最大滚动距离 */
let maxScrollX = 0;
/** y 轴最大滚动距离 */
let maxScrollY = 0;

/** 允许 x 轴滚动 */
let hasHorizontalScroll = false;
/** 允许 y 轴滚动 */
let hasVerticalScroll = false;

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
      bounceScrollX: false,
      bounceScrollY: false
    };
  },
  watch: {
    bounceScrollX() {
      this.refresh();
    },
    bounceScrollY(val) {
      this.refresh();
    }
  },
  /** init */
  mounted() {
    scrollerContainer = document.getElementById('scroller-container');
    scrollerContainer = scrollerContainer.getElementsByClassName('uni-scroll-view')[1];

    scroller = document.getElementById('scroller');

    this.setTransitionTime(circular.style);

    this.refresh();
  },
  methods: {
    /**
     *
     * @description 设置过渡时长
     * @param {number} time
     */
     setTransitionTime(time) {
      scrollerContainer.style['transitionDuration'] = time + 'ms';
    },
    /**
     *
     * @description 设置过渡时间线函数
     * @param {string} easing
     */
    setTransitionTimingFunction(easing) {
      scrollerContainer.style['transitionTimingFunction'] = easing;
    },
    /**
     *
     * @description 设置转换
     * @param {number} _x
     * @param {number} _y
     */
    setTransForm(_x, _y) {
      scrollerContainer.style['transform'] = `translate(${_x}px, ${_y}px) translateZ(0)`;
    },
    /**
     * @description 更新 x 轴是否可滚动
    */
    updateScrollX(n) {
      this.bounceScrollX = n;
    },
    /**
     * @description 更新 y 轴是否可滚动
    */
    updateScrollY(n) {
      this.bounceScrollY = n;
    },
    /**
     *
     * @description H5 端, 计算当前位置
    */
    getComputedPosition() {
      let matrix = window.getComputedStyle(scrollerContainer, null);

      let _x = 0;
      let _y = 0;

      matrix = matrix['transform'].split(")")[0].split(", ");

      _x = +(matrix[12] || matrix[4]);
      _y = +(matrix[13] || matrix[5]);

      return { x: _x, y: _y };
    },
    /**
     * @description 更新数据
    */
    refresh() {
      // #ifdef APP-PLUS
      hasHorizontalScroll = this.bounceScrollX;
      hasVerticalScroll = this.bounceScrollY;
      // #endif

      // #ifdef H5
      hasHorizontalScroll = this.scrollX;
      hasVerticalScroll = this.scrollY;
      // #endif

      endTime = 0;

      directionX = 0;
      directionY = 0;

      this.resetPosition(0);
    },
    /**
     *
     * @description 统一运行环境
     * @param {string} type
     * @param {Function} fn
     */
    async runIn(type, fn) {
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

      if (hasHorizontalScroll === false || x > 0) {
        _x = 0;
      } else if (x < maxScrollX) {
        _x = maxScrollX;
      }

      if (hasVerticalScroll === false || y > 0) {
        _y = 0;
      } else if (y < maxScrollY) {
        _y = maxScrollY;
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

      destination =
        current +
        ((speed * speed) / (2 * deceleration)) * (distance < 0 ? -1 : 1);

      duration = speed / deceleration;

      if (destination < lowerMargin) {
        destination = wrapperSize
          ? lowerMargin - (wrapperSize / 2.5) * (speed / 8)
          : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
      } else if (destination > 0) {
        destination = wrapperSize ? (wrapperSize / 2.5) * (speed / 8) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
      }

      return {
        destination: Math.round(destination),
        duration: duration,
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

      this.setTransForm(_x, _y);

      x = _x;
      y = _y;

      ownnerPos = {
        x: _x,
        y: _y
      };
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
      const MAXIMUM_ALLOWABLE_VALUE = 15;

      return Math.abs(num - num2) <= MAXIMUM_ALLOWABLE_VALUE;
    },
    /**
     * 
     * @description 滚动容器和滚动目前的 scrollHeight 差异
    */
    highGap() {
      return scrollerContainer.scrollHeight - scroller.scrollHeight;
    },
    /**
     * 
     * @description 滚动位置是否在顶部
    */
    isTop() {
      return scrollerContainer.scrollTop === 0;
    },
    /**
     * 
     * @description 滚动位置是否在底部
    */
    isBottom() {
      return this.compared(
        scrollerContainer.scrollTop + scrollerContainer.clientHeight,
        scroller.scrollHeight + this.highGap()
      );
    },
    /**
     * 
     * @description 是否禁用顶部向下滑动时的回弹行为
    */
    isDisabledToBottomBounce() {
      return ((this.isTop() || this.isBottom()) === false) || y === 0 && directionY > 0;
    },
    /**
     * 
     * @description 是否禁用底部向上滑动时的回弹行为
    */
    isDisabledToTopBounce() {
      return ((this.isTop() || this.isBottom()) === false) || y === 0 && directionY < 0;
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
          // #ifdef APP-PLUS
          const pos = ownnerPos;
          // #endif

          // #ifdef H5
          const pos = this.getComputedPosition();
          // #endif

          this.translate(pos.x, pos.y);

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
        deltaX = hasHorizontalScroll ? deltaX : 0;
        deltaY = hasVerticalScroll ? deltaY : 0;

        // 新的位置
        newX = x + deltaX;
        newY = y + deltaY;

        if (newX > 0 || newX < maxScrollX) {
          newX = x + deltaX / 3;
        }

        if (newY > 0 || newY < maxScrollY) {
          newY = y + deltaY / 3;
        }

        // 当前方向
        directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

        if (this.isDisabledToBottomBounce() && this.isDisabledToTopBounce()) {
          return this.refresh();
        }

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
          momentumX = hasHorizontalScroll
            ? this.momentum(
                x,
                startX,
                duration,
                maxScrollX,
                scrollerContainer.clientWidth
              )
            : {
                destination: newX,
                duration: 0,
              };

          momentumY = hasVerticalScroll
            ? this.momentum(
                y,
                startY,
                duration,
                maxScrollY,
                scrollerContainer.clientHeight
              )
            : {
                destination: newY,
                duration: 0,
              };

          newX = momentumX.destination;
          newY = momentumY.destination;

          time = Math.max(momentumX.duration, momentumY.duration);

          isInTransition = true;
        }

        if (newX !== x || newY !== y) {
          if (newX > 0 || newX < maxScrollX || newY > 0 || newY < maxScrollY) {
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
    },
  }
}
</script>

<style></style>
