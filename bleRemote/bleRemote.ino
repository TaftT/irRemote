#include <BLEDevice.h>
#include <IRremote.h>
#include "heltec.h"

#define DEVICE_NAME         "My Remote"
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;
String message = "";
int IRSenderPin = 0;
boolean irsendmessage = false;
IRrecv recv(17);

String buttonRecv = "";

void printToScreen(String s) {
  Heltec.display->clear();
  Heltec.display->drawString(0, 0, s);
  Heltec.display->display();
}

uint64_t StrToHex( String str)
{
  char Buf[50];
  str.toCharArray(Buf, 50);
  return (uint64_t) strtoull(Buf, 0, 16);
}

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      printToScreen("BLE client connected.");
    };

    void onDisconnect(BLEServer* pServer) {
      printToScreen("BLE client disconnected.");
      BLEDevice::startAdvertising();
    }
};

class MyCharacteristicCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) {
    message = String(characteristic->getValue().c_str());
    printToScreen("BLE Received:\n" + message);

    if(message == "scan"){
//      digitalWrite(25, HIGH);
    }

    if (message.substring(0, 2)=="0x") {
//      digitalWrite(25, HIGH);
        irsendmessage = true;
      
    }
    return;
  }
};

void setup() {
  Heltec.begin(true /*display*/, false /*LoRa*/, true /*Serial*/);
  IrSender.begin(IRSenderPin, 13);
  recv.enableIRIn();
  Serial.begin(9600);
  printToScreen("Starting BLE!");

  BLEDevice::init(DEVICE_NAME);

  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
  );
  pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());
  pCharacteristic->setValue("Init");

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();
}

void loop() {
  
  if (recv.decode() && !irsendmessage) {
    Serial.println("reciving IR again");
    String buttonStr = String(recv.decodedIRData.decodedRawData, HEX);
    Serial.println("done reciving IR");
    buttonStr.toUpperCase();
    buttonRecv = "0x"+buttonStr;
    printToScreen("button: "+ buttonRecv);
    pCharacteristic->setValue(buttonRecv.c_str());
//    Serial.println(recv.decodedIRData.decodedRawData, HEX);
//    recv.printIRResultShort(&Serial);
    delay(1000);
    recv.resume();
  }

  if(irsendmessage){
      IrSender.sendNECRaw(StrToHex(message.substring(2)),4);
      irsendmessage = false;
      recv.enableIRIn();
  }
}
