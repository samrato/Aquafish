#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend URL (no spaces!)
const char* serverURL = "http://your_localhost/api/add-data";

// Sensor pins (change to your hardware setup)
#define NITROGEN_PIN 34
#define PHOSPHORUS_PIN 35
#define OXYGEN_PIN 32

#define DS18B20_PIN 33      // DS18B20 data pin (use 4.7k pull-up resistor)
#define PIR_PIN 14          // PIR motion sensor digital pin

// Ultrasonic sensor pins
#define ULTRASONIC_TRIG_PIN 12
#define ULTRASONIC_ECHO_PIN 13

// Output pins for motor, buzzer, and LED
#define MOTOR_PIN 25
#define BUZZER_PIN 26
#define LED_PIN 27

// Location (replace with GPS reading if available)
float latitude = -0.180472;
float longitude = 34.747611;

// DS18B20 Setup
OneWire oneWire(DS18B20_PIN);
DallasTemperature sensors(&oneWire);

// Timing variables for blinking and buzzer beep
unsigned long previousBlinkMillis = 0;
unsigned long previousBuzzerMillis = 0;

int ledState = LOW;
int blinkIntervalNormal = 1000;  // 1 sec blink when normal
int blinkIntervalFast = 200;     // fast blink when abnormal

int buzzerInterval = 500;        // buzzer beep interval (ms)
bool buzzerState = LOW;

bool isAbnormal = false;

void setup() {
  Serial.begin(115200);
  
  // Init pins
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);

  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);

  // Turn everything off initially
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  // Initialize DS18B20 sensor
  sensors.begin();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

// Function to get distance from ultrasonic sensor in cm
long readUltrasonicDistance() {
  // Clear trigger
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  // Trigger the sensor by setting the trigger pin high for 10 microseconds
  digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);

  // Read the echo pin: duration of pulse in microseconds
  long duration = pulseIn(ULTRASONIC_ECHO_PIN, HIGH, 30000); // Timeout 30ms to avoid blocking
  
  if (duration == 0) {
    // No echo received (timeout)
    return -1;
  }

  // Calculate distance in cm (speed of sound 343 m/s)
  long distanceCm = duration * 0.0343 / 2;
  return distanceCm;
}

void loop() {
  // Read analog sensors
  float nitrogen = analogRead(NITROGEN_PIN) * (5.0 / 4095.0);
  float phosphorus = analogRead(PHOSPHORUS_PIN) * (5.0 / 4095.0);
  float oxygen = analogRead(OXYGEN_PIN) * (10.0 / 4095.0);

  // Read DS18B20 temperature sensor
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);

  // Read PIR motion sensor (digital HIGH = motion detected)
  bool motionDetected = digitalRead(PIR_PIN) == HIGH;

  // Read ultrasonic sensor distance
  long distanceCm = readUltrasonicDistance();

  Serial.printf("Nitrogen: %.2f V, Phosphorus: %.2f V, Oxygen: %.2f V, Temp: %.2f C, Motion: %s, Distance: %ld cm\n",
                nitrogen, phosphorus, oxygen, temp, motionDetected ? "Yes" : "No", distanceCm);

  // Send data to backend if WiFi connected
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<300> jsonDoc;  // increased size for new data
    jsonDoc["nitrogen"] = nitrogen;
    jsonDoc["phosphorus"] = phosphorus;
    jsonDoc["oxygen"] = oxygen;
    jsonDoc["temp"] = temp;
    jsonDoc["motion"] = motionDetected;
    jsonDoc["distance_cm"] = distanceCm;
    jsonDoc["location"] = String(latitude) + "," + String(longitude);
    jsonDoc["id"] = "YOUR_CAGE_ID";

    String requestBody;
    serializeJson(jsonDoc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);

      StaticJsonDocument<200> respDoc;
      DeserializationError error = deserializeJson(respDoc, response);
      if (!error) {
        if (respDoc.containsKey("move")) {
          isAbnormal = true;  // backend detected abnormality
          Serial.println("Abnormal detected! Activating alerts...");
        } else {
          isAbnormal = false;
        }
      } else {
        Serial.println("Failed to parse response JSON");
        isAbnormal = false;
      }
    } else {
      Serial.printf("Error in POST: %s\n", http.errorToString(httpResponseCode).c_str());
      isAbnormal = false;
    }
    http.end();
  } else {
    Serial.println("WiFi not connected");
    isAbnormal = false;
  }

  // Activate motor, buzzer, and LED based on abnormal status
  unsigned long currentMillis = millis();

  if (isAbnormal) {
    digitalWrite(MOTOR_PIN, HIGH);

    // Buzzer beep logic (toggle every buzzerInterval ms)
    if (currentMillis - previousBuzzerMillis >= buzzerInterval) {
      previousBuzzerMillis = currentMillis;
      buzzerState = !buzzerState;
      digitalWrite(BUZZER_PIN, buzzerState);
    }

    // Fast blinking LED
    if (currentMillis - previousBlinkMillis >= blinkIntervalFast) {
      previousBlinkMillis = currentMillis;
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
    }
  } else {
    // Normal operation: motor and buzzer off
    digitalWrite(MOTOR_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);

    // Slow blinking LED
    if (currentMillis - previousBlinkMillis >= blinkIntervalNormal) {
      previousBlinkMillis = currentMillis;
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
    }
  }

  delay(1000); // Wait 1 second before next reading
}
