// 📁 corregirSlugs.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

// 🧠 Generador de slug normalizado
const generarSlug = (nombre = '') =>
  nombre
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina tildes
    .replace(/ñ/g, 'n') // reemplaza ñ
    .replace(/\s+/g, '-') // espacios por guiones
    .replace(/[^\w-]/g, '') // elimina símbolos
    .substring(0, 100)

async function corregirSlugs () {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Conectado a MongoDB correctamente.')

    const productos = await Product.find()
    console.log(`🔍 Total productos encontrados: ${productos.length}`)

    let corregidos = 0

    for (const producto of productos) {
      if (!producto.name) continue

      const slugEsperado = generarSlug(producto.name)

      if (producto.slug !== slugEsperado) {
        console.log(`🔄 Corrigiendo slug para: "${producto.name}"`)
        console.log(`   📝 Anterior: ${producto.slug || '(vacío)'} ➡️ Nuevo: ${slugEsperado}`)
        producto.slug = slugEsperado
        await producto.save()
        corregidos++
      }
    }

    console.log(`✅ Proceso finalizado. Slugs corregidos: ${corregidos}/${productos.length}`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error al corregir slugs:', error)
    process.exit(1)
  }
}

corregirSlugs()
