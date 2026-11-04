import { cn } from "@/utils/cn";
import { TransactionProps } from "@/types";

export function TransactionItem({
  type,
  status,
  amount,
  receiver,
  sender,
  date,
  description,
  className,
  currency = "INR",
}: TransactionProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

  const normalizedStatus = status.toUpperCase();
  const statusLabel =
    normalizedStatus === "COMPLETED"
      ? "Completed"
      : normalizedStatus === "PENDING" || normalizedStatus === "PROCESSING"
        ? "Pending"
        : "Failed";

  const statusColors = {
    Completed: "bg-green-100 text-green-800",
    Pending: "bg-amber-100 text-amber-800",
    Failed: "bg-red-100 text-red-800",
  };

  const typeColors = {
    CREDITED: "text-green-600",
    DEBITED: "text-red-600",
    TRANSFERRED: "text-blue-600",
  };

  const typeIcons = {
    CREDITED: (
      <svg
        className="h-5 w-5 text-green-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
    DEBITED: (
      <svg
        className="h-5 w-5 text-red-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
          clipRule="evenodd"
        />
      </svg>
    ),
    TRANSFERRED: (
      <svg
        className="h-5 w-5 text-blue-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-4",
        className
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          {typeIcons[type.toUpperCase() as keyof typeof typeIcons]}
        </div>
        <div>
          <p className="font-medium">
            {type === "CREDITED"
              ? `Received from ${sender?.username ?? "Unknown"}`
              : type === "DEBITED"
              ? `Paid to ${receiver?.username ?? "Unknown"}`
              : `Transfer to ${receiver?.username ?? "Unknown"}`}
          </p>
          <p className="text-sm text-gray-500">
            {description || "Transaction"}
          </p>
          <p className="text-xs text-gray-400">{formattedDate}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "font-semibold",
            typeColors[type.toUpperCase() as keyof typeof typeColors]
          )}
        >
          {type === "CREDITED" ? "+" : "-"}
          {formattedAmount}
        </p>
        <span
          className={cn(
            "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
            statusColors[statusLabel as keyof typeof statusColors]
          )}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
