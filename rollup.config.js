import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/system-register-loader.js',
  format: 'umd',
  moduleName: 'SystemRegisterLoader',
  dest: 'dist/system-register-loader.js',

  plugins: [
    nodeResolve({
      module: false,
      jsnext: false,
    })
  ],

  // skip rollup warnings (specifically the eval warning)
  onwarn: function() {}
};