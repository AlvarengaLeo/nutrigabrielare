import { createClient } from '@supabase/supabase-js';
import {
  loadServerRuntimeConfig,
  sendServerConfigError,
} from '../_lib/runtimeConfig.js';

const SCOPE = 'digital/refresh-url';
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const TTL_SECONDS = 60 * 60 * 24; // 24h

function getSupabaseAdminClient(serverConfig) {
  return createClient(
    serverConfig.SUPABASE_URL,
    serverConfig.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function getAuthenticatedUser(supabase, authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    const authError = new Error('Token inválido o expirado');
    authError.statusCode = 401;
    throw authError;
  }
  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config: serverConfig, missing } = loadServerRuntimeConfig({
    scope: SCOPE,
    required: REQUIRED_ENV,
  });
  if (missing.length > 0) {
    return sendServerConfigError(res, SCOPE, missing);
  }

  const supabase = getSupabaseAdminClient(serverConfig);

  try {
    const user = await getAuthenticatedUser(supabase, req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    const productId = req.body?.product_id?.toString().trim();
    if (!productId) {
      return res.status(400).json({ error: 'product_id es requerido' });
    }

    // Validate ownership: must have a row in user_purchases for this
    // (user_id, product_id). expires_at is informational — the column was
    // populated for the email window, but having any purchase row is
    // sufficient proof of purchase for re-downloads.
    const { data: purchase, error: purchaseError } = await supabase
      .from('user_purchases')
      .select('id, product_id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .limit(1)
      .maybeSingle();

    if (purchaseError) {
      console.error(`[${SCOPE}] purchase lookup error:`, purchaseError);
      return res.status(500).json({ error: 'Error al verificar la compra' });
    }

    if (!purchase) {
      return res.status(403).json({ error: 'No tenés acceso a este producto' });
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, kind, digital_file_path, active')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (product.kind !== 'digital' || !product.digital_file_path) {
      return res.status(400).json({ error: 'Este producto no tiene archivo digital asociado' });
    }

    const { data: signed, error: signError } = await supabase.storage
      .from('digital-products')
      .createSignedUrl(product.digital_file_path, TTL_SECONDS);

    if (signError || !signed?.signedUrl) {
      console.error(`[${SCOPE}] signed URL failed:`, signError);
      return res.status(500).json({ error: 'No se pudo generar el enlace de descarga' });
    }

    const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();

    return res.status(200).json({
      url: signed.signedUrl,
      expiresAt,
      productName: product.name,
    });
  } catch (err) {
    console.error(`[${SCOPE}]`, err);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      error: err.message || 'Error al refrescar el enlace',
    });
  }
}
