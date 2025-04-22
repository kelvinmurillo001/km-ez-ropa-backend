const fs = require('fs').promises
const path = require('path')

const filePath = path.join(__dirname, '..', 'data', 'visitas.json')

/**
 * 📈 Registrar una nueva visita
 */
const registrarVisita = async (req, res) => {
  try {
    let count = 0

    try {
      const data = await fs.readFile(filePath, 'utf8')
      const json = JSON.parse(data)
      const visitasPrevias = json.count ?? json.visitas

      if (typeof visitasPrevias === 'number' && visitasPrevias >= 0) {
        count = visitasPrevias
      } else {
        console.warn('⚠️ Valor de visitas inválido, se reinicia a 0.')
      }
    } catch (error) {
      console.warn('⚠️ visitas.json no existe o está corrupto. Se inicia en 0.')
    }

    count += 1

    await fs.writeFile(filePath, JSON.stringify({ count }, null, 2))

    return res.status(200).json({
      ok: true,
      message: '✅ Visita registrada correctamente',
      data: { total: count }
    })
  } catch (err) {
    console.error('❌ Error registrando visita:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al registrar visita',
      error: err.message
    })
  }
}

/**
 * 📊 Obtener total de visitas
 */
const obtenerVisitas = async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(data)
    const visitas = json.count ?? json.visitas
    const total = typeof visitas === 'number' && visitas >= 0 ? visitas : 0

    return res.status(200).json({
      ok: true,
      message: '✅ Total de visitas obtenido correctamente',
      data: { total }
    })
  } catch (err) {
    console.error('❌ Error leyendo visitas:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener visitas',
      error: err.message
    })
  }
}

module.exports = {
  registrarVisita,
  obtenerVisitas
}
