import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RootState } from "@/lib/store";
import { Redis } from "@upstash/redis"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface SidebarBadge {
	count: number;
	variant?: "default" | "secondary" | "destructive" | "warning";
}

export interface ServiceIcon {
	src: string;
	alt: string;
}

export interface SidebarItemMeta {
	badge?: SidebarBadge;
	serviceIcon?: ServiceIcon;
}

export interface RateLimitConfig {
	uniqueTokenPerInterval?: number
	interval?: number
  }

export const getSidebarItemMeta = (
	state: RootState,
	path: string
): SidebarItemMeta => {
	switch (path) {
		case "/inventory":
			const totalStock =
				state.inventory.items?.reduce((sum, item) => sum + item.quantity, 0) ||
				0;
			const lowStockItems =
				state.inventory.items?.filter((item) => item.quantity <= item.minAmount)
					.length || 0;
			return {
				badge:
					lowStockItems > 0
						? {
								count: lowStockItems,
								variant: "warning",
						  }
						: undefined,
				serviceIcon: state.auth.user?.integrations?.erp_crm?.enabled
					? {
							src: "/icons/sap.svg",
							alt: "ERP Integration",
					  }
					: undefined,
			};

		case "/orders":
			const pendingOrders = state.orders.items.filter(
				(order) => order.status === "PENDING"
			).length;
			return {
				badge:
					pendingOrders > 0
						? {
								count: pendingOrders,
								variant: "default",
						  }
						: undefined,
			};

		case "/logistics":
			const inTransitShipments = state.shipment.items.filter(
				(s) => s.status === "IN_TRANSIT"
			).length;
			return {
				badge:
					inTransitShipments > 0
						? {
								count: inTransitShipments,
								variant: "default",
						  }
						: undefined,
			};

		case "/suppliers":
			return {
				badge: {
					count: state.supplier.items.length,
					variant: "secondary",
				},
			};

		case "/users":
			return {
				badge: {
					count: state.user.items.length,
					variant: "secondary",
				},
				serviceIcon: state.auth.user?.integrations?.erp_crm?.enabled
					? {
							src: "/icons/sap.svg",
							alt: "CRM Integration",
					  }
					: undefined,
			};

		case "/apps":
			const ecommerceIntegration = state.auth.user?.integrations?.ecommerce;
			return ecommerceIntegration?.enabled
				? {
						serviceIcon: {
							src: "/icons/shopify.svg",
							alt: "Shopify Integration",
						},
				  }
				: {};

		default:
			return {};
	}
};

export interface RateLimiter {
  check: (limit: number, identifier: string) => Promise<void>
  pending: (identifier: string) => Promise<number>
  reset: (identifier: string) => Promise<void>
}

export async function getRateLimitHeaders(remaining: number, limit: number, reset: number) {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
    "X-RateLimit-Reset": reset.toString(),
  }
}

export function createRateLimiter(prefix: string, config: RateLimitConfig = {}): RateLimiter {
  const {
    uniqueTokenPerInterval = 500, // Default number of tokens per interval
    interval = 60000, // Default interval of 60 seconds
  } = config

  const redis = Redis.fromEnv()

  return {
    check: async (limit: number, identifier: string) => {
      const key = `${prefix}:${identifier}`
      const count = await redis.incr(key)

      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, Math.floor(interval / 1000))
      }

      if (count > limit) {
        const ttl = await redis.ttl(key)
        throw new Error(
          JSON.stringify({
            error: "Too Many Requests",
            limit,
            remaining: 0,
            reset: Date.now() + ttl * 1000,
          }),
        )
      }
    },

    pending: async (identifier: string) => {
      const key = `${prefix}:${identifier}`
      return redis.get(key) as Promise<number>
    },

    reset: async (identifier: string) => {
      const key = `${prefix}:${identifier}`
      await redis.del(key)
    },
  }
}

// Middleware to handle rate limiting
export async function withRateLimit(req: Request, prefix: string, limit: number, interval = 60000) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous"
  const limiter = createRateLimiter(prefix, { interval })

  try {
    await limiter.check(limit, ip)
    const pending = await limiter.pending(ip)
    const remaining = Math.max(0, limit - (pending ?? 0))
    const reset = Date.now() + interval

    return {
      headers: await getRateLimitHeaders(remaining, limit, reset),
      limited: false,
    }
  } catch (error) {
	const data = JSON.parse((error as Error).message);
    return {
      headers: await getRateLimitHeaders(0, limit, data.reset),
      limited: true,
    }
  }
}
