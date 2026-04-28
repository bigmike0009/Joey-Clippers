export const queryKeys = {
  shopDays: {
    all: ['shop_days'] as const,
    upcoming: () => [...queryKeys.shopDays.all, 'upcoming'] as const,
    detail: (id: string) => [...queryKeys.shopDays.all, id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    mine: () => [...queryKeys.bookings.all, 'mine'] as const,
    forDay: (shopDayId: string) => [...queryKeys.bookings.all, 'day', shopDayId] as const,
  },
  dayRequests: {
    all: ['day_requests'] as const,
    mine: () => [...queryKeys.dayRequests.all, 'mine'] as const,
  },
  profiles: {
    all: ['profiles'] as const,
    members: () => [...queryKeys.profiles.all, 'members'] as const,
  },
  invites: {
    all: ['invites'] as const,
  },
} as const;
