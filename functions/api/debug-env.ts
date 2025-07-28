export async function onRequestGet(context: any) {
  const { env } = context;
  
  // Try different ways to access the secret
  const directAccess = env.OPENROUTER_API_KEY;
  const stringAccess = env['OPENROUTER_API_KEY'];
  
  return new Response(JSON.stringify({
    directAccess: directAccess ? directAccess.substring(0, 10) + '...' : 'not found',
    stringAccess: stringAccess ? stringAccess.substring(0, 10) + '...' : 'not found',
    typeofDirect: typeof directAccess,
    typeofString: typeof stringAccess,
    allEnvKeys: Object.keys(env),
    envValues: Object.keys(env).reduce((acc, key) => {
      const val = env[key];
      acc[key] = typeof val === 'string' && val.length > 10 ? val.substring(0, 10) + '...' : val;
      return acc;
    }, {} as any)
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}