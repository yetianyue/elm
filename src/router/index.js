import Vue from 'vue'
import Router from 'vue-router'
import Echarts from '@/components/Echarts'

Vue.use(Router)

export default new Router({
  routes: [
  	{
  		path:'/',
  		redirect:'/get/000001.SH'
  	},
    {
      path: '/get/:code',
      name: 'get',
      component: Echarts
    }
  ]
})
