import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "../ui/sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();

  const goTo = (path: string) => () => navigate(path);

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/auth/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* The sidebar is `fixed`, so it must not take part in the flow.
            It is hidden on small screens where a 16rem panel would cover the
            whole page; the horizontal nav below replaces it there. */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader>
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Digital Wallet
            </h2>
          </SidebarHeader>

          {/* Sidebar Container */}
          <div className="m-4 rounded-2xl bg-white p-4 shadow-md dark:bg-gray-900 dark:shadow-lg space-y-6">
            {/* Main Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-white"
                      onClick={goTo("/dashboard")}
                    >
                      Dashboard
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-white"
                      onClick={goTo("/transactions")}
                    >
                      Transactions
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-white"
                      onClick={goTo("/send-money")}
                    >
                      Send Money
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-white"
                      onClick={goTo("/fraud-detection")}
                    >
                      Fraud Detection
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Account Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-white"
                      onClick={goTo("/profile")}
                    >
                      Profile
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-white"
                      onClick={goTo("/settings")}
                    >
                      Settings
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                      onClick={logout}
                    >
                      Logout
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <SidebarRail />
        </Sidebar>

        {/* The sidebar is `fixed` and 16rem (w-64) wide from the md breakpoint
            onwards, so the content must be offset by the full 16rem. The old
            `md:ml-20` (5rem) left the content hidden underneath the sidebar. */}
        <div className="flex w-full flex-col md:ml-64">
          <Header />

          {/* Mobile navigation - the fixed sidebar is hidden below md. */}
          <nav className="flex gap-2 overflow-x-auto border-b bg-white p-2 md:hidden">
            {[
              { label: "Dashboard", path: "/dashboard" },
              { label: "Transactions", path: "/transactions" },
              { label: "Send", path: "/send-money" },
              { label: "Fraud", path: "/fraud-detection" },
              { label: "Profile", path: "/profile" },
              { label: "Settings", path: "/settings" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={goTo(item.path)}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </nav>

          <main className="flex-1 p-4 md:p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
