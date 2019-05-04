//paquetes necesarios para el proyecto
var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var competenciasController = require('./controladores/competenciasController.js')

var app = express()

app.use(cors())

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());

//get competencias
app.get('/competencias', competenciasController.listarCompetencias)

//post competencia
app.post('/competencias', competenciasController.crearCompetencia)

//reiniciar competencia
app.delete('/competencias/:id/votos', competenciasController.reiniciarCompetencia)

//delete competencia
app.delete('/competencias/:id', competenciasController.eliminarCompetencia)

//update competencia
app.put('/competencias/:id', competenciasController.editarCompetencia)

//get competencia
app.get('/competencias/:id', competenciasController.obtenerCompetencia)

//get competencia
app.get('/competencias/:id/peliculas', competenciasController.obtenerOpciones)

//get generos
app.get('/generos', competenciasController.obtenerGeneros)

//get drectores
app.get('/directores', competenciasController.obtenerDirectores)

//get actores
app.get('/actores', competenciasController.obtenerActores)

//set voto
app.post('/competencias/:id/voto', competenciasController.votar)

//get resultados competencia
app.get('/competencias/:id/resultados', competenciasController.obtenerResultados)

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function() {
  console.log("Escuchando en el puerto " + puerto)
})