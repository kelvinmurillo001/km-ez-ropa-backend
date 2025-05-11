// 📁 scripts/corregirSlugsCLI.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import Product from '../models/Product.js' // Ajustado a subir desde raíz

dotenv.config()

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const soloFaltantes = args.includes('--solo-faltantes')

const generarSlug = (nombre = '') =>
  nombre
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)

async function corregirSlugs () {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI no definida en .env')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    const productos = await Product.find().lean()
    console.log(`🔍 Productos encontrados: ${productos.length}`)

    const slugsUsados = new Set()
    const productosModificados = []

    for (const producto of productos) {
      if (!producto.name) continue

      const slugBase = generarSlug(producto.name)
      let slugFinal = slugBase
      let contador = 1

      if (soloFaltantes && producto.slug) continue

      while (
        slugsUsados.has(slugFinal) ||
        await Product.exists({ slug: slugFinal, _id: { $ne: producto._id } })
      ) {
        slugFinal = `${slugBase}-${contador++}`
        if (contador > 20) break
      }

      if (producto.slug !== slugFinal) {
        console.log(`🔄 ${producto.name}`)
        console.log(`   ${producto.slug || '[vacío]'} ➡️ ${slugFinal}`)

        if (!dryRun) {
          await Product.findByIdAndUpdate(producto._id, { slug: slugFinal })
        }

        productosModificados.push({
          id: producto._id,
          nombre: producto.name,
          anterior: producto.slug || null,
          nuevo: slugFinal
        })

        slugsUsados.add(slugFinal)
      }
    }

    console.log(`\n✅ Slugs ${dryRun ? 'simulados' : 'corregidos'}: ${productosModificados.length}`)

    if (!dryRun && productosModificados.length > 0) {
      const fileName = `slug_log_${Date.now()}.json`
      fs.writeFileSync(fileName, JSON.stringify(productosModificados, null, 2))
      console.log(`📝 Log guardado en ${fileName}`)
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

corregirSlugs()
