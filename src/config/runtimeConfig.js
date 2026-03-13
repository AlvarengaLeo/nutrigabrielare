const PUBLIC_RUNTIME_CONFIG_SCHEMA = [
  {
    envName: 'VITE_SUPABASE_URL',
    key: 'supabaseUrl',
    critical: true,
    impact: 'Necesaria para iniciar la app y consultar Supabase.',
  },
  {
    envName: 'VITE_SUPABASE_ANON_KEY',
    key: 'supabaseAnonKey',
    critical: true,
    impact: 'Necesaria para autenticar el frontend contra Supabase.',
  },
  {
    envName: 'VITE_WOMPI_APP_ID',
    key: 'wompiAppId',
    critical: false,
    impact: 'Necesaria para la configuracion publica de pagos.',
  },
];

function readPublicEnv(envName) {
  const value = import.meta.env[envName];
  return typeof value === 'string' ? value.trim() : '';
}

export const publicRuntimeConfig = Object.freeze(
  PUBLIC_RUNTIME_CONFIG_SCHEMA.reduce((config, entry) => {
    config[entry.key] = readPublicEnv(entry.envName);
    return config;
  }, {})
);

export const missingPublicRuntimeVarDetails = PUBLIC_RUNTIME_CONFIG_SCHEMA.filter(
  ({ key }) => !publicRuntimeConfig[key]
);

export const missingPublicRuntimeVars = missingPublicRuntimeVarDetails.map(
  ({ envName }) => envName
);

export const missingRequiredPublicRuntimeVars = missingPublicRuntimeVarDetails
  .filter(({ critical }) => critical)
  .map(({ envName }) => envName);

export const hasRequiredPublicRuntimeConfig =
  missingRequiredPublicRuntimeVars.length === 0;

export const publicRuntimeConfigErrorMessage = hasRequiredPublicRuntimeConfig
  ? ''
  : `Missing required public environment variables: ${missingRequiredPublicRuntimeVars.join(', ')}`;

if (!hasRequiredPublicRuntimeConfig) {
  console.error(`[runtime-config] ${publicRuntimeConfigErrorMessage}`);
}

const missingOptionalPublicRuntimeVars = missingPublicRuntimeVarDetails
  .filter(({ critical }) => !critical)
  .map(({ envName }) => envName);

if (missingOptionalPublicRuntimeVars.length > 0) {
  console.warn(
    `[runtime-config] Missing optional public environment variables: ${missingOptionalPublicRuntimeVars.join(', ')}`
  );
}
