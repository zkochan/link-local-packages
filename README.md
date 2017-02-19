# link-local-packages

> Link packages from the local file system, when available

[![npm version](https://img.shields.io/npm/v/link-local-packages.svg)](https://www.npmjs.com/package/link-local-packages) [![Build Status](https://img.shields.io/travis/zkochan/link-local-packages/master.svg)](https://travis-ci.org/zkochan/link-local-packages)

## Installation

```
npm i -S link-local-packages
```

## CLI usage

```sh
# link packages inside the current working directory
$ link-local-packages

# link packages inside the specified folder
$ link-local-packages packages
```

## API usage

```js
import linkLocalPackage from 'link-local-packages'

linkLocalPackage(process.cwd())
```

## License

[MIT](LICENSE) © [Zoltan Kochan](http://kochan.io)
