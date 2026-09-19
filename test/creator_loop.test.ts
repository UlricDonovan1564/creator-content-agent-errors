import assert from "node:assert/strict";
import { deliverContent } from "../src/creator_loop.ts";

const input = { assetId: "asset-7", title: "Behind the scenes", subscriberIds: ["a", "b"], body: "New post" };
const sent: string[] = [];
const result = await deliverContent(input, async (id) => { sent.push(id); });
assert.deepEqual(result, { assetId: "asset-7", subscribersNotified: 2, status: "delivered" });
assert.deepEqual(sent, ["a", "b"]);
console.log("creator delivery decision: delivered to both subscribers");
