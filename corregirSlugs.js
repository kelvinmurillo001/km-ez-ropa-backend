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
    .replace(/ñ/g, 'n')              // reemplaza ñ
    .replace(/\s+/g, '-')            // espacios por guiones
    .replace(/[^\w-]/g, '')          // elimina símbolos
    .replace(/-+/g, '-')             // múltiples guiones a uno
    .replace(/^-+|-+$/g, '')         // elimina guiones iniciales/finales
    .substring(0, 100)

async function corregirSlugs () {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI no definida en el entorno.')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Conectado a MongoDB correctamente.')

    const productos = await Product.find()
    console.log(`🔍 Productos encontrados: ${productos.length}`)

    let corregidos = 0

    for (const producto of productos) {
      if (!producto.name) continue

      const slugNuevo = generarSlug(producto.name)

      if (producto.slug !== slugNuevo) {
        console.log(`🔄 Corrigiendo slug: "${producto.name}"`)
        console.log(`   📝 ${producto.slug || '(vacío)'} ➡️ ${slugNuevo}`)

        producto.slug = slugNuevo
        await producto.save()
        corregidos++
      }
    }

    console.log(`✅ Slugs corregidos: ${corregidos} de ${productos.length}`)
  } catch (error) {
    console.error('❌ Error al corregir slugs:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

corregirSlugs()
