/**
 * Vault-key encryption shared by the browser (src/lib/automationsService.js)
 * and the serverless cron (api/cron/tick.js).
 *
 * The browser WRITES keys with encryptSecret() and the cron READS them with
 * decryptSecret(). Both sides must run this exact code: if the cron decoded
 * the stored value any other way (e.g. a plain base64 decode) it would get
 * ciphertext bytes back instead of the API key.
 *
 * Environment-agnostic: it only needs a WebCrypto implementation. It defaults
 * to `globalThis.crypto` (browsers, Node >= 19); callers on older runtimes can
 * pass `require('node:crypto').webcrypto` explicitly.
 *
 * Stored format (base64): [12-byte IV][AES-GCM ciphertext + tag].
 * Legacy / fallback format: plain base64 of the key, which decryptSecret()
 * still accepts.
 */

// Key-derivation inputs. They are constants (not secrets); changing either one
// makes every previously stored key undecryptable.
const KEY_MATERIAL = 'ila-pgsodium-salt-2026'
const PBKDF2_SALT = 'salt-val-pgsodium'
const PBKDF2_ITERATIONS = 100000
const IV_BYTES = 12

function resolveCrypto(cryptoImpl) {
  return cryptoImpl || globalThis.crypto
}

async function deriveKey(cryptoImpl) {
  const { subtle } = resolveCrypto(cryptoImpl)
  const enc = new TextEncoder()
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(KEY_MATERIAL),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(PBKDF2_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptSecret(plainText, cryptoImpl) {
  if (!plainText) return ''
  try {
    const webcrypto = resolveCrypto(cryptoImpl)
    const key = await deriveKey(cryptoImpl)
    const iv = webcrypto.getRandomValues(new Uint8Array(IV_BYTES))
    const enc = new TextEncoder()
    const ciphertext = await webcrypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    )
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return btoa(String.fromCharCode(...combined))
  } catch (err) {
    console.warn('Encryption fallback to base64 encoding:', err)
    return btoa(plainText)
  }
}

export async function decryptSecret(encryptedBase64, cryptoImpl) {
  if (!encryptedBase64) return ''
  try {
    const binary = atob(encryptedBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    if (bytes.length <= IV_BYTES) {
      return atob(encryptedBase64)
    }

    const iv = bytes.slice(0, IV_BYTES)
    const ciphertext = bytes.slice(IV_BYTES)
    const key = await deriveKey(cryptoImpl)
    const decrypted = await resolveCrypto(cryptoImpl).subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    // Not AES-GCM output: treat it as the legacy plain-base64 format.
    try {
      return atob(encryptedBase64)
    } catch {
      return ''
    }
  }
}
