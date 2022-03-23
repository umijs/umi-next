{
  "name": "{{{ name }}}-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "umi turbo build",
    "build:web": "umi turbo build --scope=web"
  },
  "devDependencies": {
    "turbo": "^1.1.9",
    "umi": "^{{{ version }}}"
  }
}
