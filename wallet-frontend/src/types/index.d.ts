import type React from "react";

// User types
export interface User {
  username: string;
  password: string;
  email: string;
  phone: string;
}

export interface DecodedToken {
  sub?: string;
  username?: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

// Auth types
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
}

export interface UserData {
  username: string;
  token: string;
}

export interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<UserData>;
  signup: (
    username: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<void>;
  logout: () => void;
}

// Transaction types
export type TransactionType = "CREDITED" | "DEBITED" | "TRANSFERRED";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface Transaction {
  sender?: string;
  reciever?: string;
  amount: number;
  description?: string;
}

export interface TransactionList {
  id: string;
  amount: number;
  description: string;
  type: "CREDITED" | "DEBITED" | "TRANSFERRED";
  status: boolean;
  sender?: User;
  receiver?: User;
  date: Date;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionProps {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency?: string;
  receiver?: TransactionAccount;
  sender?: TransactionAccount;
  date: Date | string;
  description?: string;
  className?: string;
}

export interface TransactionAccount {
  id?: string;
  username: string;
  email?: string;
  balance?: number;
}

// Account types
export interface Account {
  id: string;
  username: string;
  email: string;
  balance: number;
}

// Recipient types
export interface Recipient {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  email?: string;
}

// Theme types
export interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

// Component props
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
}
