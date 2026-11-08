# Application

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.29.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

To display a server-provided message on the home screen, set `FOO` when starting
the application:

```bash
FOO="Hello from the server!" npm start
```

Routes use server rendering so the running server's `FOO` value is used rather
than a value captured at build time. Set `FOO` in the server's runtime
environment in production. The value is transferred in the rendered HTML and
is visible to visitors, so do not use it for secrets. If `FOO` is unset, the
home screen displays `FOO is not set`.

## Firebase configuration

Copy `.env.example` to `.env` in the `application/` directory and fill in the
Firebase web app configuration values. Start the app from this directory so
the server-side dotenv loader can read `.env`:

```bash
cp .env.example .env
npm start
```

In production, provide the same `FIREBASE_*` variables to the SSR server as
runtime environment variables. Firebase web configuration is included in
rendered HTML for browser initialization and is visible to visitors; it is not
a secret. Protect your Firebase resources with Firebase Security Rules.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
