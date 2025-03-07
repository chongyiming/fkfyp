"use client";
import { useState } from "react";
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

const data = [
  { date: "Jan 2024", sales: 3, rentals: 2 },
  { date: "Feb 2024", sales: 4, rentals: 3 },
  { date: "Mar 2024", sales: 2, rentals: 4 },
  { date: "Apr 2024", sales: 5, rentals: 2 },
  { date: "May 2024", sales: 3, rentals: 5 },
  { date: "Jun 2024", sales: 4, rentals: 3 },
  { date: "Jul 2024", sales: 6, rentals: 4 },
  { date: "Aug 2024", sales: 3, rentals: 3 },
  { date: "Sep 2024", sales: 5, rentals: 4 },
  { date: "Oct 2024", sales: 4, rentals: 3 },
  { date: "Nov 2024", sales: 3, rentals: 5 },
  { date: "Dec 2024", sales: 4, rentals: 4 },
];

const commissionData = [
  { month: "Jan", actual: 45000, target: 40000 },
  { month: "Feb", actual: 52000, target: 40000 },
  { month: "Mar", actual: 38000, target: 40000 },
  { month: "Apr", actual: 65000, target: 45000 },
  { month: "May", actual: 48000, target: 45000 },
  { month: "Jun", actual: 55000, target: 45000 },
  { month: "Jul", actual: 72000, target: 50000 },
  { month: "Aug", actual: 44000, target: 50000 },
  { month: "Sep", actual: 68000, target: 50000 },
  { month: "Oct", actual: 51000, target: 55000 },
  { month: "Nov", actual: 49000, target: 55000 },
  { month: "Dec", actual: 58000, target: 55000 },
];

const cards = [
  {
    title: "Average Deal Size",
    value: "$485K",
    change: "+12.3% vs last month",
  },
  {
    title: "Conversion Rate",
    value: "75%",
    change: "+5% vs last month",
  },
  {
    title: "Client Satisfaction",
    value: "4.7",
    ratings: [4.8, 4.2, 4.5, 4.9, 4.7],
  },
];

const recentEvents = [
  {
    agent: "Sarah Chen",
    action: "SOLD" as const,
    property: "Oceanview Mansion",
    price: "$2.4M",
    timestamp: "2h",
    avatar: "/avatar-chen.jpg",
  },
  {
    agent: "Michael Rodriguez",
    action: "RENT" as const,
    property: "Downtown Penthouse",
    price: "$8.5K/mo",
    timestamp: "4h",
    avatar: "/avatar-rodriguez.jpg",
  },
  {
    agent: "Emily Wong",
    action: "SOLD" as const,
    property: "Suburban Villa",
    price: "$950K",
    timestamp: "1d",
    avatar: "/avatar-wong.jpg",
  },
  {
    agent: "David Kim",
    action: "RENT" as const,
    property: "Lake House Estate",
    price: "$12K/mo",
    timestamp: "1d",
    avatar: "/avatar-kim.jpg",
  },
];

const Reports = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showMarketTypeDialog, setShowMarketTypeDialog] = useState(false);
  const [selectedMarketType, setSelectedMarketType] = useState<
    "primary" | "secondary" | null
  >(null);
  const [pinnedCards, setPinnedCards] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
                      <span className="sr-only">Reports</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Reports</BreadcrumbPage>
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content (Charts and Metrics) */}
              <div className="lg:col-span-3 space-y-8">
                {/* Key Metrics Section */}
                <div
                  className={`${bgColor} rounded-2xl border ${borderColor} p-8 shadow-lg`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-semibold ${textColor}`}>
                      Key Metrics
                    </h2>
                    <Button onClick={handleNewTransaction}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Sales
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                      <div key={index}>
                        <MetricCard
                          {...card}
                          isPinned={pinnedCards.includes(index)}
                          onPin={() => togglePin(index)}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts Section */}
                <div
                  className={`${bgColor} rounded-2xl border ${borderColor} p-8 shadow-lg`}
                >
                  <div className="space-y-12">
                    {/* Monthly Performance Chart */}
                    <div>
                      <div className="flex flex-col md:flex-row justify-between mb-6">
                        <div>
                          <h2 className={`text-xl font-semibold ${textColor}`}>
                            Monthly Performance
                          </h2>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Properties Sold and Rented
                          </p>
                        </div>
                        <div className="text-sm font-medium mt-4 md:mt-0">
                          <span className="inline-flex items-center mr-4">
                            <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                            <span className={textColor}>Sales</span>
                          </span>
                          <span className="inline-flex items-center">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 mr-2"></span>
                            <span className={textColor}>Rentals</span>
                          </span>
                        </div>
                      </div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data} margin={{ left: 10 }}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={gridColor}
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              stroke={labelColor}
                              tickLine={false}
                              axisLine={{ stroke: gridColor }}
                            />
                            <YAxis
                              stroke={labelColor}
                              tickLine={false}
                              axisLine={{ stroke: gridColor }}
                              label={{
                                value: "Number of Properties",
                                angle: -90,
                                position: "insideLeft",
                                offset: 0, // Adjust Y-axis label position
                                style: {
                                  fill: labelColor,
                                  textAnchor: "middle",
                                },
                              }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="sales" stackId="a" fill="#60a5fa" />
                            <Bar dataKey="rentals" stackId="a" fill="#34d399" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Commission Performance Chart */}
                    <div>
                      <div className="flex flex-col md:flex-row justify-between mb-6">
                        <div>
                          <h2 className={`text-xl font-semibold ${textColor}`}>
                            Commission Performance
                          </h2>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Actual vs Target ($)
                          </p>
                        </div>
                        <div className="text-sm font-medium mt-4 md:mt-0">
                          <span className="inline-flex items-center mr-4">
                            <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                            <span className={textColor}>Actual Commission</span>
                          </span>
                          <span className="inline-flex items-center">
                            <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                            <span className={textColor}>Target</span>
                          </span>
                        </div>
                      </div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={commissionData}
                            margin={{ left: 10 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke={gridColor}
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              stroke={labelColor}
                              tickLine={false}
                              axisLine={{ stroke: gridColor }}
                            />
                            <YAxis
                              stroke={labelColor}
                              tickLine={false}
                              axisLine={{ stroke: gridColor }}
                              tickFormatter={(value) => `$${value / 1000}k`}
                              label={{
                                value: "Commission Amount ($)",
                                angle: -90,
                                position: "insideLeft",
                                offset: 0, // Adjust Y-axis label position
                                style: {
                                  fill: labelColor,
                                  textAnchor: "middle",
                                },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isDarkMode
                                  ? "#1f1f1f"
                                  : "#fff",
                                borderColor: gridColor,
                              }}
                              formatter={(value: number) => [
                                `$${value.toLocaleString()}`,
                                "",
                              ]}
                              labelStyle={{
                                color: isDarkMode ? "#fff" : "#000",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="actual"
                              name="Actual Commission"
                              stroke="#c084fc"
                              strokeWidth={2}
                              dot={{ fill: "#c084fc" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="target"
                              name="Target"
                              stroke="#9ca3af"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events Section */}
              <div className="lg:col-span-1">
                <div
                  className={`${bgColor} rounded-2xl border ${borderColor} p-8 shadow-lg`}
                >
                  <h2 className={`text-xl font-semibold mb-6 ${textColor}`}>
                    Recent Events
                  </h2>
                  <RecentEvents events={recentEvents} isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Reports;
