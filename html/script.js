doc = document;
var pump = doc.getElementById("pumpSwicher");
function pumpSwich() {
	var request = new XMLHttpRequest();
	request.open('GET','/?pump', false); 
	request.send();
	isReload();
}
pump.addEventListener('click',pumpSwich);

var heat = doc.getElementById("heatSwicher");
function heatSwich() {
	var request = new XMLHttpRequest();
	request.open('GET','/?heat', false); 
	request.send();
	isReload();
}
heat.addEventListener('click',heatSwich);

var buttonBrewDeActivate=false; 
var stepInButton = 0
function isReload(){
	var request3 = new XMLHttpRequest();
	request3.open('GET','/?temp', true); 
	request3.onload = function() {
		if (request3.readyState == 4 && request3.status == 200) {
			var data = JSON.parse(request3.response);
			console.log(data)
			doc.getElementById("temp1").innerHTML = parseFloat(data[0]);
			doc.getElementById("temp2").innerHTML = parseFloat(data[1]);
			doc.getElementById("temp3").innerHTML = parseFloat(data[2]);
			if (stepInButton == 3) {
				newText = 'pause # '+data[5]+' time: ' +data[6] +' sec';
				doc.getElementById("startBrew").innerHTML = newText;
				buttonBrewDeActivate = false;
			}


			if (stepInButton == 2){
				newText = "Bring to mash";
				doc.getElementById("startBrew").innerHTML = newText;
				doc.getElementById("startBrew").disabled = false;
				buttonBrewDeActivate = false;
			}

			if (buttonBrewDeActivate  == true) {
				if ( stepInButton == 1){
					tempGrainIn = parseFloat(doc.getElementById("temp_id_1").value);
					tempInMash = parseFloat(data[0]);
					valueTemp = tempGrainIn - tempInMash;
					if (parseFloat(valueTemp) <= 0) {
						valueTemp = 0;
					}
					newText = "Before adding grains: " + valueTemp + " Celsium";
					doc.getElementById("startBrew").innerHTML = newText;
					if (parseFloat(valueTemp) <= 0) {
						stepInButton = 2;
					}
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
setInterval("isReload()", 1000);
n=1;
function addOneStep(){
	var parent = doc.getElementById("processing");
	label = doc.createElement("label");
	label.id = "label_id_"+n;
	label.name = n;
	label.innerHTML = "Step <span>" +n+ "</span>";
	tempGrain = doc.createElement("option");
	tempGrain.text = "Add grains";
	tempGrain.id = "grainIn_"+n;
	tempGrain.name = n;	
	tempPause = doc.createElement("option");
	tempPause.text = "Hold mash";
	tempPause.id = "tempPause_"+n;
	tempPause.name = n;
	booling = doc.createElement("option");
	booling.text = "Boil";
	booling.id = "booling_"+n;
	booling.name = n;
	hopAdd = doc.createElement("option");
	hopAdd.text = "Add hops";
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
function changeInput(event) {
	var id = event.target.id;
	eCount = event.target.id.split("_")[1]
	if (id.match("booling_*") || id.match("hopAdd_*")){
		doc.getElementById("temp_id_" + eCount).disabled = true;
		if (id.match("booling_*")){
			doc.getElementById("time_id_" + eCount).disabled = false;
			doc.getElementById("booling_" + eCount).classList.add("booling");
			doc.getElementById("time_id_" + eCount).classList.add("timeBoil");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseCelsium");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseTime");
		} else if (id.match("hopAdd_*")) {
			doc.getElementById("time_id_" + eCount).disabled = false;
			doc.getElementById("hopAdd_" + eCount).classList.add("hopAdd");
			doc.getElementById("time_id_" + eCount).classList.add("TimeHopAdd");
			doc.getElementById("time_id_" + eCount).classList.remove("booling");
			doc.getElementById("time_id_" + eCount).classList.remove("timeBoil");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseCelsium");
			doc.getElementById("time_id_" + eCount).classList.remove("tempPauseTime");						
		}
	} else if (id.match("tempPause_*")){
		doc.getElementById("time_id_" + eCount).disabled = false;
		doc.getElementById("temp_id_" + eCount).disabled = false;
		doc.getElementById("temp_id_" + eCount).classList.add("tempPauseCelsium");
		doc.getElementById("time_id_" + eCount).classList.add("tempPauseTime");
		doc.getElementById("time_id_" + eCount).classList.remove("booling");
		doc.getElementById("time_id_" + eCount).classList.remove("timeBoil");
		doc.getElementById("time_id_" + eCount).classList.remove("hopAdd");
		doc.getElementById("time_id_" + eCount).classList.remove("TimeHopAdd");
	}else if (id.match("grainIn_*")){
		doc.getElementById("temp_id_" + eCount).disabled = false;
		doc.getElementById("time_id_" + eCount).disabled = true;
		doc.getElementById("temp_id_" + eCount).classList.add("tempGrainIn");
		doc.getElementById("time_id_" + eCount).classList.remove("booling");
		doc.getElementById("time_id_" + eCount).classList.remove("timeBoil");
		doc.getElementById("time_id_" + eCount).classList.remove("hopAdd");
		doc.getElementById("time_id_" + eCount).classList.remove("TimeHopAdd");
		doc.getElementById("temp_id_" + eCount).classList.remove("tempPauseCelsium");
		doc.getElementById("time_id_" + eCount).classList.remove("tempPauseTime");	

	}
}
doc.addEventListener("click",changeInput);

function getParam() {
	// recept = переменная например ЯсеньИпа
	var recept = "YasenIPA";
	data = {};
	data["recept"] = recept;
	data["data"] = (new Date()).getTime();
	data["param"] = {};
	var grainIn = doc.querySelector(".tempGrainIn");
	data["param"]["grainIn"] = {};
	data["param"]["grainIn"]["temp"] = grainIn.value;
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
	data["param"]["boil"]["temp"] = 98;
	var hopAdd = doc.querySelectorAll(".TimeHopAdd");
	for (var i = 0; i < hopAdd.length; i++) {
		data["param"]["hopAdd_"+[i+1]] = {};
		data["param"]["hopAdd_"+[i+1]]["time"] = hopAdd[i].value;
	}																			
	return JSON.stringify(data);
};
function brew() {
	var request7 = new XMLHttpRequest();
	request7.responseType = 'json';
	var data = getParam();
	console.log(data)
	request7.open('POST','/?brew= ' + data, true); 
	request7.send();
	doc.getElementById("startBrew").disabled = buttonBrewDeActivate;
	if (stepInButton <= 0){
		buttonBrewDeActivate = true;
		doc.getElementById("startBrew").disabled = buttonBrewDeActivate;
	}
	stepInButton++;
};
//# sourceURL=script.js
//# create by Yasen
//# sourceURL=script.js
//# create by Yasen