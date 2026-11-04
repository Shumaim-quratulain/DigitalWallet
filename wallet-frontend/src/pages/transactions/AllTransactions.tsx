import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { TransactionItem } from "../../components/ui/transaction-item";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Account, TransactionProps } from "@/types";

type ApiTransaction = {
  id: string;
  type: string;
  status: string;
  amount: number;
  sender?: TransactionProps["sender"];
  receiver?: TransactionProps["receiver"];
  date: string;
  description?: string;
};

function AllTransactions() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [userDetails, setUserDetails] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const stored = localStorage.getItem("bankapp_user");
    const parsed = stored ? JSON.parse(stored) : null;
    const token = parsed?.token;

    const fetchUserDetails = async () => {
      if (!user?.username || !token) return;

      try {
        const res = await axios.post(
          "/api/v1/user/getUserDetails",
          { username: user.username },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setUserDetails(res.data);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };

    const fetchTransactionList = async () => {
      try {
        const res = await axios.get<ApiTransaction[]>(
          "/api/v1/transaction/getTransactionList",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data: TransactionProps[] = res.data.map((transaction) => ({
          id: transaction.id,
          type: transaction.type.toUpperCase() as TransactionProps["type"],
          status: transaction.status.toUpperCase() as TransactionProps["status"],
          amount: Number(transaction.amount),
          receiver: transaction.receiver,
          sender: transaction.sender,
          date: new Date(transaction.date),
          description: transaction.description,
        }));
        setTransactions(
          data.sort((a, b) => +new Date(b.date) - +new Date(a.date))
        );
      } catch (error) {
        console.error("Failed to fetch transaction list", error);
      }
    };

    fetchUserDetails();
    fetchTransactionList();
  }, [user]);

  if (isLoading || !userDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-6">
          <p className="text-xl font-medium text-gray-600">
            Loading transaction details...
          </p>
          <svg
            className="w-12 h-12 text-blue-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.receiver?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.sender?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "credit" && transaction.type === "CREDITED") ||
      (filter === "debit" && transaction.type === "DEBITED") ||
      (filter === "transfer" && transaction.type === "TRANSFERRED") ||
      transaction.status.toLowerCase() === filter;

    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const transactionDate = (transaction.date as Date).getTime();
      const startDate = new Date(dateRange.start).getTime();
      const endDate = new Date(dateRange.end).getTime();
      matchesDateRange =
        transactionDate >= startDate && transactionDate <= endDate;
    }

    return matchesSearch && matchesFilter && matchesDateRange;
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
        <p className="text-gray-600">
          Comprehensive view of your transaction history
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Download CSV
              </Button>
              <Button variant="primary" size="sm">
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-80"
              />
              <div className="flex flex-wrap gap-2">
                {["all", "credit", "debit", "transfer"].map((type) => (
                  <Button
                    key={type}
                    variant={filter === type ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilter(type)}
                  >
                    {type === "all"
                      ? "All"
                      : type === "credit"
                      ? "Income"
                      : type === "debit"
                      ? "Expenses"
                      : "Transfers"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["completed", "pending", "failed"].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">From:</span>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">To:</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-auto"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({ start: "", end: "" })}
              >
                Clear Dates
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} {...transaction} />
              ))
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-center">
                <p className="text-lg font-medium text-gray-600">
                  No transactions found
                </p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>

          {filteredTransactions.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstTransaction + 1} to{" "}
                {Math.min(indexOfLastTransaction, filteredTransactions.length)}{" "}
                of {filteredTransactions.length} transactions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default AllTransactions;
