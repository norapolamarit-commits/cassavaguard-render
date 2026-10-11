import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import * as ort from "onnxruntime-web/wasm";

const modelPath = new URL("../backend/ml_models/cnn_primary.onnx", import.meta.url);
const wasmPath = new URL("../frontend/dist/ort/ort-wasm-simd-threaded.wasm", import.meta.url);
const model = await readFile(modelPath);
const modelSha256 = createHash("sha256").update(model).digest("hex");
const metrics = JSON.parse(await readFile(new URL("../backend/ml_models/cnn_metrics.json", import.meta.url), "utf8"));

assert.equal(modelSha256, metrics.artifacts.onnx.sha256, "offline ONNX checksum must match the model registry");
assert.equal((await stat(wasmPath)).size, 14_239_897, "the browser WASM runtime must be copied into the frontend build");
assert.equal(metrics.release_scope, "review_only", "offline analysis must remain review-only");

ort.env.wasm.numThreads = 1;
const session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
assert.deepEqual(session.inputNames, ["image"]);
assert.deepEqual(session.outputNames, ["logits"]);
const input = new ort.Tensor("float32", new Float32Array(270_000), [1, 3, 300, 300]);
const output = await session.run({ image: input });
const logits = Array.from(output.logits.data, Number);
assert.deepEqual(output.logits.dims, [1, 5]);
assert.equal(logits.length, 5);
assert.ok(logits.every(Number.isFinite), "smoke-test logits must be finite");

// CPUExecutionProvider and ONNX Runtime Web can differ by small floating-point
// rounding amounts; this pins a tolerance-based cross-runtime smoke result.
const expectedZeroInputLogits = [2.04815149, 1.72851682, -0.03489535, 1.23987496, 0.80359185];
assert.ok(logits.every((value, index) => Math.abs(value - expectedZeroInputLogits[index]) < 0.001));
console.log(`offline model OK: ${modelSha256.slice(0, 12)}, 5 logits, WASM ${((await stat(wasmPath)).size / 1e6).toFixed(1)} MB`);
