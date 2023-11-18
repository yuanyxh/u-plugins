if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue, shared) {
  "use strict";
  const block0 = (Comp) => {
    (Comp.$renderjs || (Comp.$renderjs = [])).push("bounce");
    (Comp.$renderjsModules || (Comp.$renderjsModules = {}))["bounce"] = "31349b53";
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$2 = {
    data() {
      return {};
    },
    props: {
      /** 滚动容器宽度 */
      width: {
        type: [String, Number]
      },
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
        default: "black"
      },
      refresherBackground: {
        type: String,
        default: "#FFF"
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
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("scroll-view", {
      id: "scroller-container",
      class: "scroller-container",
      style: vue.normalizeStyle({ width: $props.width, height: $props.height }),
      bounceScrollX: vue.wp($props.scrollX),
      "change:bounceScrollX": _ctx.bounce.updateScrollX,
      bounceScrollY: vue.wp($props.scrollY),
      "change:bounceScrollY": _ctx.bounce.updateScrollY,
      "scroll-x": $props.scrollX,
      "scroll-y": $props.scrollY,
      scrollLeft: $props.scrollLeft,
      scrollTop: $props.scrollTop,
      "upper-threshold": $props.upperThreshold,
      "lower-threshold": $props.lowerThreshold,
      "scroll-into-view": $props.scrollIntoView,
      "scroll-with-animation": $props.scrollWithAnimation,
      "enable-back-to-top": $props.enableBackToTop,
      "show-scrollbar": $props.showScrollbar,
      "refresher-enabled": $props.refresherEnabled,
      "refresher-threshold": $props.refresherThreshold,
      "refresher-default-style": $props.refresherDefaultStyle,
      "refresher-background": $props.refresherBackground,
      "refresher-triggered": $props.refresherTriggered,
      "enable-flex": $props.enableFlex,
      "scroll-anchoring": $props.scrollAnchoring,
      onScrolltoupper: _cache[7] || (_cache[7] = (...args) => $options.handleEvent && $options.handleEvent(...args)),
      onScrolltolower: _cache[8] || (_cache[8] = (...args) => $options.handleEvent && $options.handleEvent(...args)),
      onScroll: _cache[9] || (_cache[9] = (...args) => $options.handleEvent && $options.handleEvent(...args)),
      onRefresherpulling: _cache[10] || (_cache[10] = (...args) => $options.handleEvent && $options.handleEvent(...args)),
      onRefresherrefresh: _cache[11] || (_cache[11] = (...args) => $options.handleEvent && $options.handleEvent(...args)),
      onRefresherrestore: _cache[12] || (_cache[12] = (...args) => $options.handleEvent && $options.handleEvent(...args)),
      onRefresherabort: _cache[13] || (_cache[13] = (...args) => $options.handleEvent && $options.handleEvent(...args)),
      onTransitionend: _cache[14] || (_cache[14] = (...args) => _ctx.bounce.handleTransitionend && _ctx.bounce.handleTransitionend(...args))
    }, [
      vue.createElementVNode(
        "view",
        {
          id: "scroller",
          class: "scroller",
          onTouchstart: _cache[0] || (_cache[0] = (...args) => _ctx.bounce.handleStart && _ctx.bounce.handleStart(...args)),
          onTouchmove: _cache[1] || (_cache[1] = (...args) => _ctx.bounce.handleMove && _ctx.bounce.handleMove(...args)),
          onTouchend: _cache[2] || (_cache[2] = (...args) => _ctx.bounce.handleEnd && _ctx.bounce.handleEnd(...args)),
          onTouchcancel: _cache[3] || (_cache[3] = (...args) => _ctx.bounce.handleCancel && _ctx.bounce.handleCancel(...args)),
          onMousedown: _cache[4] || (_cache[4] = (...args) => _ctx.bounce.handleStart && _ctx.bounce.handleStart(...args)),
          onMousemove: _cache[5] || (_cache[5] = (...args) => _ctx.bounce.handleMove && _ctx.bounce.handleMove(...args)),
          onMouseup: _cache[6] || (_cache[6] = (...args) => _ctx.bounce.handleEnd && _ctx.bounce.handleEnd(...args))
        },
        [
          vue.renderSlot(_ctx.$slots, "default")
        ],
        32
        /* HYDRATE_EVENTS */
      )
    ], 44, ["bounceScrollX", "change:bounceScrollX", "bounceScrollY", "change:bounceScrollY", "scroll-x", "scroll-y", "scrollLeft", "scrollTop", "upper-threshold", "lower-threshold", "scroll-into-view", "scroll-with-animation", "enable-back-to-top", "show-scrollbar", "refresher-enabled", "refresher-threshold", "refresher-default-style", "refresher-background", "refresher-triggered", "enable-flex", "scroll-anchoring"]);
  }
  if (typeof block0 === "function")
    block0(_sfc_main$2);
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "E:/work/u-plugins/components/scroll-view-bounce/scroll-view-bounce.vue"]]);
  function resolveEasycom(component, easycom) {
    return shared.isString(component) ? easycom : component;
  }
  const _sfc_main$1 = {
    data() {
      return {};
    },
    props: {},
    computed: {},
    mounted() {
    },
    created() {
    },
    methods: {}
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_scroll_view_bounce = resolveEasycom(vue.resolveDynamicComponent("scroll-view-bounce"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "index" }, [
      vue.createVNode(_component_scroll_view_bounce, {
        class: "bounce",
        "scroll-y": true
      }, {
        default: vue.withCtx(() => [
          (vue.openBlock(), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList(25, (item) => {
              return vue.createElementVNode(
                "view",
                { class: "card" },
                vue.toDisplayString(item),
                1
                /* TEXT */
              );
            }),
            64
            /* STABLE_FRAGMENT */
          ))
        ]),
        _: 1
        /* STABLE */
      })
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"], ["__file", "E:/work/u-plugins/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  const _sfc_main = {
    onLaunch: function() {
    },
    onShow: function() {
    },
    onHide: function() {
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "E:/work/u-plugins/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue, uni.VueShared);
