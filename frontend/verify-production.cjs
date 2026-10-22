/* Run after npm run build: node verify-production.cjs. No browser or extra dependencies required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

async function main() {
  process.chdir(__dirname);
  const babel = await import('@babel/core');
  const webpackConfig = require('./webpack.config');
  const probe = 'export default <main><span>Production JSX</span><span>runtime</span></main>';
  const filename = path.join(__dirname, 'src/runtime-probe.jsx');
  for (const host of ['development', 'production', 'test']) {
    process.env.NODE_ENV = host;
    process.env.BABEL_ENV = host;
    for (const mode of ['development', 'production']) {
      const config = webpackConfig({}, { mode });
      const options = config.module.rules[0].use.options;
      assert.equal(config.mode, mode);
      assert.equal(options.envName, mode);
      const output = babel.transformSync(probe, { ...options, filename }).code;
      assert.equal(output.includes('jsxDEV'), mode === 'development');
      assert(output.includes(mode === 'development' ? 'react/jsx-dev-runtime' : 'react/jsx-runtime'));
    }
  }
  assert.equal(webpackConfig().mode, 'production');
  process.env.NODE_ENV = 'production';
  process.env.BABEL_ENV = 'production';
  const options = webpackConfig({}, { mode: 'production' }).module.rules[0].use.options;
  const commonJS = [[require.resolve('@babel/preset-env'), { targets: { node: 'current' }, modules: 'commonjs' }]];
  const code = babel.transformSync(probe, { ...options, filename, presets: commonJS }).code;
  const probeModule = new Module(filename, module);
  probeModule.filename = filename;
  probeModule.paths = module.paths;
  probeModule._compile(code, filename);
  const html = require('react-dom/server').renderToStaticMarkup(probeModule.exports.default);
  assert.equal(html, '<main><span>Production JSX</span><span>runtime</span></main>');

  const assets = fs.readdirSync(path.join(__dirname, 'dist')).filter(name => name.endsWith('.js'));
  assert(assets.length > 0, 'Run npm run build first.');
  for (const asset of assets) {
    assert(!/\bjsxDEV\b|jsx-dev-runtime/.test(fs.readFileSync(path.join(__dirname, 'dist', asset), 'utf8')), asset);
  }
  console.log(`PASS: six host/mode JSX combinations, production runtime render, and ${assets.length} emitted JavaScript assets without development JSX references.`);

  // Reuse all existing page/reducer checks, replacing only their test JSX loader with
  // the real production loader options. CommonJS output permits Node server rendering.
  const suitePath = path.join(__dirname, 'src/ui/verify-refinement.cjs');
  let suite = fs.readFileSync(suitePath, 'utf8');
  const oldLoader = "module._compile(babel.transformSync(source,{ filename,configFile:false,babelrc:false,presets:[[require.resolve('@babel/preset-env'),{targets:{node:'current'},modules:'commonjs'}],[require.resolve('@babel/preset-react'),{runtime:'classic'}]] }).code,filename);";
  assert(suite.includes(oldLoader), 'The existing test loader changed; update this adapter.');
  suite = suite.replace(oldLoader, "module._compile(babel.transformSync(source,{ filename,...require('../../webpack.config')({}, {mode:'production'}).module.rules[0].use.options,presets:[[require.resolve('@babel/preset-env'),{targets:{node:'current'},modules:'commonjs'}]] }).code,filename);");
  const runner = new Module(suitePath, module);
  runner.filename = suitePath;
  runner.paths = Module._nodeModulePaths(path.dirname(suitePath));
  runner._compile(suite, suitePath);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
