# Manual Tests

Automic testing in Node-Red components it's pretty hard and it cannot be trusted 100% because it is only tested a mock of the components.

So I good option is to do manual testing with real flows and then you can even share them as examples (as we say in spanish "get two for one")

## Preparing environment

> This is opinionated and if there are better options, probably they were tested but not achieved the expected result

It needs:

1. A Node-Red instance to work
2. Install your components and their deps
3. Testing inside Node-Red

So to accomplish the working directory is in this way:

- `package.json`: Components package.json
- `src/`: Components source files
- `tests/`
    - `nodered/`
        - `data/`: Working Node-Red files
        - other_folders/: If you need more folders and files
- `Dockerfile`
- `docker-compose.yml`

It is going to create a prepared image with `Dockerfile` with Node-Red and the components and **it's deps too**.

`docker-compose.yml` is to up the environment.

Example of `Dockerfile` content

```Dockerfile
FROM nodered/node-red:latest-18
# Create custom folders
USER root
RUN mkdir -p /components && chown node-red /components\
    && mkdir -p /config && chown node-red /config\
    && mkdir -p /db && chown node-red /db\
    && mkdir -p /static && chown node-red /static\
    && mkdir -p /tests && chown node-red /tests
USER node-red
# Add components
COPY ./package.json /components/package.json
COPY ./src/ /components/src/
# Install the components and their deps
RUN npm install <components-deps> /components
```

Example of `docker-compose.yml` content

```yaml
version: '3'

services:
  nodered:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - 1880:1880
    volumes:
      # Node-Red working files
      - ./tests/nodered/data:/data
      # Components
      - ./package.json:/components/package.json
      - ./src/:/components/src/
```

## Testing with the environment

Once the environment is prepared, just up everything from the root of the working directory and

```bash
docker compose up --build
```

Each time a change should be made in the components, or it's made, nothing changes in the Node-Red instance.

So the workflow is:

1. Testing in Node-Red
2. If a component needs a change, go to its html-js files and made it.
3. Go down the environment and starts again

A good shortcut it's to use this command

```bash
docker compose down && docker compose up --build
```

So the workflow should be:

1. Up the environment

    ```bash
    docker compose down && docker compose up --build
    ```

2. Test component in Node-Red
3. If a refactor it's need it, do it
4. Go to point 1.
