doc = document;
var pump = doc.getElementById("pumpSwicher");
function pumpSwich() {
	var request = new XMLHttpRequest();
	 	request.open('GET','/?pump', false); 
			if ( doc.getElementById("pumpStatus").innerHTML == "ON"){
				doc.getElementById("pumpStatus").innerHTML = "OFF";
				pumpSwicher.checked = false;
			} else {
				doc.getElementById("pumpStatus").innerHTML = "ON";
				pumpSwicher.checked = true;
			}
	 	request.send();
}
pump.addEventListener('click',pumpSwich);
var heat = doc.getElementById("heatSwicher");
function heatSwich() {
 	var request = new XMLHttpRequest();
 	request.open('GET','/?heat', false); 
		if (doc.getElementById("heatStatus").innerHTML == "ON"){
			doc.getElementById("heatStatus").innerHTML = "OFF";
			heatSwicher.checked = false;
		} else{
			doc.getElementById("heatStatus").innerHTML = "ON";
			heatSwicher.checked = true;
		}

 	request.send();
}
heat.addEventListener('click',heatSwich);
console.log('Done script.js');
//create global varibal
var buttonBrewActivate=false; 
//reload function update 
//temp time and button on html page
function isReload(){
	var request3 = new XMLHttpRequest();
	request3.open('GET','/?temp', true); 
	request3.onload = function() {
		if (request3.readyState == 4 && request3.status == 200) {
			var data = JSON.parse(request3.response);
			doc.getElementById("temp1").innerHTML = parseFloat(data[0]);
			doc.getElementById("temp2").innerHTML = parseFloat(data[1]);
			doc.getElementById("temp3").innerHTML = parseFloat(data[2]);
			console.log(buttonBrewActivate)
			if (buttonBrewActivate  == true) {
				if (parseFloat(data[0]) >= parseFloat(doc.getElementById("temp_id_1").value)){
					console.log("вода согрелась");
					newText = "Приступить к затирке"
					doc.getElementById("startBrew").innerHTML = newText;
					doc.getElementById("startBrew").disabled = false;
					buttonBrewActivate = false;
				}
				console.log(doc.getElementById("temp_id_1").value)
				if (parseFloat(data[0]) < parseFloat(doc.getElementById("temp_id_1").value)){
					console.log("нагрев воды для внесения солода");
					tempGrainIn = parseFloat(doc.getElementById("temp_id_1").value)
					tempInMash = parseFloat(data[0])
					valueTemp = tempGrainIn - tempInMash
					newText = "До внесения солода: " + valueTemp + " ℃"
					doc.getElementById("startBrew").innerHTML = newText;
				}
			}
			if (parseFloat(data[3]) == 1) {
				doc.getElementById("pumpStatus").innerHTML = "ON";
				pumpSwicher.checked = true;
			} else {
				doc.getElementById("pumpStatus").innerHTML = "OFF";
				pumpSwicher.checked = false;
			}
			if (parseFloat(data[4]) == 1) {
				doc.getElementById("heatStatus").innerHTML = "ON";
				heatSwicher.checked = true;
			} else {
				doc.getElementById("heatStatus").innerHTML = "OFF";
				heatSwicher.checked = false;
			}
		}
	}
	request3.send();    
}
setInterval("isReload()", 3000);
n=1;
function addOneStep(){
	var parent = doc.getElementById("processing");
	label = doc.createElement("label");
	label.id = "label_id_"+n;
	label.name = n;
	label.innerHTML = "Этап <span>" +n+ "</span>";
    tempGrain = doc.createElement("option");
	tempGrain.text = "Внесение солода";
	tempGrain.id = "grainIn_"+n;
	tempGrain.name = n;	
	tempPause = doc.createElement("option");
	tempPause.text = "Температурная пауза";
	tempPause.id = "tempPause_"+n;
	tempPause.name = n;
	booling = doc.createElement("option");
	booling.text = "Варка";
	booling.id = "booling_"+n;
	booling.name = n;
	hopAdd = doc.createElement("option");
	hopAdd.text = "Добавление хмеля";
	hopAdd.id = "hopAdd_"+n;
	hopAdd.name = n;
	select = doc.createElement("select");
	tempTime = doc.createElement("input");
	tempTime.type = "text";
	tempTime.id = "time_id_"+n;
	tempTime.maxlenght = "3";
	tempTime.classList = "tempPauseTime";
	tempTime.value = "Minutes";
	tempVal = doc.createElement("input");
	tempVal.type = "text";
	tempVal.id = "temp_id_"+n;
	tempVal.maxlenght = "3";
	tempVal.classList = "tempPauseCelsium";
	tempVal.value = "Temperature";
	n++;
	select.appendChild(tempGrain);
	select.appendChild(tempPause);
	select.appendChild(booling);
	select.appendChild(hopAdd);
	label.appendChild(select);
	label.appendChild(tempTime);
	label.appendChild(tempVal);
	parent.appendChild(label);
};
console.log('Done AddOne.js');
function changeInput(event) {
	var id = event.target.id;
	eCount = event.target.id.split("_")[1]
	if (id.match("booling_*") || id.match("hopAdd_*")){
		doc.getElementById("temp_id_" + eCount).disabled = true;
		if (id.match("booling_*")){
			doc.getElementById("booling_" + eCount).classList.add("booling");
			doc.getElementById("time_id_" + eCount).classList.add("timeBoil");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseCelsium");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseTime");
		} else if (id.match("hopAdd_*")) {
			doc.getElementById("hopAdd_" + eCount).classList.add("hopAdd");
			doc.getElementById("time_id_" + eCount).classList.add("TimeHopAdd");
			doc.getElementById("time_id_" + eCount).classList.remove("booling");
			doc.getElementById("time_id_" + eCount).classList.remove("timeBoil");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseCelsium");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseTime");						
		}
	} else if (id.match("tempPause_*")){
		doc.getElementById("temp_id_" + eCount).disabled = false;
		doc.getElementById("temp_id_" + eCount).classList.add("tempPauseCelsium");
		doc.getElementById("time_id_" + eCount).classList.add("tempPauseTime");
		doc.getElementById("time_id_" + eCount).classList.remove("booling");
		doc.getElementById("time_id_" + eCount).classList.remove("timeBoil");
		doc.getElementById("time_id_" + eCount).classList.remove("hopAdd");
		doc.getElementById("time_id_" + eCount).classList.remove("TimeHopAdd");
	}else if (id.match("grainIn_*")){
		console.log("grainIn_")
		doc.getElementById("temp_id_" + eCount).disabled = false;
		doc.getElementById("time_id_" + eCount).disabled = true;
		doc.getElementById("grainIn_" + eCount).classList.add("grainIn");
		doc.getElementById("temp_id_" + eCount).classList.add("tempGrainIn");
		doc.getElementById("time_id_" + eCount).classList.remove("booling");
		doc.getElementById("time_id_" + eCount).classList.remove("timeBoil");
		doc.getElementById("time_id_" + eCount).classList.remove("hopAdd");
		doc.getElementById("time_id_" + eCount).classList.remove("TimeHopAdd");
	}

}
doc.addEventListener("click",changeInput)
console.log('Done getYst.js');
function getParam() {
	// recept = переменная например ЯсеньИпа
	var recept = "YasenIPA";
	data = {};

	data["recept"] = recept;
	data["data"] = (new Date()).getTime();
	data["param"] = {};

	

	var grainIn = doc.querySelectorAll(".tempGrainIn");
	data["param"]["grainIn"] = {};
	data["param"]["grainIn"]["temp"] = tempGrainIn.value;

	var tempPauseCelsium = doc.querySelectorAll(".tempPauseCelsium");
	var tempPauseTime = doc.querySelectorAll(".tempPauseTime");
	for (var i = 0; i < tempPauseTime.length; i++) {
		data["param"]["pause_"+[i+1]] = {};
		data["param"]["pause_"+[i+1]]["time"] = tempPauseTime[i].value;
		data["param"]["pause_"+[i+1]]["temp"] = tempPauseCelsium[i].value;
	}

	var timeBoil = doc.querySelector(".timeBoil");
	data["param"]["boil"] = {};
	data["param"]["boil"]["time"] = timeBoil.value;
	data["param"]["boil"]["temp"] = 93;

	var hopAdd = doc.querySelectorAll(".TimeHopAdd");
	for (var i = 0; i < hopAdd.length; i++) {
		data["param"]["hopAdd_"+[i+1]] = {};
		data["param"]["hopAdd_"+[i+1]]["time"] = hopAdd[i].value;

	}				

	//console.log(JSON.stringify(data));
	return JSON.stringify(data);
}
function brew() {
	var request7 = new XMLHttpRequest();
	request7.responseType = 'json';
	var data = getParam();
	console.log(data)
	request7.open('POST','/?brew= ' + data, true); 
	request7.send();
	doc.getElementById("startBrew").disabled = true;
	buttonBrewActivate = true;
	return buttonBrewActivate;
}

var chartT = new Highcharts.Chart({
  chart:{ renderTo : 'chart-temperature' },
  title: { text: 'Заторник' },
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
    //title: { text: 'Temperature (Fahrenheit)' }
  },
  credits: { enabled: false }
});
setInterval(function() {
  var request = new XMLHttpRequest();
  request.open('GET','/?temp', true); 
  request.onload = function() {
    if (request.readyState == 4 && request.status == 200) {
      console.log(request.responseText);
      console.log(request.response);
      var data = JSON.parse(request.response);
      var x = (new Date()).getTime(),
          y = parseFloat(data[0]);
      if(chartT.series[0].data.length > 180) {
        chartT.series[0].addPoint([x, y], true, true, true);
      } else {
        chartT.series[0].addPoint([x, y], true, false, true);
      }
    }
  }
  request.send();    
}, 60000 ) ;     
console.log('Done charts.js');
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              
                              







                        
                        