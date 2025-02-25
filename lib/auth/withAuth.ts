import { verifyAccessToken } from "./jwt"
import { withRateLimit } from "@/lib/utils"

export async function withAuth(req: Request, rateKey?: string, rateLimit?: number, rateDuration?: number) {
  // Apply rate limiting if parameters are provided
  const rateLimitResult =
    rateKey && rateLimit && rateDuration
      ? await withRateLimit(req, rateKey, rateLimit, rateDuration)
      : { headers: new Headers(), limited: false }

  if (rateLimitResult.limited) {
    return {
      userId: null,
      headers: rateLimitResult.headers,
      limited: true,
    }
  }

  // Get authorization header
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      userId: null,
      headers: rateLimitResult.headers,
      limited: false,
    }
  }

  // Extract and verify token
  const token = authHeader.split(" ")[1]
  try {
    const decoded = await verifyAccessToken(token)
    return {
      userId: decoded?.id,
      headers: rateLimitResult.headers,
      limited: false,
    }
  } catch (error) {
    return {
      userId: null,
      headers: rateLimitResult.headers,
      limited: false,
    }
  }
}

