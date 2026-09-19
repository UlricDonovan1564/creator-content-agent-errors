import { z } from "zod";
import { infrai } from "./infrai_client.ts";

export const deliveryRequest = z.object({
  assetId: z.string().min(1),
  title: z.string().min(1),
  subscriberIds: z.array(z.string().min(1)).min(1),
  body: z.string().min(1)
});
export type DeliveryRequest = z.infer<typeof deliveryRequest>;

export type DeliveryResult = { assetId: string; subscribersNotified: number; status: "delivered" | "rejected" };

export async function deliverContent(input: unknown, send: (subscriberId: string, body: string) => Promise<void>): Promise<DeliveryResult> {
  const request = deliveryRequest.parse(input);
  let sent = 0;
  try {
    for (const subscriberId of request.subscriberIds) {
      await send(subscriberId, request.body);
      sent += 1;
    }
    return { assetId: request.assetId, subscribersNotified: sent, status: "delivered" };
  } catch (error) {
    await infrai.errors.capture({
      title: "creator content delivery failed",
      message: error instanceof Error ? error.message : String(error),
      level: "error",
      fingerprint: ["creator-commerce", "subscriber-update"],
      exception: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      context: { assetId: request.assetId, title: request.title, subscribersNotified: sent }
    });
    return { assetId: request.assetId, subscribersNotified: sent, status: "rejected" };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = { assetId: "asset-42", title: "Studio cut", subscriberIds: ["sub-1", "sub-2"], body: "Your new download is ready." };
  const result = await deliverContent(sample, async (subscriberId, body) => console.log(`${subscriberId}: ${body}`));
  console.log(JSON.stringify(result));
}
