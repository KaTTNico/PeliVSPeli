var connection = require('../lib/conexionbd.js');

//obtener todas las competenciass
function listarCompetencias(req, res) {
  //consulta sql
  var qy = 'SELECT * FROM competencias_pelicula;'

  //mandar la consulta a la base de datos
  connection.query(qy, function(error, result, fields) {
    if (error) return res.status(500).json(error)
    if (result.length == 0) return res.status(404).send('No se encontro ninguna competencia', error)

    //send result
    res.send(JSON.stringify(result))
  })
}

function obtenerCompetencia(id) {
  var qy = 'SELECT * FROM competencias_pelicula WHERE id=' + id + ';'

  connection.query(qy, function(error, result, fields) {
    if (error) return res.status(500).json(error)
    if (result.length == 0) return res.status(404).send('No se encontro la competencia', error)

    var competencia = {
      id: result[0].id,
      nombre: result[0].nombre
    }
    return competencia
  })
}

//obtener opciones
function obtenerOpciones(req, res) {
  //obtener opciones
  var qy = 'SELECT * FROM competencias_pelicula WHERE id=' + req.params.id + ';'
  qy += ' SELECT * FROM pelicula'
  qy += ' JOIN director_pelicula ON director_pelicula.pelicula_id=pelicula.id'
  qy += ' JOIN actor_pelicula ON actor_pelicula.pelicula_id=pelicula.id'
  qy += ' JOIN competencias_pelicula ON competencias_pelicula.id=' + req.params.id
  qy += ' WHERE (competencias_pelicula.idGenero IS NULL OR competencias_pelicula.idGenero=pelicula.genero_id)'
  qy += ' AND (competencias_pelicula.idDirector IS NULL OR competencias_pelicula.idDirector=director_pelicula.director_id)'
  qy += ' AND (competencias_pelicula.idActor IS NULL OR competencias_pelicula.idActor=actor_pelicula.actor_id) ORDER BY RAND() LIMIT 2;'
  //mandar la consulta a la base de datos
  connection.query(qy, function(error, result, fields) {
    console.log(result)
    //control errores
    if (error) return res.status(500).json(error)
    if (result[0].length == 0) return res.status(404).json('No se encontro ninguna competencia con ese id.')

    //construir opciones
    var opciones = {
      competencia: result[0][0].nombre,
      peliculas: result[1]
    }
    res.send(JSON.stringify(opciones))
  })
}

//votar competencias
function votar(req, res) {
  var qy = 'SELECT * FROM pelicula WHERE id=?; SELECT * FROM competencias_pelicula WHERE id=?;'
  connection.query(qy, [req.body.idPelicula, req.params.id], function(error, result, fiields) {
    //control errores
    if (error) return res.status(500).json(error)
    //control existencia
    if (result[0].length == 0) return res.status(404).send('No se encontro la pelicula')
    if (result[1].length == 0) return res.status(404).send('No se encontro la competencia')

    qy = 'INSERT INTO votos_competencia (idCompetencia, idPelicula, votos) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE votos=(votos + 1);'
    connection.query(qy, [req.params.id, req.body.idPelicula, 1], function(error, result, fields) {
      if (result.affectedRows == 0) return res.status(505).send('Hubo un error en base de datos')
    })
  })
}

//obtener resultados
function obtenerResultados(req, res) {
  var qy = ' SELECT * FROM votos_competencia INNER JOIN pelicula ON pelicula.id = votos_competencia.idPelicula INNER JOIN competencias_pelicula ON competencias_pelicula.id = votos_competencia.idCompetencia WHERE competencias_pelicula.id=? ORDER BY votos_competencia.votos DESC LIMIT 3;'
  connection.query(qy, [req.params.id], function(error, result, fields) {
    //control errores
    if (error) return res.status(500).json(error)
    if (result.length == 0) return res.status(404).send('No se encontraron datos')

    var resultado = {
      competencia: result[0].nombre,
      resultados: result
    }
    res.send(JSON.stringify(resultado))
  })
}

function foo(req, res) {
  console.log('foo')
  console.log('foo body', req.body)
  console.log('foo params', req.params)
}
module.exports = {
  listarCompetencias: listarCompetencias,
  obtenerOpciones: obtenerOpciones,
  votar: votar,
  obtenerResultados: obtenerResultados,
  foo: foo
};