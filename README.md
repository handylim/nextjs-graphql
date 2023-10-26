# About
This is a [CRUD Duties Web App](http://localhost:3000) built with [Next.js](https://nextjs.org) and [GraphQL](https://graphql.org) powered with [PostgreSQL](https://www.postgresql.org) database with [Ant Design](https://ant.design) component library for the web UI

# Prerequisite
1. Install [git](https://git-scm.com/downloads) according to your operating system and clone this project. In Windows, make sure Git BASH is installed properly (see [guide](https://www.oracle.com/webfolder/technetwork/tutorials/ocis/ocis_fundamental/gitbash-inst.pdf)) to be able to run `.sh` script later.
2. Install [Node.js](https://nodejs.org) with [PNPM](https://pnpm.io)
3. Install [Docker](https://www.docker.com) and [docker-compose](https://docs.docker.com/compose/install). Make sure the current user can run `docker` and `docker-compose` from command line without using `sudo`.

# Getting Started
Install all the node package dependencies by running:
```bash
pnpm install
```

For developing, run the PostgreSQL docker container and the development server:
```bash
docker-compose up -d db
pnpm run dev
```

This project is using Jest to do the unit test; to check the test coverage run the following command:
```bash
pnpm run test:coverage
```

For deployment, in MacOS and Linux, `cd` to the project root from your terminal and run the following command:
```bash
sh run.sh
```
in Windows, open Git BASH (from `prerequisite#1`) by right-clicking on the project folder and selecting the _Git Bash Here_ option from the context menu (right-click menu) before running the following command in the Git BASH:
```bash
sh run.sh
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.