// src/app/data_user_usage.ts
import { UserUsage } from "./columns_user_usage"

export const userUsageData: UserUsage[] = [
  {
    apiKey: "ak-12345abcde6789f",
    clientName: "Marketing Team App",
    lastActive: "2023-10-25",
    callCountToday: 550,
    callCountTotal: 15200,
    status: "active",
  },
  {
    apiKey: "ak-98765fedcb4321a",
    clientName: "Internal Dashboard",
    lastActive: "2023-10-25",
    callCountToday: 2100,
    callCountTotal: 89000,
    status: "active",
  },
  {
    apiKey: "ak-0192837465abced",
    clientName: "Partner A Integration",
    lastActive: "2023-10-24",
    callCountToday: 0,
    callCountTotal: 2500,
    status: "inactive",
  },
  {
    apiKey: "ak-1122334455abced",
    clientName: "Test App",
    lastActive: "2023-09-15",
    callCountToday: 0,
    callCountTotal: 150,
    status: "suspended",
  },
  {
    apiKey: "ak-123123123123123",
    clientName: "External API Consumer",
    lastActive: "2023-10-25",
    callCountToday: 120,
    callCountTotal: 4800,
    status: "active",
  },
];
