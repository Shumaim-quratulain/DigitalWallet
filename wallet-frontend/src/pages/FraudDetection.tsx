import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FraudInput = {
  Transaction_Amount: number;
  Account_Balance: number;
  IP_Address_Flag: number;
  Daily_Transaction_Count: number;
  Avg_Transaction_Amount_7d: number;
  Failed_Transaction_Count_7d: number;
  Transaction_Distance: number;
  Risk_Score: number;
  Amount_to_Balance_Ratio: number;
  Amount_Deviation: number;
  Previous_Fraudulent_Activity: number;
  Is_Weekend: number;
  Hour: number;
  DayOfWeek: number;
  Is_Night: number;
  High_Risk_Category: number;
};

type Prediction = {
  prediction: number | string;
  probability?: number;
  label?: string;
  explanation?: string;
};

const initialInput = (amount: number, balance: number): FraudInput => ({
  Transaction_Amount: amount > 0 ? amount : 1200.5,
  Account_Balance: balance > 0 ? balance : 5000,
  IP_Address_Flag: 0,
  Daily_Transaction_Count: 3,
  Avg_Transaction_Amount_7d: 1100,
  Failed_Transaction_Count_7d: 0,
  Transaction_Distance: 20.5,
  Risk_Score: 0.2,
  Amount_to_Balance_Ratio:
    balance > 0 && amount > 0 ? Number((amount / balance).toFixed(4)) : 0.24,
  Amount_Deviation: 0.12,
  Previous_Fraudulent_Activity: 0,
  Is_Weekend: 0,
  Hour: new Date().getHours(),
  DayOfWeek: new Date().getDay() || 7,
  Is_Night: new Date().getHours() < 6 || new Date().getHours() >= 22 ? 1 : 0,
  High_Risk_Category: 0,
});

const fields: { key: keyof FraudInput; label: string; step?: string; max?: number }[] = [
  { key: "Transaction_Amount", label: "Transaction amount", step: "0.01" },
  { key: "Account_Balance", label: "Account balance", step: "0.01" },
  { key: "IP_Address_Flag", label: "Unrecognized IP address (0 or 1)", max: 1 },
  { key: "Daily_Transaction_Count", label: "Transactions today", max: 1000 },
  { key: "Avg_Transaction_Amount_7d", label: "Average transaction amount (7 days)", step: "0.01" },
  { key: "Failed_Transaction_Count_7d", label: "Failed transactions (7 days)", max: 1000 },
  { key: "Transaction_Distance", label: "Transaction distance", step: "0.1" },
  { key: "Risk_Score", label: "Risk score (0-1)", step: "0.01", max: 1 },
  { key: "Amount_to_Balance_Ratio", label: "Amount-to-balance ratio", step: "0.0001" },
  { key: "Amount_Deviation", label: "Amount deviation", step: "0.01" },
  { key: "Previous_Fraudulent_Activity", label: "Previous fraud activity (0 or 1)", max: 1 },
  { key: "Is_Weekend", label: "Weekend (0 or 1)", max: 1 },
  { key: "Hour", label: "Hour (0-23)", max: 23 },
  { key: "DayOfWeek", label: "Day of week (1-7)", max: 7 },
  { key: "Is_Night", label: "Night-time (0 or 1)", max: 1 },
  { key: "High_Risk_Category", label: "High-risk category (0 or 1)", max: 1 },
];

const fraudApiBase = import.meta.env.VITE_FRAUD_API_BASE_URL || "/fraud-api";

function FraudDetection() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(() =>
    initialInput(
      Number(searchParams.get("amount")),
      Number(searchParams.get("balance"))
    )
  );
  const [model, setModel] = useState<"ml" | "ai">("ml");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateInput = (key: keyof FraudInput, value: string) => {
    const number = Number(value);
    setInput((current) => {
      const next = { ...current, [key]: Number.isFinite(number) ? number : 0 };
      if (key === "Transaction_Amount" || key === "Account_Balance") {
        next.Amount_to_Balance_Ratio =
          next.Account_Balance > 0
            ? Number((next.Transaction_Amount / next.Account_Balance).toFixed(4))
            : 0;
      }
      return next;
    });
  };

  const runPrediction = async () => {
    setIsLoading(true);
    setError("");
    setPrediction(null);
    try {
      const response = await fetch(
        `${fraudApiBase}/${model === "ml" ? "predict" : "ai-prediction"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Prediction failed.");
      }
      setPrediction(result as Prediction);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not connect to the fraud detection API."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const aiPrediction = String(prediction?.prediction ?? "").toLowerCase();
  const isFraud =
    model === "ml"
      ? prediction?.prediction === 1
      : /fraud|fraudulent/.test(aiPrediction) &&
        !/not fraud|non-fraud|legitimate/.test(aiPrediction);
  const isLegitimate =
    model === "ml"
      ? prediction?.prediction === 0
      : /legitimate|not fraud/.test(aiPrediction);
  const predictionLabel = isFraud
    ? "Fraud Transaction Detected"
    : isLegitimate
      ? "Legitimate Transaction Detected"
      : String(prediction?.prediction ?? "Unknown");

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fraud Detection
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Assess a transaction with the machine-learning model or Gemini AI.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction details</CardTitle>
            <CardDescription>
              Enter the transaction context used by the fraud model. Fields not
              collected by the wallet should be estimated from your records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={model === "ml" ? "default" : "outline"}
                onClick={() => {
                  setModel("ml");
                  setPrediction(null);
                  setError("");
                }}
              >
                ML Model
              </Button>
              <Button
                type="button"
                variant={model === "ai" ? "default" : "outline"}
                onClick={() => {
                  setModel("ai");
                  setPrediction(null);
                  setError("");
                }}
              >
                AI Model (Gemini)
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(({ key, label, step, max }) => (
                <Input
                  key={key}
                  label={label}
                  type="number"
                  min="0"
                  max={max}
                  step={step || "1"}
                  value={input[key]}
                  onChange={(event) => updateInput(key, event.target.value)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={runPrediction} disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Predict transaction"}
              </Button>
              {searchParams.has("amount") && (
                <Link
                  to="/send-money"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Return to send money
                </Link>
              )}
            </div>

            {error && (
              <div role="alert" className="rounded-md bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {prediction && (
              <div
                className={`rounded-lg border-l-4 p-5 ${
                  isFraud
                    ? "border-red-600 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
                    : isLegitimate
                      ? "border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
                      : "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
                }`}
                role="status"
              >
                <h2 className="text-xl font-semibold">
                  {model === "ml" ? "ML Model" : "AI Model"} — {predictionLabel}
                </h2>
                {model === "ml" && typeof prediction.probability === "number" && (
                  <p className="mt-2">
                    Fraud probability: {(prediction.probability * 100).toFixed(1)}%
                  </p>
                )}
                {prediction.explanation && (
                  <p className="mt-3 whitespace-pre-wrap">{prediction.explanation}</p>
                )}
                <p className="mt-3 text-sm">
                  This is a risk assessment, not a guarantee. A result here does
                  not block or submit a wallet transfer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default FraudDetection;
