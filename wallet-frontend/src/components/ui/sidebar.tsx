import * as React from "react";
import { cn } from "@/utils/cn";

interface SidebarContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
}

function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen } = useSidebarContext();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-950",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
      {...props}
    />
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex h-14 items-center border-b px-4", className)}
      {...props}
    />
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto p-4", className)} {...props} />
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return <div className={cn("pb-4", className)} {...props} />;
}

interface SidebarGroupLabelProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

function SidebarGroupLabel({ className, ...props }: SidebarGroupLabelProps) {
  return (
    <p
      className={cn(
        "mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    />
  );
}

interface SidebarGroupContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarGroupContent({
  className,
  ...props
}: SidebarGroupContentProps) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return <div className={cn("", className)} {...props} />;
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  asChild?: boolean;
}

function SidebarMenuButton({
  className,
  isActive,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? React.Fragment : "button";
  const childProps = asChild ? {} : props;

  return (
    <Comp
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium",
        isActive
          ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        className
      )}
      {...childProps}
    >
      {props.children}
    </Comp>
  );
}

interface SidebarRailProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarRail({ className, ...props }: SidebarRailProps) {
  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  );
}

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { isOpen, setIsOpen } = useSidebarContext();

  return (
    <button
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="9" x2="15" y1="3" y2="3" />
        <line x1="9" x2="15" y1="21" y2="21" />
        <line x1="9" x2="9" y1="9" y2="15" />
        <line x1="15" x2="15" y1="9" y2="15" />
      </svg>
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarInset({ className, ...props }: SidebarInsetProps) {
  const { isOpen } = useSidebarContext();

  return (
    <div
      className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isOpen ? "md:ml-64" : "md:ml-0",
        className
      )}
      {...props}
    />
  );
}

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
};
