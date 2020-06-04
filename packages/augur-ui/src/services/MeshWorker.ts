import * as Comlink from 'comlink';

import './MeshTransferHandler';
import 'localstorage-polyfill';
import { retry } from 'async';

// @ts-ignore
self.window = self;

// @ts-ignore
self.document = {
  createEvent: type => new CustomEvent(type),
};

const loadMesh = async () => {
  const {
    loadMeshStreamingWithURLAsync,
    Mesh,
  } = import(/* webpackChunkName: 'mesh-browser-lite' */ '@0x/mesh-browser-lite');

  await loadMeshStreamingWithURLAsync('zerox.wasm');
}
Comlink.expose({
  loadMesh: () =>
    new Promise((resolve, reject) =>
      retry(5, loadMesh, (err, result) => {
        if (err) reject(err);
        resolve(result);
      })
    ),
  Mesh,
});
