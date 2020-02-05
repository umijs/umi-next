export default {
  headScripts: ['console.log(123);', '//a.alicdn.com/foo.js'],
  scripts: [ { content: `console.log(456);` } ],
  links: [
    {
      rel: 'stylesheet',
      href: '//a.alicdn.com/foo.css',
    }
  ]
}
