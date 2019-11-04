/**************************************************************

   Cycle-On Arduino Code
   This code connects the Arduino to CycleOn Servers

 **************************************************************/

#define TINY_GSM_MODEM_SIM800

// Increase RX buffer if needed
//#define TINY_GSM_RX_BUFFER 512
#include <TinyGPS++.h>
#include <TinyGsmClient.h>
#include <ArduinoHttpClient.h>
#include "Timer.h"

// Uncomment this if you want to see all AT commands
//#define DUMP_AT_COMMANDS

// Set serial for debug console (to the Serial Monitor, default speed 115200)
#define SerialMon Serial

#define SerialAT Serial1

// initialize GPS
static const uint32_t GPSBaud = 9600 ;
TinyGPSPlus gps;
#define ss Serial2

#define TINY_GSM_DEBUG SerialMon

#define GSM_AUTOBAUD_MIN 9600
#define GSM_AUTOBAUD_MAX 38400

// Timer
Timer t;

// Your GPRS credentials
// Leave empty, if missing user or pass
const char apn[]  = "www";
const char user[] = "";
const char pass[] = "";

// Server details
char serverAddress[] = "cycle-on.herokuapp.com";  // server address
int port = 80;

#ifdef DUMP_AT_COMMANDS
#include <StreamDebugger.h>
StreamDebugger debugger(SerialAT, SerialMon);
TinyGsm modem(debugger);
#else
TinyGsm modem(SerialAT);
#endif

TinyGsmClient client(modem);
WebSocketClient wsclient = WebSocketClient(client, serverAddress, port);
int count = 0;

bool prevLocked;

#include <Servo.h>
Servo myservo;
int motorPin = 3;
int pos = 0;

String cycleId = "test";

void setup() {
  SerialMon.println("Reached Setup");
  prevLocked = true;
  myservo.attach(motorPin);
  myservo.write(30);
  // Set console baud rate
  SerialMon.begin(9600);
  delay(10);
  ss.begin(GPSBaud);

  // Set GSM module baud rate
  TinyGsmAutoBaud(SerialAT,GSM_AUTOBAUD_MIN,GSM_AUTOBAUD_MAX);

  SerialMon.print(F("Initializing modem..."));
  if (!modem.restart()) {
    DBG("Failed to restart modem, delaying 10s and retrying");
    delay(3000);
    // restart autobaud in case GSM just rebooted
    TinyGsmAutoBaud(SerialAT,GSM_AUTOBAUD_MIN,GSM_AUTOBAUD_MAX);
    delay(10000);
    return;
  }

  String modemInfo = modem.getModemInfo();
  SerialMon.print(F("Modem: "));
  SerialMon.println(modemInfo);

    SerialMon.print(F("Waiting for network..."));
  if (!modem.waitForNetwork()) {
    SerialMon.println(" fail");
    delay(10000);
    return;
  }
  SerialMon.println(" OK");

  SerialMon.print(F("Connecting to "));
  SerialMon.print(apn);
  if (!modem.gprsConnect(apn, user, pass)) {
    SerialMon.println(" fail");
    delay(10000);
    return;
  }
  SerialMon.println(" OK");

  SerialMon.println("Starting WebSocket client");
  wsclient.begin();
  registerCycle();

  while(client.connected()){
    int messageSize = wsclient.parseMessage();

    if (messageSize > 0) {
      String response = wsclient.readString();
      if(response != "Data Saved!") {
        SerialMon.print("Unable to Register Cycle");
        return;
      } else {
        break;
      }
    }
  }

  t.every(5000, updateData, 0);
}

void loop() {
  t.update();
}

void registerCycle() {
  String latitude = String(gps.location.lat(), 6);
  String longitude = String(gps.location.lng(), 6); 
  
  SerialMon.println("Reg");
  wsclient.beginMessage(TYPE_TEXT);
  wsclient.print("reg ");
  wsclient.print(cycleId + " ");
  wsclient.print(latitude + " ");
  wsclient.print(longitude + " ");
  wsclient.print("true ");
  wsclient.endMessage();
  
}

void updateData() {
  String latitude = String(gps.location.lat(), 6);
  String longitude = String(gps.location.lng(), 6);
  
  bool locked;
  
  SerialMon.println("Update");
  wsclient.beginMessage(TYPE_TEXT);
  wsclient.print("update ");
  wsclient.print(cycleId + " ");
  wsclient.print(latitude + " ");
  wsclient.print(longitude + " ");
  wsclient.print("true ");
  wsclient.endMessage();

  
  while(client.connected()){
    int messageSize = wsclient.parseMessage();

    if (messageSize > 0) {
      String response = wsclient.readString();
      SerialMon.print("R:");
      SerialMon.println(response);
      int i_response = response.toInt();
      switch(i_response) {
        case 111:
        locked = true;
        break;
        case 110:
        locked = false;
        break;
        case 101:
        locked = true;
        break;
        case 100:
        locked = false;
        break;
        default:
        locked = true;
        break;
      }
      break;
    }
  }

  if(!prevLocked && locked == true){
    lockMotor();
  }

  if(prevLocked && locked == false){
    unlockMotor();
  }

  prevLocked = locked;
}

void lockMotor() {
  myservo.write(30);
}

void unlockMotor() {
  myservo.write(80);
}
