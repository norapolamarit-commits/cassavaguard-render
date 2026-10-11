/* On-device EfficientNet-B3 inference. Deliberately review-only. */
import * as ort from 'onnxruntime-web/wasm';

const MODEL_ID = 'cnn_efficientnet_b3';
const MODEL_SHA256 = '0702d30e649cdbc38448bdf1d57064c54ab6fad0f20847246c62e9a52caae6ca';
const MODEL_URL = '/api/models/offline-model';
const MODEL_INFO_URL = '/api/models/offline-info';
const MODEL_BYTES = 42_777_747;
const WASM_URL = '/dist/ort/ort-wasm-simd-threaded.wasm';
const WASM_CACHE = 'cassavaguard-ort-runtime-v1';
const CACHE_DB = 'cassavaguard-offline-models-v1';
const CACHE_STORE = 'models';
const CLASSES = [
  { key: 'healthy', en: 'Healthy', th: 'สุขภาพดี' },
  { key: 'cbb', en: 'Cassava Bacterial Blight (CBB)', th: 'โรคใบไหม้แบคทีเรีย (CBB)' },
  { key: 'cbsd', en: 'Cassava Brown Streak (CBSD)', th: 'โรคเส้นใบสีน้ำตาล (CBSD)' },
  { key: 'cmd', en: 'Cassava Mosaic Disease (CMD)', th: 'โรคใบด่างมันสำปะหลัง (CMD)' },
  { key: 'cgm', en: 'Cassava Green Mite (CGM)', th: 'ไรแดงมันสำปะหลัง (CGM)' },
];

let sessionPromise;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(CACHE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Offline model storage unavailable'));
  });
}

async function dbValue(mode, key, value) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE, mode);
      const store = tx.objectStore(CACHE_STORE);
      const request = mode === 'readonly' ? store.get(key) : store.put(value, key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Offline model storage failed'));
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error || new Error('Offline model storage failed'));
    });
  } catch (error) {
    db.close();
    throw error;
  }
}

async function digestHex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function isReady() {
  try {
    const record = await dbValue('readonly', MODEL_ID);
    const cache = await caches.open(WASM_CACHE);
    const wasm = await cache.match(WASM_URL);
    return Boolean(record?.bytes && record.sha256 === MODEL_SHA256 && wasm);
  } catch (_) {
    return false;
  }
}

async function ensureRuntime(onProgress) {
  const cache = await caches.open(WASM_CACHE);
  if (await cache.match(WASM_URL)) return;
  if (!navigator.onLine) throw new Error('ยังไม่ได้บันทึก runtime สำหรับออฟไลน์ กรุณาออนไลน์แล้วกดเตรียมโมเดลอีกครั้ง');
  const response = await fetch(WASM_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('ดาวน์โหลด runtime สำหรับประมวลผลไม่สำเร็จ กรุณาลองใหม่');
  await cache.put(WASM_URL, response.clone());
  onProgress(0.98);
}

export async function prepare(onProgress = () => {}) {
  let stored = await dbValue('readonly', MODEL_ID);
  let downloaded = false;
  if (!stored?.bytes || stored.sha256 !== MODEL_SHA256) {
    if (!navigator.onLine) throw new Error('ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อดาวน์โหลดโมเดลออฟไลน์ครั้งแรก (~43 MB)');

    const estimate = navigator.storage?.estimate
      ? await navigator.storage.estimate().catch(() => null)
      : null;
    if (estimate?.quota && estimate.quota - estimate.usage < MODEL_BYTES + 14_239_897 + 8_000_000) {
      throw new Error('พื้นที่จัดเก็บในเครื่องไม่พอสำหรับโมเดลและ runtime ออฟไลน์ (ต้องเหลือพื้นที่ประมาณ 65 MB)');
    }
    if (navigator.storage?.persist) await navigator.storage.persist().catch(() => false);

    const infoResponse = await fetch(MODEL_INFO_URL, { cache: 'no-store' });
    if (!infoResponse.ok) throw new Error(`ตรวจสอบข้อมูลโมเดลไม่สำเร็จ (${infoResponse.status})`);
    const info = await infoResponse.json();
    const expectedClasses = CLASSES.map((item) => item.key);
    if (info.model_id !== MODEL_ID || info.sha256 !== MODEL_SHA256 || info.size_bytes !== MODEL_BYTES
      || info.release_scope !== 'review_only' || info.production_eligible !== false
      || JSON.stringify(info.classes) !== JSON.stringify(expectedClasses)
      || info.img_size !== 300 || info.input_layout !== 'NCHW'
      || Math.abs(Number(info.temperature) - 0.9204192938089741) > 1e-9) {
      throw new Error('ข้อมูลรุ่นโมเดลบนเซิร์ฟเวอร์ไม่ตรงกับรุ่นที่แอปรองรับ จึงหยุดดาวน์โหลดเพื่อป้องกันการแปลผลผิด');
    }

    const response = await fetch(`${MODEL_URL}?sha256=${MODEL_SHA256}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`ดาวน์โหลดโมเดลไม่สำเร็จ (${response.status})`);
    let buffer;
    if (response.body?.getReader) {
      const reader = response.body.getReader();
      const total = Number(response.headers.get('content-length')) || MODEL_BYTES;
      if (total !== MODEL_BYTES) throw new Error('ขนาดไฟล์โมเดลไม่ตรงกับข้อมูลอ้างอิง จึงยกเลิกการบันทึก');
      const bytes = new Uint8Array(total);
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (received + value.byteLength > total) throw new Error('ไฟล์โมเดลมีขนาดเกินที่คาดไว้ จึงยกเลิกการบันทึก');
        bytes.set(value, received);
        received += value.byteLength;
        onProgress(Math.min(0.95, received / total * 0.95));
      }
      if (received !== total) throw new Error('ดาวน์โหลดโมเดลไม่ครบ ไฟล์อาจเสียหาย กรุณาลองใหม่');
      buffer = bytes.buffer;
    } else {
      buffer = await response.arrayBuffer();
      if (buffer.byteLength !== MODEL_BYTES) throw new Error('ขนาดไฟล์โมเดลไม่ตรงกับข้อมูลอ้างอิง จึงยกเลิกการบันทึก');
      onProgress(0.9);
    }
    const actualHash = await digestHex(buffer);
    if (actualHash !== MODEL_SHA256) throw new Error('ตรวจสอบไฟล์โมเดลไม่ผ่าน ไฟล์อาจเสียหาย กรุณาลองใหม่');
    await dbValue('readwrite', MODEL_ID, { bytes: buffer, sha256: actualHash });
    stored = { bytes: buffer, sha256: actualHash };
    downloaded = true;
  }

  await ensureRuntime(onProgress);
  onProgress(1);
  return { bytes: stored.bytes.byteLength, cached: !downloaded };
}

function getCanvasContext(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('อุปกรณ์ไม่รองรับการประมวลผลภาพออฟไลน์');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  return { canvas, context };
}

function imageDataFrom(source, width, height) {
  const { canvas, context } = getCanvasContext(width, height);
  context.drawImage(source, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}

function fieldRobustPixels(source, width, height) {
  const { data } = imageDataFrom(source, width, height);
  const sums = [0, 0, 0];
  const count = width * height;
  for (let i = 0; i < data.length; i += 4) {
    sums[0] += data[i]; sums[1] += data[i + 1]; sums[2] += data[i + 2];
  }
  const means = sums.map((sum) => sum / count);
  const gray = (means[0] + means[1] + means[2]) / 3;
  const scales = means.map((mean) => Math.max(0.5, Math.min(2, gray / Math.max(mean, 1))));

  // Pillow's HSV byte conversion is quantized to 0..255. Keep this explicit so
  // the vegetation crop follows the serving pipeline instead of a CSS filter.
  let x0 = width, y0 = height, x1 = -1, y1 = -1, vegetation = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = Math.max(0, Math.min(255, Math.round(data[i] * scales[0])));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(data[i + 1] * scales[1])));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(data[i + 2] * scales[2])));
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), diff = max - min;
      let hue = 0;
      if (diff > 0) {
        if (max === r) hue = ((g - b) / diff) % 6;
        else if (max === g) hue = (b - r) / diff + 2;
        else hue = (r - g) / diff + 4;
        hue = ((hue / 6) % 1 + 1) % 1;
      }
      const hueByte = Math.round(hue * 255);
      const satByte = max === 0 ? 0 : Math.round((diff / max) * 255);
      const valueByte = Math.round(max * 255);
      const degrees = hueByte * (360 / 255);
      if (degrees >= 30 && degrees <= 170 && satByte > 25 && valueByte > 20) {
        vegetation++;
        x0 = Math.min(x0, x); y0 = Math.min(y0, y);
        x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
    }
  }
  const corrected = new ImageData(data, width, height);
  if (vegetation < width * height * 0.02) return { imageData: corrected, rect: [0, 0, width, height] };
  const marginX = Math.floor((x1 - x0) * 0.08), marginY = Math.floor((y1 - y0) * 0.08);
  const left = Math.max(0, x0 - marginX), top = Math.max(0, y0 - marginY);
  const right = Math.min(width, x1 + marginX + 1), bottom = Math.min(height, y1 + marginY + 1);
  return { imageData: corrected, rect: [left, top, right - left, bottom - top] };
}

async function toTensor(file, imageSize) {
  const bitmap = await createImageBitmap(file);
  try {
    // Backend Pillow thumbnail keeps aspect ratio and caps the long edge at 256.
    const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const robust = fieldRobustPixels(bitmap, width, height);
    const [sx, sy, sw, sh] = robust.rect;
    const { canvas, context } = getCanvasContext(imageSize, imageSize);
    context.putImageData(robust.imageData, 0, 0);
    const cropped = document.createElement('canvas');
    cropped.width = sw; cropped.height = sh;
    const cropContext = cropped.getContext('2d', { willReadFrequently: true });
    cropContext.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    const resized = getCanvasContext(imageSize, imageSize);
    resized.context.drawImage(cropped, 0, 0, imageSize, imageSize);
    const { data } = resized.context.getImageData(0, 0, imageSize, imageSize);
    const plane = imageSize * imageSize;
    const tensor = new Float32Array(3 * plane);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      tensor[p] = data[i];
      tensor[plane + p] = data[i + 1];
      tensor[2 * plane + p] = data[i + 2];
    }
    return new ort.Tensor('float32', tensor, [1, 3, imageSize, imageSize]);
  } finally {
    bitmap.close?.();
  }
}

async function modelSession(onProgress) {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      await prepare(onProgress);
      const record = await dbValue('readonly', MODEL_ID);
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      ort.env.wasm.wasmPaths = '/dist/ort/';
      return ort.InferenceSession.create(record.bytes, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
    })().catch((error) => { sessionPromise = null; throw error; });
  }
  return sessionPromise;
}

export async function predict(file, onProgress = () => {}) {
  const session = await modelSession(onProgress);
  const inputName = session.inputNames[0];
  const started = performance.now();
  const output = await session.run({ [inputName]: await toTensor(file, 300) });
  const duration = Math.round(performance.now() - started);
  const logits = Array.from(output[session.outputNames[0]].data, Number);
  const temperature = 0.9204192938089741;
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp((value - max) / temperature));
  const sum = exps.reduce((acc, value) => acc + value, 0);
  const probs = Object.fromEntries(CLASSES.map((item, index) => [item.key, exps[index] / sum]));
  const ranked = CLASSES.map((item) => ({ ...item, confidence: probs[item.key] }))
    .sort((a, b) => b.confidence - a.confidence);
  const top = ranked[0];
  return {
    source: 'leaf', inference_mode: 'offline_review_only',
    top3: ranked.slice(0, 3), probs, top_class: top.key, confidence: top.confidence,
    confidence_margin: top.confidence - ranked[1].confidence,
    model_basis: Object.fromEntries(CLASSES.map((item) => [item.key, 'trained_ml'])),
    requires_review: true, review_reasons: ['offline_review_only', 'not_saved_to_account'],
    decision: 'review_required', quality: null, supported_classes: CLASSES.map((item) => item.key),
    auxiliary_supported_classes: [], auxiliary_findings: [], unsupported_classes: [],
    fusion_used: false, cnn_used: true, symptoms: [], severity: null, health_score: null,
    feature_importance: [], raw_features: {},
    explanation_en: 'Offline screening result from the on-device EfficientNet-B3 model. This review-only estimate is not saved to your account and needs expert confirmation.',
    explanation_th: 'ผลคัดกรองออฟไลน์จาก EfficientNet-B3 บนเครื่อง เป็นผลสำหรับตรวจทานเท่านั้น ไม่ได้บันทึกเข้าบัญชี และควรให้ผู้เชี่ยวชาญยืนยัน',
    heatmap: null, inference_ms: duration,
    model: { id: MODEL_ID, name: 'EfficientNet-B3 · Offline Review-only', version: '2026-09-14' },
    created_at: new Date().toISOString(),
  };
}

window.CG = window.CG || {};
window.CG._classMap = window.CG._classMap || Object.fromEntries(CLASSES.map((item) => [item.key, item]));
window.CG.OfflineCNN = { isReady, prepare, predict, modelBytes: MODEL_BYTES };
