
from machine import Pin, I2C, PWM
import network
import uasyncio as asyncio
import DS3231

import uos
#import sys
import utime
import ujson as json
import onewire, ds18x20

import esp
esp.osdebug(None)

import gc
gc.enable()


def ap_station():
    station = network.WLAN(network.AP_IF) 
    station.active(True)
    station.config(essid='Teplichka', password="", authmode=1) #AP_IF
    while station.isconnected() == False:
        pass

    print("AP_Point_Active")
    print('Connection successful')
    print(station.ifconfig()[0])
    print(gc.mem_free())

#ap_station()

def sta_station():
    ssid = 'Medic'
    password = '171797YasenSolo'
    station = network.WLAN(network.STA_IF)
    if not station.isconnected():
        print('Connecting...')
        # Enable the interface
        station.active(True)
        station.connect(ssid, password)
        for i in range(50):
            if not station.isconnected():
                utime.sleep_ms(5000)
            elif station.isconnected():
                print("STA_IF_Point_Active")
                print('Connection successful')
                print(station.ifconfig()[0])
                print(gc.mem_free())
                break
                
        if not station.isconnected():
            ap_station()

sta_station()


syst_led =  Pin(2, Pin.OUT)
pump = Pin(3, Pin.OUT)
buzz = Pin(4, Pin.OUT)
#beeper = PWM(buzz, freq=440, duty=512)
heat = Pin(13, Pin.OUT)
term = Pin(5)
try:
    i2c = I2C(sda = Pin(14), scl=Pin(12))    
    rtc = DS3231.DS3231(i2c)
    realTimeClock = True
except:
    realTimeClock = False
    pass

pumpFlag = False
grainIn = False
# create the onewire object
ds = ds18x20.DS18X20(onewire.OneWire(term))
# scan for devices on the bus
roms = ds.scan()


def createLog():
    cont = uos.stat('logfile.json')[6]
    print(cont)
    if cont == 0:
    	with open('logfile.json', 'w') as json_file:
    		json_data={}
    		json_data["time"]=[]
    		json_data["temp1"]=[]
    		json_data["temp2"]=[]
    		json_data["temp3"]=[]
    		json.dump(json_data, json_file)
    else:
        pass

#createLog()
    

def chart():
    with open('logfile.json', 'r') as json_file:
        json_data = json.load(json_file)
        print(json_data)
    return json_data

async def pumpGuard(interval_ms):
    tempGuard = 78	
    temp = await temperature()
    if temp[0] >= tempGuard:
        pump.value(0)
        return False
    else:
        return True
    await asyncio.sleep_ms(interval_ms)


async def appendLog(interval_ms, realTimeClock):
    while realTimeClock == True:
        try:
            timeList = rtc.Time()
            time = str(timeList[0])+":"+str(timeList[1])
            temp = await temperature()
            with open('logfile.json', 'r') as json_file:
                json_data = json.load(json_file)
                json_data["time"].append(time)
                json_data["temp1"].append(temp[0])
                json_data["temp2"].append(temp[1])
                json_data["temp3"].append(temp[2])
                print(json_data)
                print(gc.mem_free())
            with open('logfile.json', 'w') as json_file:
                json.dump(json_data, json_file)
            await asyncio.sleep_ms(interval_ms)
        except Exception as e:
            print(e)
            pass

async def memAlloc(interval_ms):
    while True:
        gc.collect()
        gc.threshold(gc.mem_free() // 4 + gc.mem_alloc())
        await asyncio.sleep_ms(interval_ms)

async def blink_led(led, interval_ms):
    led_val = True
    while True:
        led_val = not(led_val)
        led_state = led.value(int(led_val))
        await asyncio.sleep_ms(interval_ms)

def fileReturn(textFile):
    with open(textFile, 'r') as file:
        html = file.read()
    return html


async def temperature():
    try:
        temperatures = []
        ds.convert_temp()
        for sensor in roms:
            for data in sensor:
                t = ds.read_temp(sensor)
            temperatures.append(t)
        temperatures.append(pump.value())
        temperatures.append(heat.value())
    except:
        temperatures = [0,0,0]    
    return temperatures


async def pumpWorks(interval_ms):
    global pumpFlag
    pumpFlag = True
    while True:
        if pumpFlag == True:
            pump.value(1)
            await asyncio.sleep_ms(5000)
            pump.value(0)
            await asyncio.sleep_ms(5000)
        elif pumpFlag == False:
            pump.value(0)
            await asyncio.sleep_ms(0)
        await asyncio.sleep_ms(interval_ms)



async def heating(recept):
    global pumpFlag
    pumpFlag = True

    recept = json.loads(recept)
    #grain IN mash tank
    for key, value in recept["param"].items():
        if "grainIn" in key:
            print("key: {}, value: {}".format(key,value))
            pauseTemp = recept["param"][key]["temp"]
            while True:
                tempSensor = await temperature()
                tempKub = tempSensor[0]
                if float(tempKub)+1 < float(pauseTemp):
                    heat.value(1)
                else:
                    heat.value(0)
                    pauseTime = pauseTime - 1
                await asyncio.sleep_ms(1000)
    pumpFlag = False
    heat.value(0)
    pump.value(0)

async def mashing(recept):
    global pumpFlag
    pumpFlag = True

    recept = json.loads(recept)
    for key, value in recept["param"].items():
        if "pause" in key:
            print("key: {}, value: {}".format(key,value))
            pauseTime = int(recept["param"][key]["time"])*60
            pauseTemp = recept["param"][key]["temp"]
            while pauseTime > 0:
                tempSensor = await temperature()
                tempKub = tempSensor[0]
                if float(tempKub)+1 < float(pauseTemp):
                    #print('start nagrev')
                    heat.value(1)
                else:
                    #print('podderzka TMP')
                    heat.value(0)
                    pauseTime = pauseTime - 1
                #print(pauseTime)
                await asyncio.sleep_ms(1000)

            recept["param"][key]["time"] = str(pauseTime)
            heat.value(0)
            pump.value(0)
    pumpFlag = False
    for key, value in recept["param"].items():
        if "boil" in key:
            print("key: {}, value: {}".format(key,value))

    
    return False

count = 0

async def web_page(request):
    if request.find('style.css') > 0:
        return fileReturn('style.css')

    elif request.find('script.js') > 0:
        return fileReturn('script.js')

    elif request.find('/?temp') > 0:
        return ('%s\n' % (await temperature()))

    elif request.find('/?heat') > 0:
        heat.value(not heat.value())
        beeper = PWM(buzz, freq=490, duty=900)
        await asyncio.sleep_ms(1000)
        beeper.deinit()

    elif request.find('/?pump') > 0:
        pump.value(not pump.value())

    elif request.find('/?brew=') > 0:
        global grainIn
        recept = request.replace('%20', ' ').replace('%22', '"').split(' ')[2]
        brew = True
        grainIn = not grainIn
        while grainIn == True:
            print(heating)
            grainIn = await heating(recept)
        while brew == True:
            print(mashing)
            brew = await mashing(recept)

    print(gc.mem_free())

    return fileReturn('index.html')

async def web_handler(reader, writer):
    try:
        request = str(await reader.read(512))
        #print('request = %s' % request)
        header = """HTTP/1.1 200 OK\nContent-Type: text/html\nConnection: close\n\n"""
        response = await web_page(request)
        await writer.awrite(header)
        await writer.awrite(response)
        await writer.aclose()
        #print("Finished processing request")
    except Exception as e:
        #print(e)
        raise e

    
async def tcp_server(host, port):
    server = await asyncio.start_server(web_handler, host, port)


#create looped tasks
loop = asyncio.get_event_loop()
loop.create_task(pumpWorks(interval_ms=1000))
loop.create_task(memAlloc(interval_ms=700))
#loop.create_task(appendLog(interval_ms=60000, realTimeClock=realTimeClock))
loop.create_task(pumpGuard(interval_ms=500))
loop.create_task(blink_led(syst_led, interval_ms=250))
loop.create_task(tcp_server('0.0.0.0', 80))
loop.run_forever()