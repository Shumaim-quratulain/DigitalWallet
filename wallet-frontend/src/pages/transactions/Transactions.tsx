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
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { TransactionList } from "@/types";

function Transactions() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [transactions, setTransactions] = useState<TransactionList[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const stored = localStorage.getItem("bankapp_user");
  const parsed = stored ? JSON.parse(stored) : null;
  const token = parsed?.token;

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
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
        const res = await axios.get(
          "/api/v1/transaction/getTransactionList?limit=10",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setTransactions(res.data);
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
    const type = transaction.type?.toLowerCase();
    const status = transaction.status ? "completed" : "pending";
    const receiver = transaction.receiver?.username?.toLowerCase() || "";
    const sender = transaction.sender?.username?.toLowerCase() || "";
    const description = transaction.description?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      sender.includes(search) ||
      receiver.includes(search) ||
      description.includes(search);

    switch (filter) {
      case "credit":
        return type === "credited" && matchesSearch;
      case "debit":
        return type === "debited" && matchesSearch;
      case "completed":
      case "pending":
        return status === filter && matchesSearch;
      case "failed":
        return false;
      default:
        return matchesSearch;
    }
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600">
          View and manage your transaction history
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex space-x-2">
              <Link to="/all-transactions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
              <Button variant="primary" size="sm">
                Export
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
                <Button
                  variant={filter === "all" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "credit" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter("credit")}
                >
                  Income
                </Button>
                <Button
                  variant={filter === "debit" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilter("debit")}
                >
                  Expenses
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "completed" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
              <Button
                variant={filter === "pending" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={filter === "failed" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("failed")}
              >
                Failed
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  id={transaction.id}
                  type={
                    transaction.type === "CREDITED"
                      ? "CREDITED"
                      : transaction.type === "DEBITED"
                      ? "DEBITED"
                      : "TRANSFERRED"
                  }
                  status={transaction.status ? "COMPLETED" : "PENDING"}
                  amount={transaction.amount}
                  sender={transaction.sender}
                  receiver={transaction.receiver}
                  date={transaction.date}
                  description={transaction.description || ""}
                />
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default Transactions;
