// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'


// 引入echarts
import echarts from 'echarts'
// 引入 axios 网络加载库
import axios from 'axios';

Vue.prototype.$echarts = echarts 
Vue.prototype.$http = axios 

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
