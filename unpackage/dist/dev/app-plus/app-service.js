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
(function(vue) {
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
  if (typeof block0 === "function")
    block0(_sfc_main$2);
  const _sfc_main$1 = {
    data() {
      return {
        pickerWebview: null
      };
    },
    props: {},
    computed: {},
    mounted() {
    },
    created() {
      this.initWebView();
    },
    methods: {
      initWebView() {
        this.pickerWebview = plus.webview.create("/static/picker.html", "PICKER_ID", {
          popGesture: "none",
          background: "transparent",
          backButtonAutoControl: "hide",
          render: "always",
          kernel: "WKWebview",
          bounce: "none",
          cachemode: "noCache"
        });
      },
      handleShowWebView(e) {
        if (this.pickerWebview) {
          this.pickerWebview.show("fade-in");
        }
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "index" }, [
      vue.createCommentVNode('\n      <scroll-view-bounce :height="height" :scroll-y="true">\n        <view class="card" v-for="item in 25">\n          {{ item }}\n        </view>\n      </scroll-view-bounce>\n    '),
      vue.createElementVNode("button", {
        type: "primary",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.handleShowWebView && $options.handleShowWebView(...args))
      }, "点我点我")
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"], ["__file", "E:/work/u-plugins/pages/index/index.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
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
})(Vue);
