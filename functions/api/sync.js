// Cloudflare Pages Function — Training Data Sync API
// KV Binding: TRAINING_DATA (configure in Cloudflare Dashboard)

export async function onRequestGet(context) {
  var url = new URL(context.request.url);
  var key = url.searchParams.get('key');

  if (!key || key.length < 4) {
    return jsonResponse({ error: 'Sync-Key muss mindestens 4 Zeichen haben' }, 400);
  }

  var data = await context.env.TRAINING_DATA.get(key);
  if (!data) {
    return jsonResponse({ error: 'Keine Daten gefunden' }, 404);
  }

  return new Response(data, {
    headers: corsHeaders({ 'Content-Type': 'application/json' })
  });
}

export async function onRequestPut(context) {
  var url = new URL(context.request.url);
  var key = url.searchParams.get('key');

  if (!key || key.length < 4) {
    return jsonResponse({ error: 'Sync-Key muss mindestens 4 Zeichen haben' }, 400);
  }

  var body = await context.request.text();

  // Basic validation: must be valid JSON
  try {
    JSON.parse(body);
  } catch (e) {
    return jsonResponse({ error: 'Ungueltige Daten' }, 400);
  }

  // KV max value size is 25MB — more than enough
  await context.env.TRAINING_DATA.put(key, body);

  return jsonResponse({ success: true, timestamp: Date.now() });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

function corsHeaders(extra) {
  var h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (extra) Object.assign(h, extra);
  return h;
}

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: corsHeaders({ 'Content-Type': 'application/json' })
  });
}
