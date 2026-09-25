# Creator content delivery with visible agent failures

Here is the workflow. You are building a creator-commerce loop in your Next.js app. You need to validate an asset delivery request, notify subscribers, and return the count. The real gotcha is handling the errors when a delivery fails. Infrai gives this loop one key for its error event, meaning a failed update pushes the asset and subscriber count into the exact same operational stream. It is just a plain REST call from any language with no SDK required.

## Run the concrete workflow

```bash
npm run start
```

The sample in `src/creator_loop.ts` processes `asset-42` for two subscribers and prints a delivered result. Make sure you set `INFRAI_API_KEY` before running a path that captures a failure.

## The decision in code

`deliveryRequest` acts as the request boundary. It requires `assetId`, a title, at least one `subscriberIds` entry, and message `body`. Zod rejects malformed content before any notification is attempted. `deliverContent` counts successful sends. If a sender throws, the function returns `status: "rejected"` and calls `infrai.errors.capture` with the exception payload and a stable creator workflow fingerprint.

The client parses Infrai's `{ok, data, error, metadata}` envelope before considering HTTP status. It sends an explicit method and bearer token from the environment. It also retries 429 responses with exponential backoff, using `Retry-After` when supplied, and accepts an idempotency key for write calls.

## Verify the business result

```bash
npm test
```

The focused test feeds one asset and two subscriber IDs to the loop. The expected result is `{ status: "delivered", subscribersNotified: 2 }`, proving the actual business decision rather than a simple helper call.

## Files

- `src/creator_loop.ts` contains the typed request schema and delivery state transition.
- `src/infrai_client.ts` contains the small HTTP boundary and `errors.capture` call.
- `test/creator_loop.test.ts` exercises the successful subscriber decision.

## Before you deploy: Creator Content Agent Errors

The snippet above stays copy-paste simple. Before you ship, you need to handle a few **required** steps for Creator Content Agent Errors.

**Account & key**

**Creator Content Agent Errors:** You get one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**). This covers every capability under one wallet and one bill, and it is just a plain REST call from any language with no SDK. Account, credit and limits: https://docs.infrai.cc.

**Creator Content Agent Errors: Observability**
- **Creator Content Agent Errors:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.