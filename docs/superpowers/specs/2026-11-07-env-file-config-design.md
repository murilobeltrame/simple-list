# Load Firebase configuration from `.env`

## Goal

Remove the checked-in Firebase configuration module and source its values from
server environment variables, with local development values read from
`application/.env`.

## Design

The Angular application uses server-side rendering. The server will load
`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`,
`FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`,
and `FIREBASE_MEASUREMENT_ID` from its environment. Local runs can provide
these values in the ignored `application/.env` file via the existing `dotenv`
setup; production supplies them as runtime environment variables.

The server will validate that all required settings are present and put the
Firebase configuration in Angular `TransferState`. The shared app config will
initialize AngularFire from that state, making the same configuration
available during SSR and browser hydration without bundling an environment
module or requiring a build-time generated file. Existing `FOO` transfer
behavior remains unchanged.

Delete `application/src/environments/environment.ts` and the obsolete
`environment.example.ts`. Add an `application/.env.example` containing the
variable names with blank placeholder values, and update the application
README with local setup and production runtime configuration guidance. Firebase
web configuration is public and must not be presented as a secret.

## Alternatives considered

1. **Runtime SSR configuration and `TransferState` (recommended):** reads
   deployment runtime variables and local `.env`, avoids generated source
   files, and does not tie changes to a browser rebuild. Values transferred to
   the browser remain visible to users.
2. **Build-time `.env` loading:** simple for static client injection, but
   values are captured at build time and bundled into browser assets.
3. **Continue using a TypeScript environment module:** does not meet the
   requirement to remove the checked-in environment file.

## Validation

No tests or builds are required for this change, per the user's instruction.
Implementation should still be reviewed to ensure all former configuration
imports are removed and `FOO` continues to use the existing transfer path.
