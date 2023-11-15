<template>
  <view class="index">
    <scroll-view-bounce class="bounce" :scroll-y="true">
      <view class="card" v-for="item in 25">
        {{ item }}
      </view>
    </scroll-view-bounce>
  </view>
</template>

<script>
import ScrollViewBounce from "/components/scroll-view-bounce/scroll-view-bounce.vue";

export default {
  data() {
    return {};
  },
  props: {},
  computed: {},
  mounted() {},
  created() {},
  methods: {},
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.bounce {
  height: calc(100vh - 44px);
}

.card {
  margin-top: 10px;
  background-color: yellowgreen;
  height: 80px;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}
</style>
