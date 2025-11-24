
// @ts-ignore
import argon2 from "argon2-wasm-esm";

// kdbxweb.CryptoEngine.argon2 =
export const argon2Wrapper = async (
  password: ArrayBuffer,
  salt: ArrayBuffer,
  memory: number,
  iterations: number,
  length: number,
  parallelism: number,
  type: argon2.ArgonType,
  version: argon2.ArgonVersion
) => {
  return argon2
    .hash({
      pass: new Uint8Array(password),
      salt: new Uint8Array(salt),
      time: iterations,
      mem: memory,
      hashLen: length,
      parallelism,
      type,
      version,
    })
    .then(({ hash }: { hash: Uint8Array }) => hash);
};

