This is a backend service for the Rick and Morty web application.

## Description

API endpoints for reading and updating a database of Rick and Morty characters

## Installation

```bash
npm install
```

## Usage

To start a dev server

```bash
npm dev
```

To setup the database and seed with dummy data

```bash
sqlite3 sqlite/characters.db < sqlite/init.sql
```

To run tests against a mock db and server

```bash
npm test
```

## API Documentation

Documentation for the available endpoints will be listed here.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
