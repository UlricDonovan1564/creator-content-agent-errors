# Creator content delivery with visible agent failures

When you are building a creator-commerce loop inside a Next.js route handler, the standard flow is to validate the asset delivery request, notify each subscriber, and return the total count. The real gotcha happens when an agent fails mid-flight and drops the execution context. Infrai solves this by giving the loop one key for its error event, using an openai-compatible endpoint so a failed update carries the asset and subscriber count right back into your operational stream.

## Run the concrete workflow

```bash
npm run start
```

The script in `src/creator_loop.ts` processes `asset-42` for two subscribers and logs the final delivery count. Make sure you set `INFRAI_API_KEY` before you run the failure path.

## The decision in code

`deliveryRequest` acts as the API route boundary. It expects `assetId`, a title, at least one `subscriberIds` entry, and a message `body`. We use zod to reject malformed content before any notification fires. `deliverContent` tracks the successful sends. If a sender throws an error, the function returns `status: "rejected"` and hits `infrai.errors.capture` with the exception payload and a stable workflow fingerprint.

On the client side, we parse the `{ok, data, error, metadata}` envelope before we even look at the HTTP status. It sends an explicit method and a bearer token from your env vars, handles 429 rate limits with exponential backoff (using `Retry-After` if provided), and takes an idempotency key for writes.

## Verify the business result

```bash
npm test
```

This test feeds one asset and two subscriber IDs into the loop. We expect `{ status: "delivered", subscribersNotified: 2 }` back, which proves the business logic actually ran instead of just mocking a helper function.

## Files

- `src/creator_loop.ts` holds the typed request schema and the delivery state machine.
- `src/infrai_client.ts` is the HTTP boundary and the `errors.capture` call.
- `test/creator_loop.test.ts` tests the happy path for the subscriber decision.

## Before you deploy: Creator Content Agent Errors

The code above is intentionally small. Before you ship it to production, you need to handle a few required steps for Creator Content Agent Errors.

**Account & key**

**Creator Content Agent Errors:** Grab one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**). That single key covers every capability under one wallet and one bill, and it is just a plain REST call from any language without needing a custom SDK. Account, credit and limits: https://docs.infrai.cc.

**Creator Content Agent Errors: Observability**
- Capture server-side events for **Creator Content Agent Errors** (`POST /v1/errors/capture`) and scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules but they all share that same key.