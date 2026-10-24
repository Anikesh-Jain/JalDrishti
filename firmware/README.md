# JalDrishti — Ready-Made Hardware Architecture & Firmware Specification

This document details the engineering specifications, data flow, Wi-Fi provisioning architecture, and deployment procedures for the **JalDrishti Ready-Made Inline Water Quality Monitoring Device**.

---

## 1. Hardware Concept: Ready-Made Appliance vs. Citizen DIY

A core requirement of JalDrishti is that **citizens are consumers of clean water intelligence, not electronics assemblers**:

- **No breadboards or jumper wires:** The citizen does not touch microcontrollers, GPIO headers, or exposed circuit traces.
- **Factory-Sealed Housing:** The sensing electronics, analog conditioning circuits, ESP32-S3 microcontroller, and power regulation are sealed within an **IP67 water-resistant ABS probe collar housing**.
- **Mechanical Pipeline Installation:** Installation is restricted to standard plumbing operations:
  1. Relieving supply pipe water pressure.
  2. Inserting a standard 3/4" (or 1/2") NPT/BSP inline Tee-joint fitting.
  3. Aligning the molded probe flow arrow with the incoming water stream.
  4. Hand-tightening the threaded waterproof probe collar with silicone O-ring gasket.
  5. Connecting the 12V DC power barrel adapter to a standard electrical outlet.

---

## 2. Integrated Sensing Parameters

The ready-made hardware measures four fundamental parameters aligned with Bureau of Indian Standards (**BIS IS 10500:2012**):

| Parameter | Unit | Safe Permissible Range | Sensor Component |
| :--- | :--- | :--- | :--- |
| **pH** | pH scale (0.0 - 14.0) | 6.5 – 8.5 | Industrial gel-filled analog glass electrode probe |
| **Turbidity** | NTU (Nephelometric) | 0.0 – 5.0 NTU | Optical 90° infrared light-scattering photocell |
| **Total Dissolved Solids (TDS)** | ppm (mg/L) | 0 – 500 ppm | Corrosion-resistant dual-pin electrical conductivity probe |
| **Water Temperature** | °C | 10.0 – 40.0 °C | DS18B20 digital stainless-steel thermal probe |

> **Crucial Distinction:** Physical sensor probes measure chemical acidity, dissolved ionic salts, and colloidal scattering directly in the water stream. Citizen photographs submitted to AI Water Image Screening are helpful for visible cloudiness and debris, but **cannot** reliably establish chemical pH, TDS, microbial safety, or statutory potability.

---

## 3. Telemetry Architecture & Data Path

```mermaid
graph LR
    A[Ready-Made Inline Sensor] -->|WPA2 2.4 GHz Wi-Fi| B[Local Wi-Fi Router]
    B -->|Encrypted HTTPS / Webhook| C[Blynk IoT Cloud / REST Gateway]
    C -->|POST /api/sensor/readings| D[JalDrishti Node.js Backend]
    D -->|Persist Readings & Alerts| E[MongoDB]
    D -->|Authenticated Bearer API| F[Citizen Web Dashboard]
```

1. **Sensing Cycle:** Every 30 seconds (configurable), the internal firmware samples analog voltage levels, applies temperature compensation, and constructs a clean JSON payload.
2. **Device Authentication:** Requests carry an authoritative `x-device-key` header verified against the stored hash on the server.
3. **Threshold Engine:** The JalDrishti backend compares readings against configured BIS thresholds, transitions alert lifecycles, and dispatches emergency SMS alerts when breaches occur.

---

## 4. Supported Wi-Fi Provisioning Mechanisms

The JalDrishti hardware supports two verified provisioning methods:

### Method A: SoftAP Captive Portal (Standard Out-of-the-Box Flow)
1. When unprovisioned or when the reset button is held for 5 seconds, the ESP32-S3 broadcasts a local access point: `JalDrishti-Setup-XXXX`.
2. The citizen connects their phone or laptop to this Wi-Fi network and is redirected to the embedded portal at `http://192.168.4.1`.
3. The citizen selects their home 2.4 GHz network name and enters the WPA2 password.
4. Credentials are saved directly into ESP32 Non-Volatile Storage (NVS). **Passwords never touch the cloud server.**
5. The device restarts, connects to the home network, and begins streaming telemetry.

### Method B: Blynk Edgent / In-App Signal Bridge
- For deployments utilizing the Blynk ecosystem, the device supports BLE/Wi-Fi smart provisioning via Blynk Edgent (`TMPL_JAL_DRISHTI`).
- The citizen inputs their Wi-Fi SSID in the JalDrishti web application. The application records the verified network name and initiates handshake verification.

---

## 5. Security & Ownership Protection

- **Device Secrets:** Wi-Fi passwords and device private keys are strictly quarantined. Wi-Fi passwords are saved only in ESP32 hardware flash; they are **never** logged, queried, or stored in MongoDB.
- **Physical Claim Code Verification:** To prevent unauthorized citizens from claiming an arbitrary device ID, each unit has a unique **Claim Secret Code** printed on its physical rating plate. The backend verifies this code using SHA-256 or bcrypt before linking ownership.
- **No Simulated Status in Production:** The application displays devices as `Receiving Data` only when fresh telemetry arrives within the 15-minute active window.

---

## 6. Manufacturing & Flashing Procedure (Technicians Only)

1. Connect the ESP32-S3 module via USB-C to the programming fixture.
2. Open `firmware/JalDrishti_ESP32_ReadyMade.ino` in Arduino IDE or PlatformIO.
3. Install required libraries: `Preferences`, `OneWire`, `DallasTemperature`.
4. Select Board: **ESP32S3 Dev Module**, Flash Size: **8MB**, Partition Scheme: **Default 4MB with SPIFFS/NVS**.
5. Compile and upload firmware.
6. Verify serial output at 115200 baud:
   ```text
   [JalDrishti] Hardware boot initialized.
   [SoftAP Mode] Broadcasting JalDrishti-Setup-A1B2
   [SoftAP Mode] Captive Portal IP: 192.168.4.1
   ```
7. Affix waterproof casing, install calibration probe collar, and print device label with unique Node ID and Claim Secret.
