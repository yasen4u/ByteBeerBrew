
var chartT = new Highcharts.Chart({
	chart:{ renderTo : 'chart-temperature' },
	title: { text: 'Mash Tun' },
	series: [{
		showInLegend: false,
		data: []
	}],
	plotOptions: {
		line: { animation: false,
		dataLabels: { enabled: true }
		},
		series: { color: '#059e8a' }
	},
	xAxis: { type: 'datetime',
		dateTimeLabelFormats: { second: '%H:%M:%S' }
	},
	yAxis: {
		title: { text: 'Temperature (Celsius)' }
	},
	credits: { enabled: false }
});
setInterval(function() {
  var request = new XMLHttpRequest();
  request.open('GET','/?temp', true); 
  request.onload = function() {
	if (request.readyState == 4 && request.status == 200) {
	  var data = JSON.parse(request.response);
	  var x = (new Date()).getTime() + 10800,
		  y = parseFloat(data[0]);
	  if(chartT.series[0].data.length > 250) {
		chartT.series[0].addPoint([x, y], true, true, true);
	  } else {
		chartT.series[0].addPoint([x, y], true, false, true);
	  }
	}
  }
  request.send();	
}, 60000 );