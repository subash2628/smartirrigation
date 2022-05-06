#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <SocketIOclient.h>
#include <ArduinoJson.h>
#include "DHT.h"

#define USE_SERIAL Serial

//DHT sensor configuration...
#define DHTTYPE DHT11 
#define dht_dpin 0
DHT dht(dht_dpin, DHTTYPE); 
float humidity = 0 ,moisture=0, temperature = 0;
const int moisture_sensor_pin = A0;
float moisture_percentage = 0;
void displayHMT(float, float, float);


SocketIOclient webSocket;

//const char* ssid = "oppo";
//const char* password = "a11b22c33d44e55";

//const char* ssid = "Prakriti";
//const char* password = "#321@PrAkRiTi";

const char* ssid = "worldlink_fpkhr";
const char* password = "a1b2c3d4e5";

//motor codes
int ENA = D2;
int IN1 = D5;
int IN2 = D6;


void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    DynamicJsonDocument docc(1024);
    deserializeJson(docc, payload);
    JsonArray array = docc.as<JsonArray>();
    
    switch(type) {
        case sIOtype_DISCONNECT:
            USE_SERIAL.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);
            
            // join default namespace (no auto join in Socket.IO V3)
            webSocket.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
          {
            USE_SERIAL.printf("[IOc] get event: %s\n", payload);
            String event = array[0];
            Serial.println(event);

            if(event == "receive-motorstatus-broadcast"){
              int motorStatus = array[1];
              Serial.println(motorStatus);
               if(motorStatus == 1){
               digitalWrite(D1,HIGH);
               digitalWrite(LED_BUILTIN, LOW);
               digitalWrite(IN1, HIGH);
               digitalWrite(IN2, LOW);
             }
             else{
              digitalWrite(D1,LOW);
              digitalWrite(LED_BUILTIN, HIGH);
              digitalWrite(IN1, LOW);
              digitalWrite(IN2, LOW);
              }
            }

           else if(event == "receive-motorSpeed-broadcast")
           {
            int motorSpeed = array[1];
            Serial.println(motorSpeed);
            analogWrite(ENA, motorSpeed);
           }
           else
           {
            Serial.printf("No Event Match \n");
           }
            
            //for(JsonVariant v : array) {
            //    Serial.println(v.as<String>());
            //}
            
            break;
          }
        case sIOtype_ACK:
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            //hexdump(payload, length);
            break;
        case sIOtype_ERROR:
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            //hexdump(payload, length);
            break;
        case sIOtype_BINARY_EVENT:
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            //hexdump(payload, length);
            break;
        case sIOtype_BINARY_ACK:
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            //hexdump(payload, length);
            break;
    }
}


void displayHMT(float h,float m, float t){  
    //moisture_percentage = ( 100.00 - ( (m/1023.00) * 100.00 ) );
    Serial.print("Soil Moisture(in Percentage) = ");
    Serial.print(m);
    Serial.print("%   ");
  
    Serial.print("Current humidity = ");
    Serial.print(h);
    Serial.print("%  ");
    Serial.print("temperature = ");
    Serial.print(t); 
    Serial.println("C  ");
  }


void setup() {
    //pin for led
    pinMode(D1,OUTPUT);
    pinMode(LED_BUILTIN, OUTPUT);
    
    USE_SERIAL.begin(115200);
    USE_SERIAL.setDebugOutput(true);
    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

     for(uint8_t t = 4; t > 0; t--) {
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          delay(1000);
      }
    
    WiFi.begin(ssid, password);

   while(WiFi.status() != WL_CONNECTED) {
        delay(100);
        Serial.print("."); 
    }

    Serial.println();
    Serial.println("Wifi Connected Success!");
    Serial.print("NodeMCU IP Address : ");
    Serial.println(WiFi.localIP() );
    
    //webSocket.begin("192.168.43.18",5000);
    //webSocket.begin("192.168.1.83",5000);
    //webSocket.begin("smart-irrigation2628.herokuapp.com",80);
    webSocket.begin("192.168.100.112",5000);
    //webSocket.begin("192.168.17.234",5000);

    Serial.print("connected to server : ");
    Serial.println( webSocket.isConnected() );

    webSocket.onEvent(socketIOEvent);

    //motor setup 
    pinMode(ENA, OUTPUT);
    pinMode(IN1, OUTPUT);
    pinMode(IN2, OUTPUT);
    analogWrite(ENA, 0);
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
}
uint64_t now;
unsigned long messageTimestamp = 0;

void loop() {
      webSocket.loop();
      //changeMotorSpeed();

        now = millis();
        if(now - messageTimestamp > 2000) {
            messageTimestamp = now;

            moisture = analogRead(moisture_sensor_pin);
            humidity = dht.readHumidity();
            temperature = dht.readTemperature(); 
            displayHMT(humidity,moisture,temperature);
    
            // creat JSON message for Socket.IO (event)
            DynamicJsonDocument doc(1024);
            JsonArray array = doc.to<JsonArray>();
    
            // add evnet name
            // Hint: socket.on('event_name', ....
            array.add("getData");
    
            // add payload (parameters) for the event
            JsonObject param1 = array.createNestedObject();
            param1["moisture"] = (uint32_t) moisture;
            param1["humidity"] = (uint32_t) humidity;
            param1["temperature"] = (uint32_t) temperature;
    
            // JSON to String (serializion)
            String output;
            serializeJson(doc, output);
    
            // Send event
            webSocket.sendEVENT(output);
    
            // Print JSON for debugging
            //USE_SERIAL.println(output);
        }
}

/*
int ENA = D2;
//int ENB = D4;
int IN1 = D5;
int IN2 = D6;
//int IN4 = D7;
//int IN3 = D8;

void setup() {
  Serial.begin(115200);
  pinMode(ENA, OUTPUT);
  //pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  //pinMode(IN3, OUTPUT);
  //pinMode(IN4, OUTPUT); 
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  //digitalWrite(IN3, LOW);
  //digitalWrite(IN4, LOW);
  Serial.println("setup");
  
}

void loop() {
  //setDirection();
  //delay(1000);
  Serial.println("0");
  changeSpeed();
  delay(1000);
}

int maxPower = 256 ;

void setDirection() {
  analogWrite(ENA, maxPower);
  //analogWrite(ENB, maxPower);

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  //digitalWrite(IN3, HIGH);
  //digitalWrite(IN4, LOW);
  delay(5000);
  
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  //digitalWrite(IN3, LOW);
  //digitalWrite(IN4, LOW);
}

void changeSpeed() {
  Serial.println("1");
  //analogWrite(ENA, maxPower);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  
  for (int i = 0; i < maxPower; i++) {
    analogWrite(ENA, i);
    delay(20);
    Serial.println(i);
  }
  
  for (int i = maxPower; i >= 0; --i) {
    analogWrite(ENA, i);
    delay(20);
    Serial.println(i);
  }
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}*/
