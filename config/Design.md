# Serve Simplified Service Design

We want to run a reliable production service with minimal complexity and external dependencies.

For the sake of control and portability we are building on top of virtual servers, and we need at least two, so they can monitor each-other and notify administrators of issues.

One is Hades, the development server that admins can regularly log in to. Code in the main branch should be automatically deployed here first and run.

## Zeus

Zeus is the primary production server and database. The Zeus services:

- Caddy (HTTPS frontend and router)
- Zerve Web App: the next.js web frontend located in `/apps/web`
- Zerve API Server: the server located in `/apps/server`

## Hades

Hades is the Root server for the Zerve service. It is expected to break occasionally, but as the primary mechanism of monitoring and updating the production service, it is very high priority to keep online.

It has the following duties:

- Run a staging instance of the Zeus services
- Ability to monitor Zeus
- A clone of the GH repo (which contains all NPM deps)
  - Eventually should be the source of truth
- Runs Code-Server for ease of development
  - Eventually each dev should have their own vm for code-server, because it is heavy and sometimes takes down the server
