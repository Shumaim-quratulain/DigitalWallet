import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionItem } from "@/components/ui/transaction-item";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Account, TransactionProps } from "@/types";
import { useAuth } from "@/context/AuthContext";

function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [userDetails, setUserDetails] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated && !isLoading) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const stored = localStorage.getItem("bankapp_user");
      const parsed = stored ? JSON.parse(stored) : null;
      const token = parsed?.token;

      if (!user?.username || !token) return;

      try {
        const res = await axios.post<Account>(
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

    fetchUserDetails();
  }, [user]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const stored = localStorage.getItem("bankapp_user");
      const parsed = stored ? JSON.parse(stored) : null;
      const token = parsed?.token;

      if (!token) return;

      try {
        const res = await axios.get<TransactionProps[]>(
          "/api/v1/transaction/getTransactionList",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setTransactions(res.data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  if (isLoading || !userDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-6">
          <p className="text-xl font-medium text-gray-600">
            Loading user details...
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

  const mapTransactionType = (type: string): TransactionProps["type"] => {
    switch (type.toLowerCase()) {
      case "credited":
      case "credit":
        return "CREDITED";
      case "debited":
      case "debit":
        return "DEBITED";
      case "transferred":
      case "transfer":
        return "TRANSFERRED";
      default:
        return "TRANSFERRED";
    }
  };

  // Real figures derived from the user's own transaction history.
  const income = transactions
    .filter((t) => String(t.type).toUpperCase() === "CREDITED")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => String(t.type).toUpperCase() === "DEBITED")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = income - expenses;
  const recentTransactions = transactions.slice(0, 3);

  const maxFlow = Math.max(income, expenses, Math.abs(savings), 1);
  const barWidth = (value: number) =>
    `${Math.max(0, Math.min(100, (Math.abs(value) / maxFlow) * 100))}%`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back <strong>{userDetails.username}</strong>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Account Balance Card */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className={
                  "cursor-pointer rounded-lg border p-4 transition-colors border-blue-500 bg-blue-50"
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{userDetails.username}</p>
                    <p className="text-sm text-gray-500">{userDetails.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{userDetails.balance}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/send-money">
                <Button className="w-full justify-start" variant="outline">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                    <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
                  Send Money
                </Button>
              </Link>
              <Link to="/transactions">
                <Button className="w-full justify-start" variant="outline">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Transactions
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Pay Bills
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
                Deposit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{income.toFixed(2)}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: barWidth(income) }}
                  ></div>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{expenses.toFixed(2)}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: barWidth(expenses) }}
                  ></div>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Savings</p>
                <p
                  className={`text-2xl font-bold ${
                    savings >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  ₹{savings.toFixed(2)}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: barWidth(savings) }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link to="/transactions">
            <Button variant="link">View All</Button>
          </Link>
        </div>
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500">No recent transactions found.</p>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                {...transaction}
                type={mapTransactionType(transaction.type)}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
