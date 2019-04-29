var connection = require('../lib/conexionbd.js');

//obtener todas las competenciass
function listarCompetencias(req, res) {
  //consulta sql
  var qy = 'SELECT * FROM competencias_pelicula;'

  //mandar la consulta a la base de datos
  connection.query(qy, function(error, result, fields) {
    if (error) {
      console.log('hubo un error listarCompetencias', error)
      return res.status(404).send('hubo un error listarCompetencias', error)
    }
    //si llegue hasta aca no hubo error
    console.log('REQUES: ', req)
    //send result
    res.send(JSON.stringify(result))
  })
}

function obtenerCompetencia(id) {
  var qy = 'SELECT * FROM competencias_pelicula WHERE id=' + id + ';'

  connection.query(qy, function(error, result, fields) {
    if (error) {
      console.log(error)
      console.log('hubo un error obtenerCompetencia')
      return res.status(404).send('hubo un error obtenerCompetencia', error)
    }

    var competencia = {
      id: result[0].id,
      nombre: result[0].nombre
    }
    return competencia
  })
}

//obtener opciones
function obtenerOpciones(req, res) {
  //obtener competencia
  var qy = 'SELECT * FROM competencias_pelicula WHERE id=' + req.params.id + ';'
  var competencia
  connection.query(qy, function(error, result, fields) {
    //controles de error
    if (error) return res.status(500).json(error)
    if (result.length != 0) return res.status(404).send('No se ha encontrado la competencia solicidatada.')
    //construir la competencia
    competencia = {
      id: result[0].id,
      nombre: result[0].nombre
    }
  })

  //obtener opciones
  qy = 'SELECT * FROM pelicula ORDER BY RAND() LIMIT 2;'
  //mandar la consulta a la base de datos
  connection.query(qy, function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //construir opciones
    var opciones = {
      competencia: competencia.nombre,
      peliculas: result
    }
    res.send(JSON.stringify(opciones))
  })
}

module.exports = {
  listarCompetencias: listarCompetencias,
  obtenerOpciones: obtenerOpciones
};