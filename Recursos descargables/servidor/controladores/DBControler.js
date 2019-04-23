var connection = require('../lib/conexionbd.js');

function listarCompetencias(req, res) {
  //consulta sql
  var qy = 'SELECT * FROM competencias_pelicula;'

  //mandar la consulta a la base de datos
  connection.query(qy, function(error, result, fields) {
    if (error) {
      console.log('hubo un error listarCompetencias', error);
      return res.status(404).send('hubo un error listarCompetencias', error);
    }
    //si llegue hasta aca no hubo error
    console.log('REQUES: ', req);
    //send result
    res.send(JSON.stringify(result));
  })
}

module.exports = {
  listarCompetencias: listarCompetencias
};
