import { createScorePdfResponse } from "@/lib/library/pdf-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return createScorePdfResponse(id, true);
}
