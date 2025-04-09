<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Preparing

### Install npm packages

```bash
$ npm install
```

### Set config secrets, environment variables

Copy folder `.secrets.example`, then rename it to `.secrets`
Value in files can be same as in `.secrets.example`

```bash
# copy example secrets and set up
mkdir -p .secrets && cp -r .secrets.example/* .secrets/
```

### Install docker

Need to have docker and docker-compose installed.

[Get docker link](https://docs.docker.com/get-docker/)

Check installation by command

```bash
docker -v
docker-compose -v
```

## Running app

### Create and run docker's containers

To create the docker containers using the following command:

```bash
$ docker-compose up --build -d
```

### Start server

To run server app using the following command:

```bash
# watch mode
$ npm run start:dev
```

**After success launch, server swagger will on link:** http://localhost:8080

## Stopping app

After stop server app process also stop the docker containers using the following command:

```bash
$ docker-compose down
```

## Running tests

```bash
# run unit tests
$ npm run test

# run test coverage
$ npm run test:cov
```

## Generate documentation page

Before generate documentation need run test coverage

```bash
# test coverage
$ npm run test:cov
```

---

```bash
# serve doc page
$ npm run doc
```

## Commit Message Guidelines

https://www.conventionalcommits.org/en/v1.0.0/
https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines
