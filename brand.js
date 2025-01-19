const fs = require('fs');
const { argv } = require('node:process');

const val = (message) => `\x1b[34m${message}\x1b[0m`;
const info = (message) => console.log(`\x1b[37m${message}\x1b[0m`);
const success = (message) => console.log(`\x1b[32m${message}\x1b[0m`);
const error = (message) => console.error(`\x1b[31m${message}\x1b[0m`);
const warn = (message) => console.warn(`\x1b[33m${message}\x1b[0m`);

const DEFAULT_CONFIG_NAME = 'default';
const BOT_NAME_PLACEHOLDER = '%BOT_NAME%';
const CONFIG_TEMPLATE = `// this file is generated by config.js script (npm run config)
import config from './${BOT_NAME_PLACEHOLDER}';
export default config;`;

const PUBLIC_INDEX_PATH = './public/index.html';
const CONFIG_FOLDER_LOCATION = './src/brands';
const CONFIG_ENTRY_FILENAME = 'index.tsx';
const INDEX_ENTRY_FILENAME = 'index.html';

const configName = argv[2] ?? DEFAULT_CONFIG_NAME;

function updateConfigEntry(name) {
  const configPath = `${CONFIG_FOLDER_LOCATION}/${name}/${CONFIG_ENTRY_FILENAME}`;

  console.log(`Checking ${val(configPath)} file exists...`);

  const configExists = fs.existsSync(configPath);

  if (configExists) {
    const configEntry = `${CONFIG_FOLDER_LOCATION}/index.ts`;
    const configContent = CONFIG_TEMPLATE.replace(
      BOT_NAME_PLACEHOLDER,
      configName,
    );

    console.log(`Writing to: ${val(configEntry)}:`);
    info(configContent);

    fs.writeFileSync(configEntry, configContent, 'utf-8');

    success(`Config applied successfully.\n`);
  } else {
    if (name === DEFAULT_CONFIG_NAME) {
      error(`Config file '${configPath}' does not exist.`);
      error(`Terminating.`);
      process.exit(1);
    }

    warn(`Config file '${configPath}' does not exist.`);
    warn(`Tying to use fallback...\n`);

    updateConfigEntry(DEFAULT_CONFIG_NAME);
  }
}

function updatePublicIndex(configName) {
  const indexPath = `${CONFIG_FOLDER_LOCATION}/${configName}/${INDEX_ENTRY_FILENAME}`;

  console.log(`Checking ${val(indexPath)} file exists...`);

  const indexExists = fs.existsSync(indexPath);

  if (indexExists) {
    fs.copyFileSync(indexPath, PUBLIC_INDEX_PATH);

    success('Index file copied succesfully.');
  } else {
    if (configName === DEFAULT_CONFIG_NAME) {
      error(`Default template file '${indexPath}' does not exist.`);
      error(`Terminating.`);
      process.exit(1);
    }

    warn(`Index template file '${indexPath}' does not exist`);
    warn(`Trying to use fallback...`);

    updatePublicIndex(DEFAULT_CONFIG_NAME);
  }
}

try {
  console.log(`Applying config: ${val(configName)}\n`);

  updateConfigEntry(configName);
  updatePublicIndex(configName);
} catch (message) {
  error(message);
  process.exit(1);
}
