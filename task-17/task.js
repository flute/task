/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: -1,
  nowGraTime: "day"
}

/**
 * 渲染图表
 */
var boxwidth = 1200; 
function renderChart() {
  var type = pageState.nowGraTime;
  var city = pageState.nowSelectCity;
  var dom = document.getElementsByClassName('aqi-chart-wrap');
  for( var data in chartData.type.city ){
    var d = document.createElement('div');
    d.style.width = 1200/chartData.type.city.length-10;
    d.style.float = 'left';
    d.style.height = chartData.type.city[data];
    d.style.left = '10px';
    dom.appendChild(d);
  }
  /**
  for( var i=0;i<chartData.type.city.length;i++ ){
    var d = document.createElement('div');
    d.style.width = 1200/chartData.type.city.length-10;
    d.style.float = 'left';
    d.style.height = 
  }
  **/
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(event) {
  //console.log(event);
  // 确定是否选项发生了变化 
  if( event.target.nodeName == 'INPUT' ){
    if( pageState.nowGraTime != event.target.value )
      // 设置对应数据
      pageState.nowGraTime = event.target.value;
    //console.log(event.target.value);
  }
  // 调用图表渲染函数
  renderChart(pageState.nowGraTime,pageState.nowSelectCity);
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange(event) {
  // 确定是否选项发生了变化 
  if( event.target.nodeName == 'SELECT' ){
    if( event.target.value != pageState.nowSelectCity )
      // 设置对应数据
      pageState.nowSelectCity = event.target.value;
  }
  // 调用图表渲染函数
  renderChart(pageState.nowGraTime,pageState.nowSelectCity);
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  //初始化
  var dom = document.getElementById('form-gra-time');
  //console.log(dom);
  var input = document.getElementsByName('gra-time');
  input[0].checked=true;
  //添加监听事件
  dom.addEventListener('change',function(event){
    graTimeChange(event);
  });

}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var options = document.getElementById('city-select'); 
  for( var city in aqiSourceData ){
    if(city){
      console.log(city);
      var element = document.createElement('option');
      element.innerText = city;
      options.appendChild(element);
    }
  }
  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  options.addEventListener('change',function(event){
    citySelectChange(event);
  })
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
    // 将原始的源数据处理成图表需要的数据格式
    var week = {}, count = 0, singleWeek = {},
        month = {}, mcount = 0, singleMonth = {};

    for (var key in aqiSourceData) {
        var tempCity = aqiSourceData[key]
        var keyArr = Object.getOwnPropertyNames(tempCity);
        var tempMonth = keyArr[0].slice(5, 7);
        var weekInit = 4, weekCount = 0;
        for (var i = 0; i < keyArr.length; i++, weekInit++) {
            count += tempCity[keyArr[i]];
            mcount += tempCity[keyArr[i]];
            weekCount++;
            if ((weekInit+1) % 7 == 0 || i == keyArr.length - 1 || keyArr[i+1].slice(5, 7) !== tempMonth) {
                var tempKey = keyArr[i].slice(0, 7) + "月第" + (Math.floor(weekInit / 7) + 1) + "周";
                singleWeek[tempKey] = Math.floor(count / weekCount);

                if (i != keyArr.length - 1 && keyArr[i+1].slice(5, 7) !== tempMonth) {
                    weekInit = weekCount % 7;
                }
                count = 0;
                weekCount = 0;

                if (i == keyArr.length - 1 || keyArr[i+1].slice(5, 7) !== tempMonth) {
                    tempMonth = (i == keyArr.length - 1) ? keyArr[i].slice(5, 7) : keyArr[i+1].slice(5, 7);
                    var tempMKey = keyArr[i].slice(0, 7);
                    var tempDays = keyArr[i].slice(-2);
                    singleMonth[tempMKey] = Math.floor(mcount / tempDays);
                    mcount = 0;
                }
            }
        }
        week[key] = singleWeek;
        month[key] = singleMonth;
        singleWeek = {};
        singleMonth = {};
    }
    // 处理好的数据存到 chartData 中
    chartData.day = aqiSourceData;
    chartData.week = week;
    chartData.month = month;
    renderChart();
}


/**
 * 初始化函数
 */
function init() {
  initGraTimeForm()
  initCitySelector();
  initAqiChartData();
}

init();
