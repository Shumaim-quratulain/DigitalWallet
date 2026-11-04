import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Account } from "@/types";
import DebouncedUserDropdown from "@/components/ui/DebouncedUserDropdown";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

function SendMoney() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [newRecipient, setNewRecipient] = useState<Account | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<Account | null>(null);
  const stored = localStorage.getItem("bankapp_user");
  const parsed = stored ? JSON.parse(stored) : null;
  const token = parsed?.token;

  useEffect(() => {
    if (!user?.username || !token) return;

    const fetchUserDetails = async () => {
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
  }, [token, user]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!newRecipient) {
        alert("Please select a recipient");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!amount || !Number.isInteger(Number(amount)) || Number(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }
      if (userDetails && parseFloat(amount) > userDetails.balance) {
        alert("Insufficient funds");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setIsSending(true);
      try {
        await axios.post(
        "/api/v1/transaction/send-money",
        {
          receiver: newRecipient?.id,
          amount: Number(amount),
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
        );

        alert("Money sent successfully!");
        setStep(1);
        setAmount("");
        setDescription("");
        setNewRecipient(null);
      } catch (error) {
        const responseMessage = axios.isAxiosError(error)
          ? error.response?.data
          : null;
        alert(
          typeof responseMessage === "string"
            ? responseMessage
            : "Transfer failed. Please try again."
        );
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepComplete = () => {
    if (step === 1) {
      return !!newRecipient;
    }
    if (step === 2) {
      const amt = Number(amount);
      return amt > 0 && userDetails !== null && amt <= userDetails.balance;
    }
    return true;
  };

  if (!user?.username || !token) return null;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
        <p className="text-gray-600">
          Transfer funds to another account or recipient
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>
                {step === 1
                  ? "Select or add a recipient"
                  : step === 2
                  ? "Enter the amount and description"
                  : "Review and confirm your transfer"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">
                      Add New Recipient
                    </h3>
                    <DebouncedUserDropdown
                      value={newRecipient}
                      onSelect={(user) => {
                        setNewRecipient(user);
                      }}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">
                      Transfer Amount
                    </h3>
                    <div className="space-y-4">
                      <Input
                        label="Amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                      />
                      <p className="text-sm text-gray-500">
                        Available Balance:{" "}
                        {userDetails ? userDetails.balance : "Loading..."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-medium">
                      Description (Optional)
                    </h3>
                    <Input
                      label="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Rent payment, Gift, etc."
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="mb-4 text-lg font-medium">
                    Review Transfer Details
                  </h3>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-medium">{userDetails?.username}</p>
                        <p className="text-sm text-gray-500">
                          {userDetails?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p className="font-medium">
                          {newRecipient?.username || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {newRecipient?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <p className="font-medium">Amount</p>
                        <p className="font-bold">₹{parseFloat(amount)}</p>
                      </div>
                      {description && (
                        <div className="mt-2 flex justify-between">
                          <p className="font-medium">Description</p>
                          <p>{description}</p>
                        </div>
                      )}
                    </div>
                    <div className="rounded-md bg-blue-50 p-4 text-blue-800">
                      <p className="text-sm">
                        By clicking "Send Money", you authorize this transfer
                        and agree to our terms of service.
                      </p>
                      <Link
                        to={`/fraud-detection?amount=${encodeURIComponent(amount)}&balance=${encodeURIComponent(String(userDetails?.balance ?? 0))}`}
                        className="mt-2 inline-block text-sm font-semibold text-blue-700 underline"
                      >
                        Analyze this transfer with fraud detection
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleContinue}
                disabled={!isStepComplete() || isSending}
              >
                {isSending ? "Sending..." : step === 3 ? "Send Money" : "Continue"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* <div>
          <Card>
            <CardHeader>
              <CardTitle>From Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedAccount.id === account.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAccount(account)}
                  >
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-500">
                      {account.accountNumber}
                    </p>
                    <p className="mt-2 text-lg font-bold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: account.currency,
                      }).format(account.balance)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </DashboardLayout>
  );
}

export default SendMoney;
