
from machine import Pin, I2C, PWM
import network
import uasyncio as asyncio
import utime
import ujson as json
import onewire, ds18x20

import esp
esp.osdebug(None)

import gc
gc.enable()


def ap_station():
    print('start AP func')
    station = network.WLAN(network.AP_IF) 
    station.active(True)
    station.config(essid='Teplichka', password="", authmode=1) #AP_IF
    while station.isconnected() == False:
        pass

    print("AP_Point_Active")
    print('Connection successful')
    print(station.ifconfig()[0])


def sta_station():
    ssid = 'Medic'
    print(ssid)
    password = '171797YasenSolo'
    station = network.WLAN(network.STA_IF)
    if not station.isconnected():
        print('Connecting...')
        station.active(True)
        station.connect(ssid, password)
        for i in range(5):
            if not station.isconnected():
                utime.sleep_ms(5000)
            elif station.isconnected():
                print("STA_IF_Point_Active")
                print('Connection successful')
                print(station.ifconfig()[0])
                break
        if not station.isconnected():
            ap_station()

sta_station()



syst_led =  Pin(2, Pin.OUT)
pump = Pin(3, Pin.OUT)
heat = Pin(13, Pin.OUT)
term = Pin(5, mode=Pin.OUT)
ds = ds18x20.DS18X20(onewire.OneWire(term))
roms = ds.scan()

pumpFlag = False
grainIn = False
pauseStep = int(0)
pauseTime = int(0)
global count
count = 0

dataToSend = [0,0,0,pump.value(),heat.value()]
with open('temperature.log', 'w') as dataLog:
    dataLog.write('%s\n' % dataToSend)


async def memAlloc(interval_ms):
    while True:
        gc.collect()
        gc.threshold(gc.mem_free() // 8 + gc.mem_alloc())
        await asyncio.sleep_ms(interval_ms)


async def getTemp():
    with open("temperature.log", "r") as file:
        data = file.read()
        temp = json.loads(data)
        return temp

async def temperature(interval_ms):
    while True:
        dataToSend = []
        ds.convert_temp()
        i = 0
        for sensor in roms:
            i += 1
            try:
                t = ds.read_temp(sensor)
                dataToSend.append(t)
            except Exception as e:
                tempSensor = await getTemp()
                t = tempSensor[i]
                dataToSend.append(t)
                print("temp: "+str(t)+" error on sensor : "+str(i) + "Error: "+ e)
        dataToSend.append(pump.value())
        dataToSend.append(heat.value())
        dataToSend.append(pauseStep)
        dataToSend.append(pauseTime)
        with open('temperature.log', 'w') as dataLog:
            dataLog.write('%s\n' % (dataToSend))
        await asyncio.sleep_ms(interval_ms)   
       

async def heating(pauseTemp):
    global pauseTime
    global pumpFlag

    pumpFlag = True
    while pauseTime >= 1:
        await asyncio.sleep_ms(880)
        tempSensor = await getTemp()
        tempKub = tempSensor[0]
        if float(tempKub) < float(pauseTemp):
            heat.value(1)
            pump.value(1)
        else:
            heat.value(0)
        if float(tempKub) > float(pauseTemp)-2:
            print(pauseTime)
            pauseTime -= 1
        
    pump.value(0)
    return False


def grainIn(recept):
    for key, value in recept["param"].items():
        if "grainIn" in key:
            pauseTemp = recept["param"][key]["temp"]
        while True:
            count+=1
            print("heating")
            await heating(pauseTemp-3)


async def mashing(recept):
    global pumpFlag
    global pauseStep
    global pauseTime

    pumpFlag = True
    for key, value in sorted(recept["param"].items()):
        if "pause" in key:
            print("key: {}, value: {}".format(key,value))
            pauseStep += 1
            pauseTime = int(recept["param"][key]["time"])*60
            pauseTemp = recept["param"][key]["temp"]
            while pauseTime > 0:
                await heating(pauseTemp)
            recept["param"][key]["time"] = str(pauseTime)
            
    heat.value(0)
    pump.value(0)

    return False


async def boiling(recept):
    global pumpFlag
    pumpFlag = False
    for key, value in recept["param"].items():
        if "boil" in key:
            print("key: {}, value: {}".format(key,value))
            pauseTime = int(recept["param"][key]["time"])*60
            pauseTemp = recept["param"][key]["temp"]
            while pauseTime > 0:
                tempSensor = await getTemp()
                tempKub = tempSensor[0]
                await heating(recept)
                if float(tempKub) >= float(pauseTemp):
                    pauseTime -= 1
            recept["param"][key]["time"] = str(pauseTime)
    heat.value(0)
    return False



async def web_page(request):
    if request.find('style.css') > 0:
        return 'style.css'

    elif request.find('script.js') > 0:
        return 'script.js' 

    elif request.find('highcharts.js') > 0:
        return 'highcharts.js' 

    elif request.find('plotCharts.js') > 0:
        return 'plotCharts.js' 

    elif request.find('/?temp') > 0:
        return 'temperature.log'

    elif request.find('/?heat') > 0:
        heat.value(not heat.value())
        return 'temperature.log'

    elif request.find('/?pump') > 0:
        pump.value(not pump.value())
        return 'temperature.log'

    elif request.find('/?brew=') > 0:
        global count
        recept = request.replace('%20', ' ').replace('%22', '"').split(' ')[2]
        recept = json.loads(recept)
        print(count)
        if count == 0:
            #add grain in kittle
            grainIn(recept)
            count+=1
        elif count == 1:
            brew = True
            while brew == True:
                print("mashing")
                brew = await mashing(recept)
                print('finish mashing')
            count+=1
        elif count == 2:
            washing = True
            print("Wash grain")
            count+=1
        elif count == 3:
            print("Boil")
            boil = True
            #while boil == True:
            #   boil = boiling(recept)
            count+=1
    return 'index.html'

async def web_handler(reader, writer):
    try:
        request = str(await reader.read(1024))
        header = """HTTP/1.1 200 OK\nContent-Type: text/html\nConnection: close\n\n"""
        data = await web_page(request)
        await writer.awrite(header)
        handle = open(data, "r")
        while True:
            chain = handle.read(1024*2)
            await writer.awrite(chain)
            if not chain:
                break
        await writer.aclose()
    except Exception as e:
        #print(e)
        raise e
    
async def tcp_server(host, port):
    server = await asyncio.start_server(web_handler, host, port, backlog=2)


loop = asyncio.get_event_loop()
loop.create_task(memAlloc(interval_ms=5000))
loop.create_task(temperature(interval_ms=1000))
loop.create_task(tcp_server('0.0.0.0', 80))
loop.run_forever()