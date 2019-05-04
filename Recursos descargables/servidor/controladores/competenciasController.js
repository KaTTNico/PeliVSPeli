var connection = require('../lib/conexionbd.js');

//obtener competencias
function listarCompetencias(req, res) {
  var qy = 'SELECT * FROM competencias;'

  //mandar la consulta a la base de datos
  connection.query(qy, function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //control existencia
    if (result.length == 0) return res.status(404).send('No se encontro ninguna competencia', error)

    //send result
    res.send(JSON.stringify(result))
  })
}

//crear competencia
function crearCompetencia(req, res) {
  var qy = 'SELECT * FROM competencias WHERE nombre=?'
  connection.query(qy, [req.body.nombre], function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //control negocio
    if (result.length != 0) return res.status(422).send('Ya existe una competencia con ese nombre.')

    qy = 'INSERT INTO competencias(nombre,idGenero,idDirector,idActor) VALUES('
    qy += '\'' + req.body.nombre + '\' ,'
    qy += ((req.body.genero == 0) ? 'NULL' : req.body.genero) + ','
    qy += ((req.body.director == 0) ? 'NULL' : req.body.director) + ','
    qy += ((req.body.actor == 0) ? 'NULL' : req.body.actor) + ');'

    connection.query(qy, function(error, result, fields) {
      //control errores
      if (error) return res.status(500).json(error)

      res.send('exito')
    })
  })
}

//reiniciar competencia
function reiniciarCompetencia(req, res) {
  var qy = 'SELECT * FROM competencias where id=?'

  connection.query(qy, [req.params.id], function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //control existencia
    if (result.length == 0) return res.status(404).send('La competencia no existe.')

    qy = 'DELETE FROM votos_competencia WHERE idCompetencia=?'
    connection.query(qy, [req.params.id], function(error, result, fields) {
      //control errores
      if (error) return res.status(500).json(error)
      if (result.affectedRows == 0) return res.status(505).send('Hubo un error en la base de datos.')

      res.send('exito')
    })
  })
}

//delete competencia
function eliminarCompetencia(req, res) {
  var qy = 'SELECT * FROM competencias WHERE id=?'

  connection.query(qy, [req.params.id], function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //control existencia
    if (result.length == 0) return res.status(404).send('La competencia no existe.')

    qy = 'DELETE votos_competencia FROM votos_competencia LEFT JOIN competencias on competencias.id= votos_competencia.idCompetencia where competencias.id=?'
    connection.query(qy, [req.params.id], function(error, result, fields) {
      //control error
      if (error) return res.status(500).json(error)
      qy = 'DELETE FROM competencias where id=?'
      connection.query(qy, [req.params.id], function(error, result, fields) {
        //control error
        if (error) return res.status(500).json(error)
        //control rows afectadas
        if (result.affectedRows == 0) return res.status(505).send('Hubo un error en la base de datos.')

        res.send('exito')
      })
    })
  })
}

//modificar competencia
function editarCompetencia(req, res) {
  qy = 'SELECT * FROM competencias where id=?'

  connection.query(qy, [req.params.id], function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //if existencia
    if (result.length == 0) return res.status(404).send('La competencia no existe.')

    qy = 'UPDATE competencias SET nombre=? WHERE id=?'
    connection.query(qy, [req.body.nombre, req.params.id], function() {
      //control error
      if (error) return res.status(500).json(error)
      //control row affected
      if (result.affectedRows == 0) return res.status(505).send('Hubo un error en la base de datos.')

      res.send('exito')
    })
  })
}

//obtener competencia por id
function obtenerCompetencia(req, res) {
  var qy = 'SELECT competencias.nombre,genero.nombre genero_nombre,actor.nombre actor_nombre,director.nombre director_nombre FROM competencias '
  qy += 'LEFT JOIN genero ON genero.id=competencias.idGenero '
  qy += 'LEFT JOIN actor ON actor.id=competencias.idActor '
  qy += 'LEFT JOIN director ON director.id=competencias.idDirector where competencias.id=?;'

  connection.query(qy, [req.params.id], function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //control existencia
    if (result.length == 0) return res.status(404).send('La competencia no existe.')

    var competencia = {
      id: result[0].id,
      nombre: result[0].nombre,
      actor_nombre: result[0].actor_nombre,
      director_nombre: result[0].director_nombre,
      genero_nombre: result[0].genero_nombre
    }

    //send result
    res.send(JSON.stringify(competencia))
  })
}

//obtener opciones
function obtenerOpciones(req, res) {
  var qy = 'SELECT * FROM competencias WHERE id=' + req.params.id + ';'
  qy += ' SELECT pelicula.id,pelicula.titulo,pelicula.anio,pelicula.duracion,pelicula.genero_id,pelicula.director,pelicula.fecha_lanzamiento,pelicula.puntuacion,pelicula.poster,pelicula.trama,pelicula.genero_string FROM pelicula'
  qy += ' JOIN director_pelicula ON director_pelicula.pelicula_id=pelicula.id'
  qy += ' JOIN actor_pelicula ON actor_pelicula.pelicula_id=pelicula.id'
  qy += ' JOIN competencias ON competencias.id=' + req.params.id
  qy += ' WHERE (competencias.idGenero IS NULL OR competencias.idGenero=pelicula.genero_id)'
  qy += ' AND (competencias.idDirector IS NULL OR competencias.idDirector=director_pelicula.director_id)'
  qy += ' AND (competencias.idActor IS NULL OR competencias.idActor=actor_pelicula.actor_id) ORDER BY RAND() LIMIT 2;'
  connection.query(qy, function(error, result, fields) {
    //control errores
    if (error) return res.status(500).json(error)
    if (result[0].length == 0) return res.status(404).json('No se encontro ninguna competencia con ese id.')
    //construir opciones
    var opciones = {
      competencia: result[0][0].nombre,
      peliculas: result[1]
    }

    //send result
    res.send(JSON.stringify(opciones))
  })
}

//obtener generos
function obtenerGeneros(req, res) {
  var qy = 'SELECT * FROM genero'

  connection.query(qy, function(error, result, fields) {
    //control errores
    if (error) return res.status(500).json(error)
    //control existencia
    if (result.length == 0) return res.status(404).send('No se encontro ningun genero.')

    //send result
    res.send(JSON.stringify(result))
  })
}

//obtener directores
function obtenerDirectores(req, res) {
  var qy = 'SELECT * FROM director'

  connection.query(qy, function(error, result, fields) {
    //control errores
    if (error) return res.status(500).json(error)
    //control existencia
    if (result.length == 0) return res.status(404).send('No se encontro ningun director.')

    //send result
    res.send(JSON.stringify(result))
  })
}

//obtener actores
function obtenerActores(req, res) {
  var qy = 'SELECT * FROM actor'

  connection.query(qy, function(error, result, fields) {
    //control error
    if (error) return res.status(500).json(error)
    //control existencia
    if (result.length == 0) return res.status(404).send('No se encontro ningun actor.')

    //send result
    res.send(JSON.stringify(result))
  })
}

//votar competencias
function votar(req, res) {
  var qy = 'SELECT * FROM pelicula WHERE id=?; SELECT * FROM competencias WHERE id=?;'

  connection.query(qy, [req.body.idPelicula, req.params.id], function(error, result, fiields) {
    //control errores
    if (error) return res.status(500).json(error)
    //control existencia
    if (result[0].length == 0) return res.status(404).send('No se encontro la pelicula')
    if (result[1].length == 0) return res.status(404).send('No se encontro la competencia')

    qy = 'INSERT INTO votos_competencia (idCompetencia, idPelicula, votos) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE votos=(votos + 1);'

    connection.query(qy, [req.params.id, req.body.idPelicula, 1], function(error, result, fields) {
      //control error
      if (error) return res.status(500).json(error)

      res.send('exito')
    })
  })
}

//obtener resultados
function obtenerResultados(req, res) {
  var qy = ' SELECT * FROM votos_competencia INNER JOIN pelicula ON pelicula.id = votos_competencia.idPelicula INNER JOIN competencias ON competencias.id = votos_competencia.idCompetencia WHERE competencias.id=? ORDER BY votos_competencia.votos DESC LIMIT 3;'

  connection.query(qy, [req.params.id], function(error, result, fields) {
    //control errores
    if (error) return res.status(500).json(error)
    if (result.length == 0) return res.status(404).send('No se encontraron datos')

    var resultado = {
      competencia: result[0].nombre,
      resultados: result
    }

    //send result
    res.send(JSON.stringify(resultado))
  })
}

/*
funcion para observar mejor el cuerpo del request desde la consola.
(todos los endpoints antes de ser programados llaman a foo y mientras hago el request
puedo programar mirando el cuerpo, es una comodidad nada mas)
*/
function foo(req, res) {
  console.log('foo:')
  console.log('foo body', req.body)
  console.log('foo params', req.params)
}

module.exports = {
  listarCompetencias: listarCompetencias,
  crearCompetencia: crearCompetencia,
  reiniciarCompetencia: reiniciarCompetencia,
  eliminarCompetencia: eliminarCompetencia,
  editarCompetencia: editarCompetencia,
  obtenerCompetencia: obtenerCompetencia,
  obtenerOpciones: obtenerOpciones,
  votar: votar,
  obtenerResultados: obtenerResultados,
  obtenerGeneros: obtenerGeneros,
  obtenerDirectores: obtenerDirectores,
  obtenerActores: obtenerActores,
  foo: foo
};