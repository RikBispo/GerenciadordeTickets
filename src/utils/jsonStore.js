const fs = require('fs/promises');
const path = require('path');

// Locks em memória para evitar condições de corrida em gravações concorrentes por arquivo
const locks = {};

/**
 * Adquire uma trava (lock) simples baseada em Promises para o arquivo especificado.
 */
async function acquireLock(filePath) {
  while (locks[filePath]) {
    await locks[filePath];
  }
  let resolver;
  locks[filePath] = new Promise((resolve) => {
    resolver = resolve;
  });
  return resolver;
}

/**
 * Lê dados de um arquivo JSON.
 * @param {string} relativePath 
 * @returns {Promise<Array|Object>}
 */
async function readJson(relativePath) {
  const filePath = path.resolve(__dirname, '../../', relativePath);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Se o arquivo não existir, cria um arquivo com array vazio
      await fs.writeFile(filePath, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
}

/**
 * Escreve dados em um arquivo JSON com proteção contra condição de corrida.
 * @param {string} relativePath 
 * @param {Array|Object} data 
 */
async function writeJson(relativePath, data) {
  const filePath = path.resolve(__dirname, '../../', relativePath);
  const release = await acquireLock(filePath);

  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    // Escreve com formatação legível
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } finally {
    locks[filePath] = null;
    release();
  }
}

module.exports = {
  readJson,
  writeJson
};
