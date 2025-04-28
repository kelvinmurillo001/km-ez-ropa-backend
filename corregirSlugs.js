// 📁 corregirSlugs.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js'; // Ajusta el path si lo necesitas

dotenv.config(); // Carga variables de entorno

async function corregirSlugs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const productos = await Product.find({});
    console.log(`🔎 Se encontraron ${productos.length} productos.`);

    let corregidos = 0;

    for (const producto of productos) {
      if (producto.name) {
        // Generamos el nuevo slug con normalización correcta
        const nuevoSlug = producto.name
          .toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/ñ/g, 'n')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
          .substring(0, 100);

        if (producto.slug !== nuevoSlug) {
          console.log(`🔄 Corrigiendo slug: ${producto.slug} ➔ ${nuevoSlug}`);
          producto.slug = nuevoSlug;
          await producto.save();
          corregidos++;
        }
      }
    }

    console.log(`🎯 Slugs corregidos: ${corregidos}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

corregirSlugs();
