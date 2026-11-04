import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Account } from "@/types";

function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [userDetails, setUserDetails] = useState<Account | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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

  if (isLoading || !userDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-xl font-medium text-gray-600">
            Loading profile...
          </p>
          <svg
            className="w-10 h-10 text-blue-500 animate-spin"
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-lg font-medium">{userDetails.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium">{userDetails.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account ID</p>
              <p className="text-lg font-medium text-amber-500">
                {userDetails.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Summary */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-lg border p-4 bg-blue-50 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{userDetails.balance.toFixed(2)}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-1h2v1zm0-3H9V5h2v5z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences Placeholder (Optional third column or future settings) */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            <p>Customize preferences in future versions.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
