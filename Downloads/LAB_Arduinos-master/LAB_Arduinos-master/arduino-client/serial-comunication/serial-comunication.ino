int LED1 = 10;
int POTEN = A1;
int potValue = 0;
int dimmer = 0;

void setup() {
  pinMode(LED1, OUTPUT);
  pinMode(POTEN, INPUT);
  Serial.begin(9600);
}

void loop() {
  potValue = analogRead(POTEN);
  dimmer = map(potValue, 0, 1023, 0, 255);
  
  String jsonString = "{\"potValue\":" + String(dimmer) + "}";
  Serial.println(jsonString);

  if (Serial.available() > 0) {
    String message = Serial.readStringUntil('\n');
    message.trim();
    
    if (message.equals("ON")) {
      digitalWrite(LED1, HIGH);
    } else if (message.equals("OFF")) {
      digitalWrite(LED1, LOW);
    }
  }

  delay(100);
}
