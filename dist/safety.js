'use strict';
(() => {
  const imagePath = /^assets\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.webp(?:\?v=[A-Za-z0-9_-]+)?$/;
  const plain = (value, limit = 200) => typeof value === 'string' ? value.normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').trim().slice(0, limit) : '';
  function catalog(data) {
    if (!Array.isArray(data) || data.length > 5000) throw new Error('Invalid catalog');
    return data.map(product => {
      if (!product || typeof product !== 'object' || Array.isArray(product)) throw new Error('Invalid product');
      for (const key of ['name','area','category','description','image']) {
        if (typeof product[key] !== 'string' || !product[key].trim() || product[key].length > 12000) throw new Error('Invalid product field');
      }
      if (!imagePath.test(product.image)) throw new Error('Invalid image path');
      for (const key of ['features','materials','options','sourceLabels']) {
        if (product[key] !== undefined && (!Array.isArray(product[key]) || product[key].length > 500 || product[key].some(x => typeof x !== 'string' || x.length > 2000))) throw new Error('Invalid product list');
      }
      for (const key of ['brand','model','collection','imageKind']) if (product[key] !== undefined && typeof product[key] !== 'string') throw new Error('Invalid product text');
      if (product.sources !== undefined && (!Array.isArray(product.sources) || product.sources.some(x => !x || typeof x.file !== 'string' || !Number.isInteger(x.page) || x.page < 1))) throw new Error('Invalid sources');
      return product;
    });
  }
  async function fetchJSON(url, {timeout = 10000, retries = 1} = {}) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {signal:controller.signal, credentials:'same-origin'});
        if (!response.ok) throw new Error('Unavailable data');
        return await response.json();
      } catch (error) { if (attempt === retries) throw error; }
      finally { clearTimeout(timer); }
    }
  }
  function loadImage(src, {timeout = 10000} = {}) {
    return new Promise((resolve, reject) => {
      if (!imagePath.test(src)) { reject(new Error('Invalid image path')); return; }
      const img = new Image(); img.decoding = 'async';
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true; clearTimeout(timer); img.onload = null; img.onerror = null;
        if (error) { img.src = ''; reject(error); } else resolve(img);
      };
      const timer = setTimeout(() => finish(new Error('Image timeout')), timeout);
      img.onload = () => Promise.resolve(typeof img.decode === 'function' ? img.decode() : undefined).catch(() => {}).then(() => finish());
      img.onerror = () => finish(new Error('Image unavailable'));
      img.src = src;
    });
  }
  function validateContact(values) {
    const limits = {nombre:100, empresa:140, tipo:60, etapa:60, ciudad:100, correo:254, necesidad:1000};
    const data = {}, errors = {};
    for (const [key, max] of Object.entries(limits)) {
      const value = values[key];
      if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (key !== 'necesidad' && /[\r\n]/.test(value))) { errors[key] = 'Revisa este campo y su longitud.'; continue; }
      data[key] = plain(value, max);
    }
    if (!data.nombre || data.nombre.length < 2) errors.nombre = 'Escribe tu nombre.';
    if (!data.empresa || data.empresa.length < 2) errors.empresa = 'Escribe el nombre de tu proyecto.';
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.correo || '')) errors.correo = 'Escribe un correo válido.';
    if (!data.necesidad || data.necesidad.length < 10) errors.necesidad = 'Describe tu solicitud con al menos 10 caracteres.';
    if (!['Hotel','Restaurante','Gimnasio','Residencia','Otro negocio'].includes(data.tipo)) errors.tipo = 'Selecciona un tipo de negocio válido.';
    if (!['Apertura','Remodelación','Operación y reposición'].includes(data.etapa)) errors.etapa = 'Selecciona una etapa válida.';
    return {data, errors, valid:Object.keys(errors).length === 0};
  }
  globalThis.BluSafety = Object.freeze({plain, catalog, fetchJSON, loadImage, validateContact});
})();
