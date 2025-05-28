// Importa el módulo express para crear el servidor web
const express = require("express");

// Crea una aplicación express
const app = express();

// Define el puerto en el que el servidor escuchará
const port = process.env.PORT || 5000;

// Middleware para interpretar el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Ruta de prueba para verificar que el servidor funciona
app.get("/", (req, res) => {
  res.send("Servidor Node corriendo correctamente");
});

// Inicia el servidor y escucha en el puerto definido
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
