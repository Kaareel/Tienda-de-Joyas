const { Pool } = require("pg");
require("dotenv").config({ path: "./.env" });
const format = require('pg-format');


const credenciales = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  allowExitOnIdle: true,
};

const pool = new Pool(credenciales);

const obtenerJoyas = async ({ limits = 10, order_by = "id_ASC",
  page = 0 }) => {
  try {
    const [campo, direccion] = order_by.split("_")
    const offset = (page - 1) * limits
    const formattedQuery = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);
    pool.query(formattedQuery);
    const { rows: inventario } = await pool.query(formattedQuery)
    return inventario
  } catch { }
}

const obtenerJoyasPorFiltros = async ({ precio_max, precio_min, categoria, metal }) => {
    let filtros = []
    const values = []
    const joyasFiltro = (campo, comparador, valor) => {
    values.push(valor)
    const { length } = filtros
    filtros.push(`${campo} ${comparador} $${length + 1}`)
    }
    if (precio_max) joyasFiltro('precio', '<=', precio_max)
    if (precio_min) joyasFiltro('precio', '>=', precio_min)
    if (categoria) joyasFiltro('categoria', '=', categoria)
    if (metal) joyasFiltro('metal', '=', metal)


    let consulta = "SELECT * FROM inventario"
    if (filtros.length > 0) {
    filtros = filtros.join(" AND ")
    consulta += ` WHERE ${filtros}`
    }
    const { rows: inventario } = await pool.query(consulta, values)
    return inventario
    }

const prepararHATEOAS = (inventario) => {
  const results = inventario.map((i) => {
      return {
          name: i.nombre,
          href: `/joyas/joyas/${i.id}`,
      }
  }).slice(0, 4)
  const totalJoyas = inventario.length
  const stockTotal = inventario.reduce((total, i) => total + i.stock, 0);

  const HATEOAS = {
      totalJoyas,
      stockTotal,
      results
  }
  return HATEOAS
}

module.exports = { obtenerJoyas, obtenerJoyasPorFiltros, prepararHATEOAS }