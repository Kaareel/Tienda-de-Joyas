const express = require('express')
const app = express()
app.listen(3000, console.log('Server ON'))

const { obtenerJoyas, obtenerJoyasPorFiltros, prepararHATEOAS } = require('./consultas')


app.get('/joyas', async (req, res) => {
  try {
    const queryStrings = req.query;
    const inventario = await obtenerJoyas(queryStrings);
    const HATEOAS = await prepararHATEOAS(inventario);
    res.json(HATEOAS);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
})

app.get('/joyas/filtros', async (req, res) => {
  try {
   const queryStrings = req.query
  const inventario = await obtenerJoyasPorFiltros(queryStrings)
  res.json(inventario) 
  } catch (error) {
    res.status(500).send(error.message);
  }
  });
  
  app.use((req, res, next) => {
    try {
      const parametros = req.params;
    const url = req.url;
    console.log(`
      Hoy ${new Date()}
      Se ha recibido una consulta en la ruta ${url}
      con los parámetros: `, parametros)
    return next();
    } catch (error) {
      res.status(500).send(error.message);
    }
    
  });

  app.get("*", (req, res) => {
    res.status(404).send("Esta ruta no existe")
    })
    


