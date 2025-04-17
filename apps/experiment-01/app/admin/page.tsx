"use client";
import React from "react";
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
  CheckSquare,
  Square,
} from "lucide-react";
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
import { RiHome2Line, RiScanLine } from "@remixicon/react";
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
import { supabase } from "../supabaseClient";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import DisplayCards from "@/components/display-cards";
import { Sparkles } from "lucide-react";
import styles from "./styles.module.scss";
import { get } from "http";
import ECGChartDisplay from "@/components/zoomable-linecharts";
import dynamic from "next/dynamic";

// Define TypeScript interfaces for our data
interface ECGData {
  fileName: string;
  norm_prob: number;
  mi_prob: number;
  confidence: number;
  prediction: number;
  ecg_data: number[][];
}

interface HistoryItem {
  created_at: string;
  norm_prob: number;
  mi_prob: number;
  class: string;
  file: string;
  ecg_data: number[][];
  email?: string;
}

const Homepage = () => {
  const [email, setEmail] = useState("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [predictionResult, setPredictionResult] = useState<ECGData | null>(
    null
  );
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<ECGData | null>(
    null
  );
  const [activeModalData, setActiveModalData] = useState<ECGData | null>(null);

  const ECGChartDisplayComponent = dynamic(
    () => import("@/components/zoomable-linecharts"),
    {
      ssr: false,
      loading: () => <div>Loading ECG charts...</div>,
    }
  );

  useEffect(() => {
    const authToken = localStorage.getItem(
      "sb-onroqajvamgdrnrjnzzu-auth-token"
    );
    if (!authToken) {
      console.error("User not authenticated");
      return;
    }

    const { user } = JSON.parse(authToken);
    setEmail(user.email);
    getHistory(user.email);
  }, []);

  async function getHistory(email: string) {
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Parse the ECG data from string to JSON for each history item
    const parsedData = data.map((item: any) => ({
      ...item,
      ecg_data: item.ecg_data ? JSON.parse(item.ecg_data) : [],
    }));

    console.log("history", parsedData);
    setHistory(parsedData);
  }

  const handleViewHistoryItem = (item: HistoryItem) => {
    const historyItemData: ECGData = {
      fileName: item.file.split("/").pop() || "Unknown file",
      norm_prob: item.norm_prob,
      mi_prob: item.mi_prob,
      confidence: Math.max(item.norm_prob, item.mi_prob),
      prediction: item.class === "NORM" ? 0 : 1,
      ecg_data: item.ecg_data,
    };

    setViewingHistoryItem(historyItemData);
    setActiveModalData(historyItemData);
    setIsResultModalOpen(true);
  };

  const ResultModal = () => {
    const dataToDisplay = activeModalData;

    // State for selected leads
    const [selectedLeads, setSelectedLeads] = useState<number[]>(
      Array.from({ length: 12 }, (_, i) => i)
    ); // Default all leads selected

    // Lead names for display
    const leadNames = [
      "I",
      "II",
      "III",
      "aVR",
      "aVL",
      "aVF",
      "V1",
      "V2",
      "V3",
      "V4",
      "V5",
      "V6",
    ];

    const toggleLead = (leadIndex: number) => {
      if (selectedLeads.includes(leadIndex)) {
        // Don't allow deselecting all leads
        if (selectedLeads.length > 1) {
          setSelectedLeads(selectedLeads.filter((i) => i !== leadIndex));
        }
      } else {
        setSelectedLeads([...selectedLeads, leadIndex]);
      }
    };

    if (!dataToDisplay) return null;

    return (
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>ECG Results for {dataToDisplay.fileName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Normal Probability</p>
                <div className="flex items-center gap-2">
                  <Progress value={dataToDisplay.norm_prob} className="h-2" />
                  <span className="text-sm text-muted-foreground">
                    {dataToDisplay.norm_prob}%
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">MI Probability</p>
                <div className="flex items-center gap-2">
                  <Progress value={dataToDisplay.mi_prob} className="h-2" />
                  <span className="text-sm text-muted-foreground">
                    {dataToDisplay.mi_prob}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Prediction</p>
              <p
                className={`text-sm font-semibold ${
                  dataToDisplay.prediction === 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {dataToDisplay.prediction === 0
                  ? "Normal"
                  : "Myocardial Infarction"}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                Select Leads to Display
              </h3>
              <div className="flex flex-wrap gap-2">
                {leadNames.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => toggleLead(index)}
                  >
                    {selectedLeads.includes(index) ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                    <label className="text-sm font-medium leading-none cursor-pointer">
                      {name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* ECG Display Section */}
            {dataToDisplay.ecg_data && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">12-Lead ECG</h3>
                <ECGChartDisplayComponent
                  ecgData={dataToDisplay.ecg_data}
                  sampleRate={100}
                  leadLabels={leadNames}
                  visibleLeads={selectedLeads}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    email && (
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
                        <RiHome2Line size={22} aria-hidden="true" />
                        <span className="sr-only">Homepage</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Homepage</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6 relative">
            <div className="h-[calc(100vh-4rem)] overflow-auto pb-6">
              {/* CSS Grid Dashboard Layout */}

              <div className={styles.parent}>
                <h1>Record</h1>
                <div className={styles.mainContent}>
                  <div>
                    <div className={styles.cardList}>
                      {history ? (
                        history.length > 0 ? (
                          history.map((item, index) => (
                            <div
                              key={index}
                              className={`${styles.card} ${item.class === "NORM" ? styles.normal : styles.abnormal}`}
                              onClick={() => handleViewHistoryItem(item)}
                              style={{ cursor: "pointer" }} // Add pointer cursor to indicate clickable
                            >
                              <div className={styles.cardHeader}>
                                <div className={styles.statusIndicator}>
                                  {item.class === "NORM" ? (
                                    <CheckCircle
                                      className={styles.successIcon}
                                      size={18}
                                    />
                                  ) : (
                                    <X className={styles.errorIcon} size={18} />
                                  )}
                                  <span>{item.class}</span>
                                </div>
                                <span className={styles.date}>
                                  <CalendarDays
                                    size={14}
                                    className={styles.icon}
                                  />
                                  {new Date(
                                    item.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              <div className={styles.probabilityRow}>
                                {/* Normal Probability Ring */}
                                <div className={styles.probabilityRing}>
                                  <div className={styles.ringContainer}>
                                    <div className={styles.ringBackground} />
                                    <div
                                      className={styles.ringFill}
                                      style={{
                                        borderColor: "#10B981", // green for normal
                                        clipPath: `polygon(0 0, 100% 0, 100% ${item.norm_prob}%, 0 ${item.norm_prob}%)`,
                                      }}
                                    />
                                    <div className={styles.ringCenter}>
                                      <span className={styles.ringValue}>
                                        {item.norm_prob.toFixed(0)}%
                                      </span>
                                      <span className={styles.ringLabel}>
                                        Normal
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* MI Probability Ring */}
                                <div className={styles.probabilityRing}>
                                  <div className={styles.ringContainer}>
                                    <div className={styles.ringBackground} />
                                    <div
                                      className={styles.ringFill}
                                      style={{
                                        borderColor: "#EF4444", // red for MI
                                        clipPath: `polygon(0 0, 100% 0, 100% ${item.mi_prob}%, 0 ${item.mi_prob}%)`,
                                      }}
                                    />
                                    <div className={styles.ringCenter}>
                                      <span className={styles.ringValue}>
                                        {item.mi_prob.toFixed(0)}%
                                      </span>
                                      <span className={styles.ringLabel}>
                                        MI
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={styles.time}>
                                <div className={styles.clockTime}>
                                  <Clock size={14} className={styles.icon} />
                                  {new Date(
                                    item.created_at
                                  ).toLocaleTimeString()}
                                </div>
                                <p>
                                  <strong>File:</strong>{" "}
                                  {item.file.split("/").pop()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.emptyState}>
                            <FileText size={32} className={styles.emptyIcon} />
                            <h2>No history found</h2>
                            <p>Upload your first ECG to see results here</p>
                          </div>
                        )
                      ) : (
                        <div className={styles.loadingState}>
                          <div className={styles.spinner}></div>
                          <h2>Loading your history</h2>
                          <p>Please wait while we load your data</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
        <ResultModal />
      </SidebarProvider>
    )
  );
};

export default Homepage;
