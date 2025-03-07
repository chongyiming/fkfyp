"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  DollarSign,
  FileText,
  ChartBar,
  Bell,
  X,
  CalendarDays,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import TransactionForm from "@/components/transaction-form";
import TransactionList from "@/components/transaction-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import UserDropdown from "@/components/user-dropdown";
import { RiScanLine } from "@remixicon/react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Line,
  LineChart,
} from "recharts";
import { MetricCard } from "@/components/ui/MetricCard";
import { RecentEvents } from "@/components/ui/RecentEvents";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LineChartPulse } from "@/components/ui/LineChartPulse";
import CommissionClaimsCard from "@/components/ui/CommissionClaimsCard";
import UpcomingAppointmentsCard from "@/components/ui/UpcomingAppointmentsCard";
import "@/components/index.css";
import { useUserPermissions } from "@/components/UserPermissions";
import { supabase } from "../supabaseClient";

// Sample data for charts
const yearlySalesData = [
  { date: new Date("2023-01-15"), value: 4 },
  { date: new Date("2023-02-15"), value: 6 },
  { date: new Date("2023-03-15"), value: 8 },
  { date: new Date("2023-04-15"), value: 7 },
  { date: new Date("2023-05-15"), value: 9 },
  { date: new Date("2023-06-15"), value: 12 },
  { date: new Date("2023-07-15"), value: 11 },
  { date: new Date("2023-08-15"), value: 13 },
  { date: new Date("2023-09-15"), value: 10 },
  { date: new Date("2023-10-15"), value: 8 },
  { date: new Date("2023-11-15"), value: 11 },
  { date: new Date("2023-12-15"), value: 15 },
];

// Sample recent activity
const recentActivity = [
  {
    agent: "Sarah Lee",
    action: "Sold",
    property: "Parkview Heights",
    value: "$1.2M",
    time: "2h",
  },
  {
    agent: "James Wong",
    action: "Rented",
    property: "Riverside Res.",
    value: "$3.6K",
    time: "1d",
  },
  {
    agent: "Michael Chen",
    action: "Sold",
    property: "Lakeside Manor",
    value: "$2.5M",
    time: "2d",
  },
  {
    agent: "Aisha Patel",
    action: "Rented",
    property: "Urban Lofts",
    value: "$5.2K",
    time: "3d",
  },
];

// Sample previous activity for the modal
const previousActivity = [
  {
    agent: "David Kim",
    action: "Sold",
    property: "Mountain View",
    value: "$1.8M",
    time: "4d",
  },
  {
    agent: "Priya Singh",
    action: "Rented",
    property: "Downtown Condo",
    value: "$4.2K",
    time: "5d",
  },
  {
    agent: "Carlos Rodriguez",
    action: "Sold",
    property: "Sunset Villa",
    value: "$3.1M",
    time: "1w",
  },
  {
    agent: "Emma Wilson",
    action: "Rented",
    property: "Harbor Apartments",
    value: "$2.9K",
    time: "1w",
  },
  {
    agent: "Alex Thompson",
    action: "Sold",
    property: "Maple Residences",
    value: "$2.2M",
    time: "2w",
  },
];

const Dashboard = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showMarketTypeDialog, setShowMarketTypeDialog] = useState(false);
  const [selectedMarketType, setSelectedMarketType] = useState<
    "primary" | "secondary" | null
  >(null);
  const [pinnedCards, setPinnedCards] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [salesProgress, setSalesProgress] = useState(0);
  const [commissionProgress, setCommissionProgress] = useState(0);
  const [showMoreActivity, setShowMoreActivity] = useState(false);
  const { name } = useUserPermissions();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalNumberOfTransactions, setTotalNumberOfTransactions] = useState(0);
  const [averageRevenue, setAverageRevenue] = useState(0);

  console.log(name);
  // Greeting based on time of day
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }

  const handleNewTransaction = () => {
    setShowMarketTypeDialog(true);
  };

  const handleMarketTypeSelect = (type: "primary" | "secondary") => {
    setSelectedMarketType(type);
    setShowMarketTypeDialog(false);
    setShowTransactionForm(true);
  };

  const togglePin = (index: number) => {
    setPinnedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const bgColor = isDarkMode ? "bg-[#121212]" : "bg-white";
  const borderColor = isDarkMode ? "border-gray-800" : "border-gray-200";
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const gridColor = isDarkMode ? "#333" : "#e5e7eb";
  const labelColor = isDarkMode ? "#888" : "#666";
  const { userId, perms, id } = useUserPermissions();

  useEffect(() => {
    const fetchTotalSales = async () => {
      const { data, error } = await supabase
        .from("Agents")
        .select("total_sales_volume,number_of_transactions")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching level:", error);
      } else {
        console.log("id and data", userId, data);
        setTotalRevenue(data[0]?.total_sales_volume);
        setTotalNumberOfTransactions(data[0]?.number_of_transactions);
      }
    };
    fetchTotalSales();
  }, [userId]);

  useEffect(() => {
    setAverageRevenue(totalRevenue / totalNumberOfTransactions);
  }, [totalNumberOfTransactions, totalRevenue]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`${isDarkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-lg shadow-lg border ${borderColor}`}
        >
          <p className={`text-sm font-medium ${textColor}`}>{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-blue-400 text-sm">
              Sales: {payload[0].value} properties
            </p>
            <p className="text-emerald-400 text-sm">
              Rentals: {payload[1].value} properties
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const animateProgress = (setter: any, target: any, speed = 20) => {
      let current = 0;
      const interval = setInterval(() => {
        if (current < target) {
          current += 1;
          setter(current);
        } else {
          clearInterval(interval);
        }
      }, speed);

      return interval;
    };

    const salesInterval = animateProgress(setSalesProgress, 66);
    const commissionInterval = animateProgress(setCommissionProgress, 78, 15);

    return () => {
      clearInterval(salesInterval);
      clearInterval(commissionInterval);
    };
  }, []);

  const renderSegments = (current: any, total: any, count = 10) => {
    const segments = [];
    const filledSegments = Math.floor((current / 100) * count);

    for (let i = 0; i < count; i++) {
      segments.push(
        <div
          key={i}
          className={`h-1 w-full rounded-full transition-all duration-300 ${
            i < filledSegments ? "bg-blue-500" : "bg-slate-700"
          }`}
          style={{
            opacity: i < filledSegments ? 1 : 0.3,
            transition: `opacity 300ms ease-out ${i * 50}ms, background-color 300ms ease-out`,
          }}
        />
      );
    }
    return <div className="grid grid-cols-10 gap-1 w-full">{segments}</div>;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
        {/* Header */}
        <header className="border-b">
          {/* Top Row: Breadcrumb and User Dropdown */}
          <div className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger className="-ms-4" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      <RiScanLine size={22} aria-hidden="true" />
                      <span className="sr-only">Dashboard</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex gap-3 ml-auto">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Market Type Selection Dialog */}
        <Dialog
          open={showMarketTypeDialog}
          onOpenChange={setShowMarketTypeDialog}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Market Type</DialogTitle>
              <DialogDescription>
                Choose the type of property transaction you want to create
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => handleMarketTypeSelect("primary")}
              >
                <Building className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Primary Market</p>
                  <p className="text-sm text-muted-foreground">
                    Developer Projects
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => handleMarketTypeSelect("secondary")}
              >
                <FileText className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Secondary Market</p>
                  <p className="text-sm text-muted-foreground">
                    Individual Property
                  </p>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Activity Modal */}
        {showMoreActivity && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-lg shadow-lg w-full max-w-2xl">
              <div className="flex justify-between items-center p-4 border-b border-slate-800">
                <h3 className="text-lg font-medium">All Recent Activity</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMoreActivity(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-3">
                  {[...recentActivity, ...previousActivity].map(
                    (activity, index) => (
                      <div
                        key={index}
                        className="flex items-center py-2 border-b border-slate-800"
                      >
                        <Avatar className="h-8 w-8 mr-3 bg-slate-700">
                          <AvatarFallback>
                            {activity.agent
                              .split(" ")
                              .map((name) => name[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{activity.agent}</div>
                          <div className="text-slate-400">
                            <span
                              className={
                                activity.action === "Sold"
                                  ? "text-green-400"
                                  : "text-blue-400"
                              }
                            >
                              {activity.action}
                            </span>{" "}
                            {activity.property} • {activity.value}
                          </div>
                        </div>
                        <div className="text-slate-400 text-sm">
                          {activity.time}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-slate-800">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowMoreActivity(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          {showTransactionForm ? (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
              <div className="min-h-screen px-4 py-8">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setSelectedMarketType(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
                <TransactionForm
                  onClose={() => {
                    setShowTransactionForm(false);
                    setSelectedMarketType(null);
                  }}
                  marketType={selectedMarketType!}
                />
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-4rem)] overflow-auto pb-6">
              {/* CSS Grid Dashboard Layout */}

              <div className="grid-dashboard">
                {/* Welcome Message */}
                <div className="welcome">
                  <div
                    className={`dashboard-card ${bgColor} rounded-2xl border ${borderColor} p-8 shadow-lg`}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className={`text-xl font-semibold ${textColor}`}>
                        {greeting}, {name}
                      </h2>
                      <Button onClick={handleNewTransaction}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sales
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Top Metrics Row */}
                <div className="metrics">
                  <div className="grid grid-cols-3 gap-6 h-full">
                    {/* Total Revenue */}
                    <div className="dashboard-card">
                      <div
                        className={`text-gray-400 px-4 py-3 flex flex-col justify-center h-full ${bgColor} rounded-2xl border ${borderColor}`}
                      >
                        <div className="text-slate-400 text-xs">
                          Total Revenue
                        </div>
                        <div className="text-2xl font-bold animate-fade-in">
                          ${totalRevenue}
                        </div>
                        <div className="text-green-400 text-xs flex items-center">
                          <TrendingUp size={12} className="mr-1" />
                          15% vs last year
                        </div>
                      </div>
                    </div>

                    {/* Avg Transaction */}
                    <div className="dashboard-card">
                      <div
                        className={`text-gray-400 px-4 py-3 flex flex-col justify-center h-full ${bgColor} rounded-2xl border ${borderColor}`}
                      >
                        <div className="text-slate-400 text-xs">
                          Avg. Transaction
                        </div>
                        <div className="text-2xl font-bold animate-fade-in">
                          ${averageRevenue}
                        </div>
                        <div className="text-green-400 text-xs flex items-center">
                          <TrendingUp size={12} className="mr-1" />
                          8% vs last year
                        </div>
                      </div>
                    </div>

                    {/* Total Properties */}
                    <div className="dashboard-card">
                      <div
                        className={`text-gray-400 px-4 py-3 flex flex-col justify-center h-full ${bgColor} rounded-2xl border ${borderColor}`}
                      >
                        <div className="text-slate-400 text-xs">
                          Total Properties
                        </div>
                        <div className="text-2xl font-bold animate-fade-in">
                          {totalNumberOfTransactions}
                        </div>
                        <div className="flex text-xs gap-2">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                            <span className="text-blue-400">37 Sold</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                            <span className="text-purple-400">77 Rented</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commission Claims */}
                <div className="commission-claims">
                  <CommissionClaimsCard progress={commissionProgress} />
                </div>

                {/* Yearly Sales Transactions */}
                <div className="yearly-sales">
                  <div className="dashboard-card">
                    <div className="p-4 pb-0">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold">
                          Yearly Sales Transactions
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-slate-400">
                        Monthly performance for 2023
                      </div>
                    </div>
                    <div className="p-4 pt-3">
                      <LineChartPulse data={yearlySalesData} height="h-56" />
                      <div className="flex justify-between text-sm pt-2">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 mr-2"></div>
                          <span>
                            Total:{" "}
                            {yearlySalesData.reduce(
                              (sum, item) => sum + item.value,
                              0
                            )}{" "}
                            Properties
                          </span>
                        </div>
                        <div className="text-green-400 font-medium">
                          +23% from previous year
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Transaction */}
                <div className="sales-transaction">
                  <div className="dashboard-card">
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-base font-semibold">
                          Sales Transaction
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-400">
                            Monthly Goal
                          </div>
                          <div className="text-sm font-medium">
                            {salesProgress}%
                          </div>
                        </div>
                        {renderSegments(salesProgress, 100)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                  <div className="dashboard-card h-full flex flex-col">
                    <div className="p-4 pb-2 border-b border-slate-800 flex-shrink-0">
                      <div className="flex justify-between items-center">
                        <div className="text-base font-semibold">
                          Recent Activity
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 pt-2 flex-grow flex flex-col">
                      <div className="recent-activity-items flex-grow">
                        <div className="grid grid-cols-1 gap-3">
                          {recentActivity.map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-center p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                              <Avatar className="h-8 w-8 mr-2.5 bg-slate-700">
                                <AvatarFallback className="text-[10px]">
                                  {activity.agent
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-sm">
                                <div className="font-medium">
                                  {activity.agent}
                                </div>
                                <div className="text-slate-400 mt-0.5">
                                  <span
                                    className={
                                      activity.action === "Sold"
                                        ? "text-green-400"
                                        : "text-blue-400"
                                    }
                                  >
                                    {activity.action}
                                  </span>{" "}
                                  {activity.property} • {activity.value}
                                </div>
                              </div>
                              <div className="text-slate-400 text-xs">
                                {activity.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-3 mt-auto flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-sm border-slate-700 hover:bg-slate-700/50"
                          onClick={() => setShowMoreActivity(true)}
                        >
                          View all activity
                          <ChevronDown size={14} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="upcoming-appointments">
                  <UpcomingAppointmentsCard />
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
