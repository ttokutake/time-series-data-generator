# Development

## Preparation

1. [asdf](https://github.com/asdf-vm/asdf): To manage the version of [Node.js](https://nodejs.org/en/).
  ```bash
  $ asdf install
  ```

## Lint

```bash
$ npm run lint
```

## Test

```bash
$ npm test
```

## Documentation

1. Create API documents.
  ```bash
  $ npm run doc
  ```
2. Run the server serving static files.
  ```bash
  $ node doc
  ```
3. Confirm the documents by opening `http://localhost:3000/`.
