function readServerEnv(envName) {
  const value = process.env[envName];
  return typeof value === 'string' ? value.trim() : '';
}

export function loadServerRuntimeConfig({
  required = [],
}) {
  const config = {};
  const missing = [];

  for (const envName of required) {
    const value = readServerEnv(envName);
    config[envName] = value;
    if (!value) {
      missing.push(envName);
    }
  }

  return { config, missing };
}

export function sendServerConfigError(res, scope, missing) {
  console.error(
    `[${scope}] Missing server environment variables: ${missing.join(', ')}`
  );

  return res.status(500).json({
    error: 'Configuracion incompleta del servidor.',
    missing,
  });
}
