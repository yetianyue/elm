<template>
	<div>
		<div v-for="show,keys in myChartsShow" :id="keys" :style="{width: width, height: height}" v-show="show">
			
		</div>
	</div>
</template>

<script>

	export default {
	  name: 'Echarts',
	  data () {
	    return {
	      upColor: '#00da3c',
	      downColor:'#ec0000',
	      itemStyle:{
		      	normal:{
	            color: function (params){
	                if(params.data > 0 ){
	                    return '#ec0000';
	                }else{
	                    return '#00da3c';
	                }
	            }
	        },
	      },
	      code: '',
	      myCharts:{},
	      myChartsData:{},
	      myChartsShow:{
	      	'000001.SH':false,
	      	'399001.SZ':false,
	      	'000300.SH':false,
	      	'000016.SH':false,
	      	'000905.SH':false,
	      	'000852.SH':false,
	      	'399006.SZ':false,
	      	'399005.SZ':false
	      },
	      loading:false,
	      hasMore:{},
	      posts:{

	      }
	    }
	  },
	  created(){
	  	this.handleResize();
	    this.fetchData();
	  },
	  mounted(){
	  	this.drawCharts();
	  	//window.addEventListener('resize',this.handleResize);
	  },
	  beforeDestroy(){
	  	//window.removeEventListener('resize',this.handleResize);
	  },
	  watch: {
	    '$route': 'watchRoute'
	  },
	  methods: {
	  	//监听reesize事件
	  	handleResize(event){
	  		this.width =  document.documentElement.clientWidth-5+"px";
	  		this.height = document.documentElement.clientHeight-50+"px";
	  	},
	  	//监听rote变化的函数
	  	watchRoute(){
	  		this.fetchData();
	  		this.drawCharts();
	  	},
	  	//获取数据
	    fetchData(){
	      this.code = this.$route.params.code; 
	      
	      for (var i in this.myChartsShow) {
	      	this.myChartsShow[i] = false;
	      }
	      this.myChartsShow[this.code] = true;
	    },

	    //画Echarts
	    drawCharts(){
	        var myChart = this.getCurrentChart() || this.$echarts.init(document.getElementById(this.code)) ;
	        if(this.getCurrentChart() == undefined )
	        	this.setCurrentChart(myChart);
	        var that = this;
	        myChart.on('dataZoom',function (params) {
		        if(params.batch instanceof  Array){
		            if (params.batch[0].start <= 0 && that.loading===false){
		                that.getAjaxData();
		            }
		        }
		    })
	        if (this.myChartsData[this.code] == undefined) {
	        	this.getAjaxData();
	        }
	    },
	    getCurrentChart(){
	    	return this.myCharts[this.code];
	    },
	    setCurrentChart(myChart){
	    	this.myCharts[this.code] = myChart;
	    	this.hasMore[this.code] = true;
	    },
	    //异步获取数据
	    getAjaxData(){
	    	if(this.hasMore[this.code] == false && this.loading == false)
            	return ;
            this.loading = true;
            var myChart = this.getCurrentChart();
            myChart.showLoading();
	    	var that = this;
	    	if (this.posts[this.code] == undefined) {
	    		this.posts[this.code] = {
		    		code:that.code,
		    		more:0
		    	};
	    	}
	    	var config = {
    			url:'/k',
    			method:'post',
    			data:that.posts[that.code],
    			headers:{
    				'X-CSRF-TOKEN':document.getElementsByTagName('meta')['csrf-token'].getAttribute('content')
    			}
    		};
    		
	    	this.$http.request(config)
	    	.then(function (response) {
	    		var res = response.data;
	    		if(res.total == 0){
                    that.hasMore[that.code] = false;
                    return ;
                }
                
                that.posts[that.code] = {
                	code:that.code,
                	more:res.more
                };
                
	    		var rawData = that.handlerData(res.data);
			    var data = that.splitData(rawData);
			    that.setChartsOptions(data);
			    myChart.hideLoading();
			    that.loading = false;
			})
			.catch(function (error) {
				myChart.hideLoading();
				that.loading = false;
			});
	    },
	    //处理数据
	    handlerData(rawData) {
	    	//rawData = G_Data = rawData.concat(G_Data);
	    	rawData = this.myChartsData[this.code] 
	    			= this.myChartsData[this.code] == undefined ? rawData:rawData.concat(this.myChartsData[this.code]);
	    	
	        var temp = [];
	        var simple,item;
	        for(var i = 0 ; i < rawData.length ; i++){
	            item = rawData[i];
	            simple = [
	                item.d,
	                item.cl,
	                item.op,
	                item.lo,
	                item.hi,
	                item.vol,
	                item.amt,
	                item.pct_chg,
	                item.strength,
	                item.power,
	                item.risk
	            ]
	            temp.push(simple)
	        }
	        return temp;
	    },

	    //分割数据
	    splitData(rawData){
	    	var categoryData = [];
	        var values = [];
	        var volumes = [];
	        var strength = [];
	        var power = [];
	        var risk = [];
	        for (var i = 0; i < rawData.length; i++) {
	            categoryData.push(rawData[i].splice(0, 1)[0]);
	            values.push(rawData[i]);
	            volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
	            strength.push(rawData[i][7]);
	            power.push(parseFloat(rawData[i][8]).toFixed(2));
	            risk.push(rawData[i][9])
	        }
	        return {
	            categoryData: categoryData,
	            values: values,
	            volumes: volumes,
	            strength:strength,
	            power:power,
	            risk:risk
	        };
	    },
	    //计算均线
	    calculateMA(dayCount, data){
	    	var result = [];
	        for (var i = 0, len = data.length; i < len; i++) {
	            if (i < dayCount) {
	                result.push('-');
	                continue;
	            }
	            var sum = 0;
	            for (var j = 0; j < dayCount; j++) {
	                sum += parseFloat(data[i - j]);
	            }
	            result.push(+(sum / dayCount).toFixed(2));
	        }
	        return result;
	    },
	    toFixed2(str){
	    	return parseFloat(str).toFixed(2)
	    },
	    formatVol(vol) {
	        vol  = vol/10000;
	        if(vol < 1000){
	            return this.toFixed2(vol)+'万';
	        }
	        vol = vol/1000;
	        if(vol < 1000){
	            return this.toFixed2(vol)+'千万';
	        }
	        vol = vol/10;
	        if(vol < 1000){
	            return this.toFixed2(vol)+'亿';
	        }
	        vol = vol/1000;
	        return this.toFixed2(vol)+'千亿';
	    },
	    setChartsOptions(data) {
	    	var that = this;
	        var dataZoomStart = data.power.length == 90 ? 35 : 0;
	        this.getCurrentChart().setOption({
	            // title:{
	            //     text:that.code
	            // },
	            backgroundColor: '#fff',
	            animation: false,
	            legend: {
	                show:true,
	                data: [ 'MA5', 'MA10', 'MA20', 'MA30','Strength','Risk MA5'],
	                top:'2%'
	            },
	            toolbox:{
	                show:false
	            },
	            tooltip: {
	                trigger: 'axis',
	                axisPointer: {
	                    type: 'cross'
	                },
	                backgroundColor: 'rgba(245, 245, 245, 0.3)',
	                borderWidth: 1,
	                borderColor: '#ccc',
	                padding: 10,
	                textStyle: {
	                    color: '#000'
	                },
	                position: function (pos, params, el, elRect, size) {
	                    var obj = {top: 10};
	                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
	                    return obj;
	                },
	                formatter:function (params) {
	                    var param = params[0];
	                    var current = data.values[param.dataIndex];
	                    return [
	                        '<span style="width:100%;text-align: center;">'+param.name+'</span><br/>',
	                        '开盘价: ' + that.toFixed2(current[1]) + '<br/>',
	                        '最高价: ' + that.toFixed2(current[3]) + '<br/>',
	                        '最低价: ' + that.toFixed2(current[2]) + '<br/>',
	                        '收盘价: ' + that.toFixed2(current[0]) + '<br/>',
	                        '涨跌额: ' + that.toFixed2(current[0]-current[1]) + '<br/>',
	                        '涨跌幅: ' + that.toFixed2(current[6]) + '%<br/>',
	                        '成交量: ' + that.formatVol(current[4])+ '<br/>',
	                        '成交额: '+ that.formatVol(current[5])+'<br/>'
	                    ].join('');
	                }
	            },
	            axisPointer: {
	                link: {xAxisIndex: 'all'},
	                label: {
	                    backgroundColor: '#777'
	                }
	            },
	            grid: [
	                {
	                    left: '10%',
	                    right: '8%',
	                    height: '50%'
	                },
	                {
	                    left: '10%',
	                    right: '8%',
	                    top: '64%',
	                    height: '12%'
	                },
	                {
	                    left: '10%',
	                    right: '8%',
	                    top: '76%',
	                    height: '12%'
	                },
	                {
	                    left: '10%',
	                    right: '8%',
	                    top: '88%',
	                    height: '7%'
	                }
	            ],
	            dataZoom: [
	                {
	                    type: 'inside',
	                    xAxisIndex: [0,1,2,3],
	                    start: dataZoomStart,
	                    end: 100
	                },
	                {
	                    show: false,
	                    xAxisIndex: [0,1,2,3],
	                    type: 'slider',
	                    top: '95%',
	                    start: dataZoomStart,
	                    end: 100
	                }
	            ],
	            xAxis: [
	                {
	                    type: 'category',
	                    data: data.categoryData,
	                    scale: true,
	                    boundaryGap : false,
	                    axisLine: {onZero: false},
	                    splitLine: {show: false},
	                    splitNumber: 20,
	                    min: 'dataMin',
	                    max: 'dataMax',
	                    axisPointer: {
	                        z: 100
	                    }
	                },
	                {
	                    data: data.categoryData,
	                    silent: false,
	                    splitLine: {
	                        show: false
	                    },
	                    gridIndex: 1,
	                    boundaryGap : false,
	                    axisTick: {show: false},
	                    axisLabel: {show: false},
	                },
	                {
	                    data: data.categoryData,
	                    silent: false,
	                    splitLine: {
	                        show: false
	                    },
	                    gridIndex: 2,
	                    boundaryGap : false,
	                    axisTick: {show: false},
	                    axisLabel: {show: false},
	                },
	                {
	                    type: 'category',
	                    gridIndex: 3,
	                    data: data.categoryData,
	                    scale: true,
	                    boundaryGap : false,
	                    axisLine: {onZero: false},
	                    axisTick: {show: false},
	                    splitLine: {show: false},
	                    axisLabel: {show: false},
	                    splitNumber: 20,
	                    min: 'dataMin',
	                    max: 'dataMax'
	                }
	            ],
	            yAxis: [
	                {
	                    scale: true,
	                    splitArea: {
	                        show: true
	                    },
	                    smooth:false
	                },
	                {
	                    gridIndex: 1,
	                    position:'left',
	                    axisLabel: {show: false},
	                    axisLine: {show: false},
	                    axisTick: {show: false},
	                    splitLine: {show: false},
	                },
	                {
	                    gridIndex: 2,
	                    axisLabel: {show: false},
	                    axisLine: {show: false},
	                    axisTick: {show: false},
	                    splitLine: {show: false}
	                },
	                {
	                    gridIndex: 1,
	                    position:'right',
	                    axisLabel: {show: false},
	                    axisTick: {show: false},
	                    splitLine: {show: false}
	                },
	                {
	                    //scale: true,
	                    gridIndex: 3,
	                    splitNumber: 2,
	                    axisLabel: {show: false},
	                    axisLine: {show: false},
	                    axisTick: {show: false},
	                    splitLine: {show: false}
	                }
	            ],
	            series: [
	                {
	                    name: 'candlestick',
	                    type: 'candlestick',
	                    data: data.values,
	                    itemStyle: {
	                        normal: {
	                            color: that.upColor,
	                            color0: that.downColor,
	                            borderColor: null,
	                            borderColor0: null
	                        }
	                    }
	                },
	                {
	                    name: 'MA5',
	                    type: 'line',
	                    data: that.calculateMA(5, data.values),
	                    //smooth: true,
	                    lineStyle: {
	                        normal: {opacity: 0.5}
	                    }
	                },
	                {
	                    name: 'MA10',
	                    type: 'line',
	                    data: that.calculateMA(10, data.values),
	                    //smooth: true,
	                    lineStyle: {
	                        normal: {opacity: 0.5}
	                    }
	                },
	                {
	                    name: 'MA20',
	                    type: 'line',
	                    data: that.calculateMA(20, data.values),
	                    //smooth: true,
	                    lineStyle: {
	                        normal: {opacity: 0.5}
	                    }
	                },
	                {
	                    name: 'MA30',
	                    type: 'line',
	                    data: that.calculateMA(30, data.values),
	                    //smooth: true,
	                    lineStyle: {
	                        normal: {opacity: 0.5}
	                    }
	                },
	                {
	                    name: 'Power',
	                    type: 'bar',
	                    data: data.power,
	                    itemStyle:that.itemStyle,
	                    xAxisIndex: 1,
	                    yAxisIndex: 1,
	                    visualMap:false
	                },
	                {
	                    name: 'Strength',
	                    type: 'line',
	                    xAxisIndex: 1,
	                    yAxisIndex: 3,
	                    data: data.strength,
	                    markLine:{
	                        symbol:['arrow','triangle'],
	                        symbolSize:[0,0],
	                        lineStyle:{
	                            color:'black',
	                        },
	                        data:[
	                            {
	                                name: 'Y 轴值为 100 的水平线',
	                                yAxis: 100
	                            },
	                            {
	                                name: 'Y 轴值为 80 的水平线',
	                                yAxis: 80
	                            },
	                            {
	                                name: 'Y 轴值为 50 的水平线',
	                                yAxis: 50
	                            },
	                            {
	                                name: 'Y 轴值为 20 的水平线',
	                                yAxis: 20
	                            },
	                            {
	                                name: 'Y 轴值为 0 的水平线',
	                                yAxis: 0,
	                            },
	                        ]
	                    },
	                    smooth: true,
	                    lineStyle: {
	                        normal: {opacity: 0.5}
	                    }
	                },
	                {
	                    name: 'Risk',
	                    type: 'bar',
	                    data: data.risk,
	                    itemStyle:that.itemStyle,
	                    xAxisIndex: 2,
	                    yAxisIndex: 2,
	                    visualMap:false
	                },
	                {
	                    name: 'Risk MA5',
	                    type: 'line',
	                    xAxisIndex: 2,
	                    yAxisIndex: 2,
	                    data: that.calculateMA(5, data.risk),
	                    smooth: true,
	                    lineStyle: {
	                        normal: {opacity: 0.5}
	                    }
	                },
	                {
	                    name: 'Volume',
	                    type: 'bar',
	                    xAxisIndex: 3,
	                    yAxisIndex: 4,
	                    itemStyle:{
	                        normal:{
	                            color: function (params){
	                                if(params.data[2] == 1 ){
	                                    return that.downColor
	                                }else{
	                                    return that.upColor;
	                                }
	                            }
	                        },
	                    },
	                    data: data.volumes
	                }
	            ]
	        }, true);
	    }
	  }
	}
</script>

<style scoped>
	#myChart{
		margin: 0px 2px;
	}
</style>