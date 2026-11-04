import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Label } from "../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Account } from "@/types";

function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [userDetails, setUserDetails] = useState<Account | null>(null);
  const [email, setEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
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
        setEmail(res.data.email);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleUpdate = async () => {
    if (!userDetails) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      await axios.put(
        "/api/v1/user/email",
        { email },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setUserDetails({ ...userDetails, email });
      setUpdateSuccess("Email updated successfully.");
    } catch (error) {
      const responseMessage = axios.isAxiosError(error)
        ? error.response?.data
        : null;
      setUpdateError(
        typeof responseMessage === "string"
          ? responseMessage
          : "Email update failed. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || !userDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-xl font-medium text-gray-600">
            Loading settings...
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="id">User ID</Label>
            <Input id="id" value={userDetails.id} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={userDetails.username} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          {updateError && (
            <p role="alert" className="text-sm text-red-600">
              {updateError}
            </p>
          )}
          {updateSuccess && (
            <p role="status" className="text-sm text-green-600">
              {updateSuccess}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="balance">Balance</Label>
            <Input id="balance" value={`₹${userDetails.balance}`} disabled />
          </div>

          <Button
            onClick={handleUpdate}
            disabled={updating}
            className="w-full mt-2"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Email"
            )}
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default Settings;
