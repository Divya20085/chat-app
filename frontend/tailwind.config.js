const daisyui = require('daisyui');
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui:{
    themes:[
      "light",
      "dark",
      "cupcake",
      "retro",
  ]
  }
}
