document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:5050", { path: "/real-time" });

  const turnOnButton = document.getElementById("turn-on-button");
  const turnOffButton = document.getElementById("turn-off-button");
  const square = document.querySelector("#square");
  const potValue = document.getElementById("pot-value");
  const connectionStatus = document.getElementById("connection-status");

  socket.on("connect", () => {
    console.log("✅ Conectado al servidor");
    connectionStatus.textContent = "✅ Conectado al servidor";
    connectionStatus.className = "status connected";
  });

  socket.on("disconnect", () => {
    console.log("❌ Desconectado del servidor");
    connectionStatus.textContent = "❌ Desconectado del servidor";
    connectionStatus.className = "status disconnected";
  });

  socket.on("connect_error", (error) => {
    console.log("❌ Error de conexión:", error);
    connectionStatus.textContent = "❌ Error de conexión - Verifica que el servidor esté corriendo";
    connectionStatus.className = "status disconnected";
  });

  if (turnOnButton) {
    turnOnButton.addEventListener("click", () => {
      console.log("Enviando: turn-on");
      socket.emit("turn-on");
    });
  }

  if (turnOffButton) {
    turnOffButton.addEventListener("click", () => {
      console.log("Enviando: turn-off");
      socket.emit("turn-off");
    });
  }

  socket.on("sensorData", (data) => {
    console.log("📊 Datos recibidos:", data);
    
    if (data && data.potValue !== undefined && potValue && square) {
      const value = parseInt(data.potValue);
      potValue.textContent = value;
      
      const size = 50 + (value * 0.8);
      square.style.width = size + "px";
      square.style.height = size + "px";
      
      const red = Math.min(255, value);
      const blue = Math.max(0, 255 - value);
      square.style.backgroundColor = `rgb(${red}, 10, ${blue})`;
    }
  });
});
