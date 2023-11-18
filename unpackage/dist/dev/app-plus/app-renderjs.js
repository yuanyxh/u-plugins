var __renderjsModules={};

__renderjsModules["31349b53"] = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x2) => x2.done ? resolve(x2.value) : Promise.resolve(x2.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // <stdin>
  var stdin_exports = {};
  __export(stdin_exports, {
    default: () => stdin_default
  });

  // E:/work/u-plugins/components/scroll-view-bounce/scroll-view-bounce.js
  var BOUNCE_TIME = 600;
  var eventType = {
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
  var startEventType = ["touchstart", "mousedown", "pointerdown", "MSPointerDown", "onTouchstart"];
  var circular = {
    style: "cubic-bezier(0.1, 0.57, 0.1, 1)",
    fn: function(k) {
      return Math.sqrt(1 - --k * k);
    }
  };
  var quadratic = {
    style: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    fn: function(k) {
      return k * (2 - k);
    }
  };

  // <stdin>
  var ownnerPos = {
    x: 0,
    y: 0
  };
  var scrollerContainer = null;
  var scroller = null;
  var maxScrollX = 0;
  var maxScrollY = 0;
  var hasHorizontalScroll = false;
  var hasVerticalScroll = false;
  var isInTransition = false;
  var startTime = 0;
  var endTime = 0;
  var initiated = 0;
  var moved = false;
  var x = 0;
  var y = 0;
  var startX = 0;
  var startY = 0;
  var pointX = 0;
  var pointY = 0;
  var distX = 0;
  var distY = 0;
  var directionX = 0;
  var directionY = 0;
  var stdin_default = {
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
      scrollerContainer = document.getElementById("scroller-container");
      scrollerContainer = scrollerContainer.getElementsByClassName("uni-scroll-view")[1];
      scroller = document.getElementById("scroller");
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
        scrollerContainer.style["transitionDuration"] = time + "ms";
      },
      /**
       *
       * @description 设置过渡时间线函数
       * @param {string} easing
       */
      setTransitionTimingFunction(easing) {
        scrollerContainer.style["transitionTimingFunction"] = easing;
      },
      /**
       *
       * @description 设置转换
       * @param {number} _x
       * @param {number} _y
       */
      setTransForm(_x, _y) {
        scrollerContainer.style["transform"] = `translate(${_x}px, ${_y}px) translateZ(0)`;
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
        let matrix = window.getComputedStyle(scroller, null);
        let _x = 0;
        let _y = 0;
        matrix = matrix["transform"].split(")")[0].split(", ");
        _x = +(matrix[12] || matrix[4]);
        _y = +(matrix[13] || matrix[5]);
        return { x: _x, y: _y };
      },
      /**
       * @description 更新数据
      */
      refresh() {
        hasHorizontalScroll = this.bounceScrollX;
        hasVerticalScroll = this.bounceScrollY;
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
      runIn(_0, _1) {
        return __async(this, arguments, function* (type, fn) {
          if (initiated === 0 && startEventType.includes(type)) {
            initiated = eventType[type];
          }
          if (initiated !== eventType[type]) {
            return;
          }
          fn.apply(this, Array.from(arguments).slice(2));
        });
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
        let distance = current - start;
        let destination = 0;
        let duration = 0;
        const deceleration = 6e-4;
        const speed = Math.abs(distance) / time;
        destination = current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
        duration = speed / deceleration;
        if (destination < lowerMargin) {
          destination = wrapperSize ? lowerMargin - wrapperSize / 2.5 * (speed / 8) : lowerMargin;
          distance = Math.abs(destination - current);
          duration = distance / speed;
        } else if (destination > 0) {
          destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
          distance = Math.abs(current) + destination;
          duration = distance / speed;
        }
        return {
          destination: Math.round(destination),
          duration
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
          scroller.scrollHeight
        );
      },
      /**
       * 
       * @description 是否禁用顶部向下滑动时的回弹行为
      */
      isDisabledToBottomBounce() {
        return (this.isTop() || this.isBottom()) === false || y === 0 && directionY > 0;
      },
      /**
       * 
       * @description 是否禁用底部向上滑动时的回弹行为
      */
      isDisabledToTopBounce() {
        return (this.isTop() || this.isBottom()) === false || y === 0 && directionY < 0;
      },
      /**
       *
       * @description 事件开始处理程序
       * @param {MouseEvent|TouchEvent} e
       */
      handleStart(e) {
        this.runIn(e.type, () => {
          const point = e.touches ? e.touches[0] : e;
          moved = false;
          distX = 0;
          distY = 0;
          directionX = 0;
          directionY = 0;
          startTime = Date.now();
          if (isInTransition) {
            this.setTransitionTime(0);
            isInTransition = false;
            const pos = ownnerPos;
            this.translate(pos.x, pos.y);
          }
          startX = x;
          startY = y;
          pointX = point.pageX;
          pointY = point.pageY;
        });
      },
      /**
       *
       * @description 移动中事件处理程序
       * @param {MouseEvent|TouchEvent} e
       */
      handleMove(e) {
        this.runIn(e.type, () => {
          const point = e.touches ? e.touches[0] : e;
          let deltaX = point.pageX - pointX;
          let deltaY = point.pageY - pointY;
          const timestamp = Date.now();
          let newX = 0;
          let newY = 0;
          let absDistX = 0;
          let absDistY = 0;
          pointX = point.pageX;
          pointY = point.pageY;
          distX += deltaX;
          distY += deltaY;
          absDistX = Math.abs(distX);
          absDistY = Math.abs(distY);
          if (timestamp - endTime > 300 && absDistX < 10 && absDistY < 10) {
            return;
          }
          deltaX = hasHorizontalScroll ? deltaX : 0;
          deltaY = hasVerticalScroll ? deltaY : 0;
          newX = x + deltaX;
          newY = y + deltaY;
          if (newX > 0 || newX < maxScrollX) {
            newX = x + deltaX / 3;
          }
          if (newY > 0 || newY < maxScrollY) {
            newY = y + deltaY / 3;
          }
          directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
          directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;
          if (this.isDisabledToBottomBounce() && this.isDisabledToTopBounce()) {
            return this.refresh();
          }
          if (moved === false) {
          }
          moved = true;
          this.translate(newX, newY);
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
          const point = e.changedTouches ? e.changedTouches[0] : e;
          const duration = Date.now() - startTime;
          let newX = Math.round(x);
          let newY = Math.round(y);
          const distanceX = Math.abs(newX - startX);
          const distanceY = Math.abs(newY - startY);
          let time = 0;
          let easing = void 0;
          let momentumX = 0;
          let momentumY = 0;
          isInTransition = false;
          initiated = 0;
          endTime = Date.now();
          if (this.resetPosition(BOUNCE_TIME)) {
            return;
          }
          this.scrollTo(newX, newY);
          if (!moved) {
            return;
          }
          if (duration < 300) {
            momentumX = hasHorizontalScroll ? this.momentum(
              x,
              startX,
              duration,
              maxScrollX,
              scrollerContainer.clientWidth
            ) : {
              destination: newX,
              duration: 0
            };
            momentumY = hasVerticalScroll ? this.momentum(
              y,
              startY,
              duration,
              maxScrollY,
              scrollerContainer.clientHeight
            ) : {
              destination: newY,
              duration: 0
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
        }
      }
    }
  };
  return __toCommonJS(stdin_exports);
})();
