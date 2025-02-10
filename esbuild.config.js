const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

esbuild.build({
  entryPoints: ['Backend/server.js'],
  bundle: true,
  outfile: 'Releases/Backend.cjs',
  format: 'cjs',
  platform: 'node',
  loader: { '.html': 'text' },
  plugins: [nodeExternalsPlugin()],
}).catch(() => process.exit(1));
