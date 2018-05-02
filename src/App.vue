<template>
  <div id="app">
    <div class="header">
      <router-link :to="{ name: 'get', params: { code: '000001.SH' }}" class="navcat">
        <span>上证指数</span>
      </router-link>
      <router-link :to="{ name: 'get', params: { code: '399001.SZ' }}" class="navcat">
        <span>深证指数</span>
      </router-link>
      <router-link :to="{ name: 'get', params: { code: '000300.SH' }}" class="navcat">
        <span>沪深300</span>
      </router-link>
      <router-link :to="{ name: 'get', params: { code: '000016.SH' }}" class="navcat">
        <span>上证50</span>
      </router-link>
      <router-link :to="{ name: 'get', params: { code: '000905.SH' }}" class="navcat">
        <span>中证500</span>
      </router-link>
      <router-link :to="{ name: 'get', params: { code: '000852.SH' }}" class="navcat">
        <span>中证1000</span>
      </router-link>
      <router-link :to="{ name: 'get', params: { code: '399006.SZ' }}" class="navcat">
        <span>创业板</span>
      </router-link>
      <router-link :to="{ name: 'get', params: { code: '399005.SZ' }}" class="navcat">
        <span>中小板</span>
      </router-link>
    </div>
    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
  html body{
    height: 100%;
  }
  #app {
    overflow: hidden; 
  }
  .header{
    height: 30px;
    font-size: 0;
    overflow-y: hidden; 
    overflow-x: auto;
    white-space: nowrap;
  }

  a {
    text-decoration:none;
    margin: 0;
    padding: 0;
  }
  a.navcat{
    display: inline-block;
    font-size: 20px;
    padding: 2px 5px;
    color: #555;
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
  }
  a.navcat:after{
    border-bottom: 1px solid #ddd;
  }
  a.router-link-active{
    color: #337ab7;
    background: #fff;
    border: 1px solid #ddd;
    border-bottom: 0px;
  }
  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
  
</style>
