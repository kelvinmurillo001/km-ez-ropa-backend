// 📁 scripts/corregirSlugsCLI.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Product from '../models/Product.js';

dotenv.config();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const soloFaltantes = args.includes('--solo-faltantes');

// ✅ Generador de slugs profesional (seguro y legible)
function generarSlug(nombre = '') {
  return nombre
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

async function corregirSlugs() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI no definida en .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const productos = await Product.find().lean();
    console.log(`🔍 Productos encontrados: ${productos.length}`);

    const slugsUsados = new Set();
    const productosModificados = [];

    for (const producto of productos) {
      if (!producto?.name?.trim()) continue;

      if (soloFaltantes && producto.slug) continue;

      const slugBase = generarSlug(producto.name);
      let slugFinal = slugBase;
      let contador = 1;

      while (
        slugsUsados.has(slugFinal) ||
        await Product.exists({ slug: slugFinal, _id: { $ne: producto._id } })
      ) {
        slugFinal = `${slugBase}-${contador++}`;
        if (contador > 20) break;
      }

      if (producto.slug !== slugFinal) {
        console.log(`🔄 ${producto.name}`);
        console.log(`   ${producto.slug || '[vacío]'} ➡️ ${slugFinal}`);

        if (!dryRun) {
          await Product.findByIdAndUpdate(producto._id, { slug: slugFinal });
        }

        productosModificados.push({
          id: producto._id,
          nombre: producto.name,
          anterior: producto.slug || null,
          nuevo: slugFinal
        });

        slugsUsados.add(slugFinal);
      }
    }

    const resumen = `\n✅ Slugs ${dryRun ? 'simulados' : 'corregidos'}: ${productosModificados.length}`;
    console.log(resumen);

    if (!dryRun && productosModificados.length > 0) {
      const fileName = path.join(process.cwd(), `slug_log_${Date.now()}.json`);
      fs.writeFileSync(fileName, JSON.stringify(productosModificados, null, 2));
      console.log(`📝 Log guardado en ${fileName}`);
    }
  } catch (err) {
    console.error('❌ Error general:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

corregirSlugs();
