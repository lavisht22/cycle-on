/**************************************************************

   Cycle-On Arduino Code
   This code connects the Arduino to CycleOn Servers

 **************************************************************/

#define TINY_GSM_MODEM_SIM800

// Increase RX buffer if needed
//#define TINY_GSM_RX_BUFFER 512

#include <TinyGsmClient.h>
#include <ArduinoHttpClient.h>

// Uncomment this if you want to see all AT commands
//#define DUMP_AT_COMMANDS

// Set serial for debug console (to the Serial Monitor, default speed 115200)
#define SerialMon Serial

#include <SoftwareSerial.h>
SoftwareSerial SerialAT(8, 7); // RX, TX

#define TINY_GSM_DEBUG SerialMon

#define GSM_AUTOBAUD_MIN 9600
#define GSM_AUTOBAUD_MAX 38400


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

void setup() {
  // Set console baud rate
  SerialMon.begin(9600);
  delay(10);

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
}

void loop() {
  SerialMon.println("Starting WebSocket client");
  wsclient.begin();

  while (client.connected()) {
    SerialMon.print("Sending hello ");
    SerialMon.println(count);

    // send a hello #
    wsclient.beginMessage(TYPE_TEXT);
    wsclient.print("hello ");
    wsclient.print(count);
    wsclient.endMessage();

    // increment count for next message
    count++;

    // check if a message is available to be received
    int messageSize = wsclient.parseMessage();

    if (messageSize > 0) {
      SerialMon.println("Received a message:");
      SerialMon.println(wsclient.readString());
    }

    // wait 5 seconds
    delay(5000);
  }

  SerialMon.println("disconnected");
}
