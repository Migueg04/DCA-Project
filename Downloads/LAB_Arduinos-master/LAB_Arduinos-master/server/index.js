const express = require("express");
const cors = require("cors");
const path = require("path");
const { createServer } = require("http");
const { SerialPort, ReadlineParser } = require("serialport");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);
app.use(express.static(path.join(__dirname, "../client")));

const io = new Server(httpServer, {
  path: "/real-time",
  cors: {
    origin: "*",
  },
});

SerialPort.list().then((ports) => {
  console.log("Puertos disponibles:");
  ports.forEach(port => {
    console.log(`- ${port.path} (${port.manufacturer || 'Desconocido'})`);
  });
});

let port = null;
let parser = null;

try {
  port = new SerialPort({
    path: "COM8",
    baudRate: 9600,
  });

  parser = new ReadlineParser({ delimiter: "\r\n" });
  port.pipe(parser);

  parser.on("data", (data) => {
    try {
      const trimmed = data.toString().trim();
      if (trimmed.length > 0) {
        const sensorData = JSON.parse(trimmed);
        console.log("Datos recibidos:", sensorData);
        io.emit("sensorData", sensorData);
      }
    } catch (error) {
      console.log("Error parseando JSON:", error.message);
      console.log("Datos crudos:", data.toString());
    }
  });

  port.on("error", (err) => {
    console.log("Error en puerto serial:", err.message);
  });

  port.on("open", () => {
    console.log("Puerto serial abierto: COM8");
  });

  port.on("close", () => {
    console.log("Puerto serial cerrado");
  });
} catch (error) {
  console.log("Error creando puerto serial:", error.message);
}

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);
  
  socket.on("turn-on", () => {
    console.log("Comando: ENCENDER LED");
    if (port && port.isOpen) {
      port.write("ON\n", (err) => {
        if (err) {
          console.log("Error escribiendo:", err.message);
        } else {
          console.log("Comando ON enviado");
        }
      });
    } else {
      console.log("Puerto no disponible");
    }
  });
  
  socket.on("turn-off", () => {
    console.log("Comando: APAGAR LED");
    if (port && port.isOpen) {
      port.write("OFF\n", (err) => {
        if (err) {
          console.log("Error escribiendo:", err.message);
        } else {
          console.log("Comando OFF enviado");
        }
      });
    } else {
      console.log("Puerto no disponible");
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

httpServer.listen(5050, () => {
  console.log(`Servidor corriendo en http://localhost:5050`);
  console.log(`Abre el navegador en: http://localhost:5050`);
});
