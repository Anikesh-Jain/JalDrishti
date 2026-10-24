/**
 * JalDrishti — ESP32-S3 Ready-Made Inline Pipeline Water Quality Monitor Firmware
 *
 * Target Hardware: ESP32-S3-WROOM-1 / Custom Sealed Inline Probe Unit
 * Operating Voltage: 12V DC Adapter (internal 3.3V LDO regulator)
 * Enclosure: IP67 Waterproof Inline Probe Housing with 3/4" NPT/BSP fitting
 *
 * Sensors Integrated:
 * 1. Industrial Analog pH Electrode Probe (ADC1 Channel, GPIO 34)
 * 2. Optical Nephelometric Turbidity Sensor (ADC1 Channel, GPIO 35)
 * 3. Analog Total Dissolved Solids (TDS) Probe (ADC1 Channel, GPIO 32)
 * 4. DS18B20 Digital Waterproof Temperature Sensor (1-Wire, GPIO 4)
 *
 * Provisioning & Connectivity:
 * - SoftAP Captive Portal: Automatically launches SSID "JalDrishti-Setup-XXXX" at 192.168.4.1
 *   if no valid Wi-Fi credentials are saved in Non-Volatile Storage (NVS).
 * - Direct REST Ingestion: POST /api/sensor/readings with HTTP header x-device-key
 * - Blynk IoT Integration: Supports Blynk webhook forwarding or Blynk Edgent
 * - Factory Claim Code: Printed on the physical device label (e.g. CLAIM-XXXXXX)
 *
 * NOTE FOR CITIZENS:
 * Citizens DO NOT flash, compile, or assemble this firmware.
 * This sketch is factory-flashed into the sealed ready-made appliance prior to distribution.
 */

#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- Hardware Pin Definitions (Factory Sealed Circuit) ---
#define PIN_PH_SENSOR          34   // ADC1_CH6 (Analog pH probe)
#define PIN_TURBIDITY_SENSOR   35   // ADC1_CH7 (Optical Turbidity)
#define PIN_TDS_SENSOR         32   // ADC1_CH4 (Analog TDS probe)
#define PIN_ONE_WIRE_BUS       4    // DS18B20 1-Wire Data
#define PIN_STATUS_LED         2    // WS2812 / RGB Status LED (Aqua=Connected, Amber=AP Mode)
#define PIN_RESET_BUTTON       0    // Physical push-button for NVS factory reset (Hold 5s)

// --- Default Configuration ---
#define FACTORY_NODE_ID        "NODE-01-INDORE-WARD12"
#define FACTORY_CLAIM_CODE     "CLAIM-WARD12"
#define BACKEND_INGEST_URL     "http://192.168.1.100:5000/api/sensor/readings"
#define DEVICE_KEY_SECRET      "KEY_NODE-01-INDORE-WARD12_SECURE"
#define TELEMETRY_INTERVAL_MS  30000 // Sample & transmit every 30 seconds

// --- Global Objects ---
Preferences preferences;
WebServer server(80);
DNSServer dnsServer;
OneWire oneWire(PIN_ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

// Stored Settings
String wifiSsid = "";
String wifiPassword = "";
String nodeId = FACTORY_NODE_ID;
String deviceKey = DEVICE_KEY_SECRET;
bool isProvisioned = false;
unsigned long lastTransmitTime = 0;

// --- HTML Captive Portal Page ---
const char CAPTIVE_PORTAL_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JalDrishti Device Setup</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F0FAFF; color: #163344; padding: 20px; }
    .card { background: white; max-width: 400px; margin: 30px auto; padding: 25px; border-radius: 20px; border: 1px solid #BAE6FD; box-shadow: 0 4px 15px rgba(2,132,199,0.1); }
    h2 { color: #0284C7; margin-top: 0; font-size: 20px; }
    label { font-size: 12px; font-weight: bold; display: block; margin-top: 15px; color: #475569; }
    input { width: 100%; padding: 10px; margin-top: 5px; border-radius: 10px; border: 1px solid #BAE6FD; box-sizing: border-box; font-size: 14px; }
    button { width: 100%; padding: 12px; background: #0284C7; color: white; border: none; border-radius: 10px; font-weight: bold; margin-top: 20px; cursor: pointer; }
    .footer { font-size: 11px; color: #94A3B8; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>JalDrishti Setup</h2>
    <p style="font-size: 12px; color: #64748B;">Connect this ready-made monitor to your home 2.4 GHz Wi-Fi.</p>
    <form action="/save" method="POST">
      <label>Wi-Fi Network Name (SSID)</label>
      <input type="text" name="ssid" placeholder="Home 2.4GHz Wi-Fi" required>
      <label>Wi-Fi Password</label>
      <input type="password" name="password" placeholder="WPA2 Password" required>
      <button type="submit">Save and Connect</button>
    </form>
    <div class="footer">JalDrishti Ready-Made Monitor &bull; Factory Unit</div>
  </div>
</body>
</html>
)rawliteral";

// --- Sensor Acquisition Routines ---
float readPH() {
  int raw = analogRead(PIN_PH_SENSOR);
  float voltage = (raw / 4095.0) * 3.3;
  // Standard two-point calibration curve (pH 4.00 @ 2.65V, pH 7.00 @ 2.00V)
  float phValue = 7.00 + ((2.00 - voltage) * 3.5);
  if (phValue < 0.0) phValue = 0.0;
  if (phValue > 14.0) phValue = 14.0;
  return phValue;
}

float readTurbidity() {
  int raw = analogRead(PIN_TURBIDITY_SENSOR);
  float voltage = (raw / 4095.0) * 3.3;
  // Turbidity optical transfer function (clean water ~ 3.0V = 0.0 NTU)
  float ntu = 0.0;
  if (voltage < 2.5) {
    ntu = 3000.0;
  } else {
    ntu = -1120.4 * (voltage * voltage) + 5742.3 * voltage - 4352.9;
  }
  if (ntu < 0.0) ntu = 0.0;
  if (ntu > 50.0) ntu = 50.0;
  return ntu;
}

float readTDS(float temperatureC) {
  int raw = analogRead(PIN_TDS_SENSOR);
  float voltage = (raw / 4095.0) * 3.3;
  // Temperature compensation factor (2% per °C standard)
  float compensationFactor = 1.0 + 0.02 * (temperatureC - 25.0);
  float compensationVoltage = voltage / compensationFactor;
  // TDS calibration curve for drinking water
  float tdsValue = (133.42 * pow(compensationVoltage, 3) - 255.86 * pow(compensationVoltage, 2) + 857.39 * compensationVoltage) * 0.5;
  if (tdsValue < 0.0) tdsValue = 0.0;
  if (tdsValue > 1000.0) tdsValue = 1000.0;
  return tdsValue;
}

float readTemperature() {
  tempSensors.requestTemperatures();
  float tempC = tempSensors.getTempCByIndex(0);
  if (tempC == DEVICE_DISCONNECTED_C || tempC < -10.0 || tempC > 80.0) {
    return 23.5; // Fallback calibrated room reference
  }
  return tempC;
}

// --- Captive Portal Handlers ---
void handleRoot() {
  server.send(200, "text/html", CAPTIVE_PORTAL_HTML);
}

void handleSave() {
  if (server.hasArg("ssid") && server.hasArg("password")) {
    String newSsid = server.arg("ssid");
    String newPass = server.arg("password");

    preferences.begin("jaldrishti", false);
    preferences.putString("ssid", newSsid);
    preferences.putString("pass", newPass);
    preferences.end();

    server.send(200, "text/html", "<html><body style='font-family:sans-serif;text-align:center;padding:40px;background:#F0FAFF;'><h2 style='color:#0284C7;'>Credentials Saved!</h2><p>Rebooting device to connect to your Wi-Fi...</p></body></html>");
    delay(2000);
    ESP.restart();
  } else {
    server.send(400, "text/plain", "Missing SSID or password");
  }
}

// --- Start SoftAP Setup Mode ---
void startSoftAP() {
  WiFi.mode(WIFI_AP);
  String apSsid = "JalDrishti-Setup-" + String((uint32_t)ESP.getEfuseMac(), HEX).substring(0, 4);
  WiFi.softAP(apSsid.c_str());
  dnsServer.start(53, "*", WiFi.softAPIP());

  server.on("/", handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.onNotFound(handleRoot); // Captive portal redirect
  server.begin();

  Serial.println("[SoftAP Mode] Broadcasting " + apSsid);
  Serial.print("[SoftAP Mode] Captive Portal IP: ");
  Serial.println(WiFi.softAPIP());
}

// --- Transmit Telemetry over HTTP REST ---
void transmitTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Lost connection, skipping transmit.");
    return;
  }

  float temp = readTemperature();
  float ph = readPH();
  float turb = readTurbidity();
  float tds = readTDS(temp);

  // Construct JSON payload
  String payload = "{";
  payload += "\"nodeId\":\"" + nodeId + "\",";
  payload += "\"pH\":" + String(ph, 2) + ",";
  payload += "\"turbidity\":" + String(turb, 2) + ",";
  payload += "\"tds\":" + String((int)tds) + ",";
  payload += "\"temperature\":" + String(temp, 1);
  payload += "}";

  HTTPClient http;
  http.begin(BACKEND_INGEST_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", deviceKey);

  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    Serial.printf("[Telemetry] POST success, HTTP %d: %s\n", httpCode, payload.c_str());
  } else {
    Serial.printf("[Telemetry] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_RESET_BUTTON, INPUT_PULLUP);

  tempSensors.begin();

  // Read stored credentials from NVS
  preferences.begin("jaldrishti", true);
  wifiSsid = preferences.getString("ssid", "");
  wifiPassword = preferences.getString("pass", "");
  preferences.end();

  if (wifiSsid.length() > 0) {
    Serial.println("[WiFi] Connecting to stored SSID: " + wifiSsid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(wifiSsid.c_str(), wifiPassword.c_str());

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 25) {
      delay(500);
      Serial.print(".");
      attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[WiFi] Connected! IP: " + WiFi.localIP().toString());
      isProvisioned = true;
      digitalWrite(PIN_STATUS_LED, HIGH); // Solid aqua LED
      return;
    }
  }

  // If no credentials or connection failed, launch SoftAP
  startSoftAP();
}

void loop() {
  // Check for factory reset button (hold 5s)
  if (digitalRead(PIN_RESET_BUTTON) == LOW) {
    delay(5000);
    if (digitalRead(PIN_RESET_BUTTON) == LOW) {
      Serial.println("[Factory Reset] Clearing NVS Wi-Fi credentials...");
      preferences.begin("jaldrishti", false);
      preferences.clear();
      preferences.end();
      ESP.restart();
    }
  }

  if (!isProvisioned) {
    dnsServer.processNextRequest();
    server.handleClient();
  } else {
    if (millis() - lastTransmitTime >= TELEMETRY_INTERVAL_MS) {
      transmitTelemetry();
      lastTransmitTime = millis();
    }
  }
}
