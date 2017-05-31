# Development

## Preparation

1. [asdf](https://github.com/asdf-vm/asdf): To manage the version of [Node.js](https://nodejs.org/en/).
  ```bash
  $ asdf install
  ```
2. [yarn](https://yarnpkg.com/lang/en/): To manage dependencies of JS libraries.
  ```bash
  $ npm install -g yarn
  $ yarn
  ```

## Test

```bash
$ yarn test
```

## Documentation

1. Create API documents.
  ```bash
  $ yarn doc
  ```
2. Run the server serving static files.
  ```bash
  $ node doc
  ```
3. Confirm the documents by opening `http://localhost:3000/`.
