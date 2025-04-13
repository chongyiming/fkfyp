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
import { supabase } from "../supabaseClient";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import DisplayCards from "@/components/display-cards";
import { Sparkles } from "lucide-react";
import styles from "./styles.module.scss";
import { get } from "http";
import ECGChartDisplay from "@/components/zoomable-linecharts";
import dynamic from "next/dynamic";

const Homepage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    fileName: string;
    norm_prob: number;
    mi_prob: number;
    confidence: number;
    prediction: number;
    ecg_data: Array<Array<number>>;
  } | null>(null);
  const [history, setHistory] = useState<Array<{
    created_at: string;
    norm_prob: number;
    mi_prob: number;
    class: string;
    file: string;
  }> | null>(null);
  // Greeting based on time of day
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }

  const bgColor = isDarkMode ? "bg-[#121212]" : "bg-white";
  const borderColor = isDarkMode ? "border-gray-800" : "border-gray-200";
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const gridColor = isDarkMode ? "#333" : "#e5e7eb";
  const labelColor = isDarkMode ? "#888" : "#666";
  const [files, setFiles] = useState<File[]>([]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const ECGChartDisplay = dynamic(
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

  async function getHistory(email: any) {
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    console.log("history", data);
    setHistory(data);
  }

  const ResultModal = () => (
    <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Prediction Results for {predictionResult?.fileName}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Normal Probability</p>
              <div className="flex items-center gap-2">
                <Progress value={predictionResult?.norm_prob} className="h-2" />
                <span className="text-sm text-muted-foreground">
                  {predictionResult?.norm_prob}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">MI Probability</p>
              <div className="flex items-center gap-2">
                <Progress value={predictionResult?.mi_prob} className="h-2" />
                <span className="text-sm text-muted-foreground">
                  {predictionResult?.mi_prob}%
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Prediction</p>
            <p
              className={`text-sm font-semibold ${
                predictionResult?.prediction === 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {predictionResult?.prediction === 0
                ? "Normal"
                : "Myocardial Infarction"}
            </p>
          </div>

          {/* ECG Display Section */}
          {predictionResult?.ecg_data && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">12-Lead ECG</h3>
              <ECGChartDisplay
                ecgData={predictionResult.ecg_data}
                sampleRate={100}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
  const handleUpload = async () => {
    if (files.length === 0) {
      alert("No files selected!");
      return;
    }

    setIsUploading(true);

    // Check if any file is not a .dat file
    const invalidFiles = files.filter((file) => !file.name.endsWith(".dat"));
    if (invalidFiles.length > 0) {
      alert("Error: Please upload .dat file");
      setIsUploading(false);
      setUploadSuccess(false);

      return;
    } else if (files.length > 1) {
      alert("Please only upload one file");
      setIsUploading(false);
      setUploadSuccess(false);
      return;
    }

    // Get user email from local storage
    const authToken = localStorage.getItem(
      "sb-onroqajvamgdrnrjnzzu-auth-token"
    );
    if (!authToken) {
      alert("Error: User not authenticated");
      setIsUploading(false);
      return;
    }

    const { user } = JSON.parse(authToken);
    const userEmail = user.email;

    try {
      const currentDate = new Date();
      const folderName = currentDate.toISOString().replace(/[:.]/g, "-");
      const basePath = `${userEmail}/ECG/${folderName}/`;

      for (const file of files) {
        const sanitizedFileName = file.name
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_.-]/g, "");

        const filePath = `${basePath}${sanitizedFileName}`;
        const { data, error } = await supabase.storage
          .from("file")
          .upload(filePath, file);

        if (error) {
          alert(`Error uploading file ${file.name}: ${error.message}`);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(
            "https://test-485822052532.asia-southeast1.run.app/predict",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
          }

          const result = await response.json();
          console.log("Prediction result:", result);

          // Show success popup with formatted results
          // Replace the success alert in handleUpload with:
          setPredictionResult({
            fileName: file.name,
            norm_prob: result.norm_prob,
            mi_prob: result.mi_prob,
            confidence: result.confidence,
            prediction: result.prediction,
            ecg_data: result.ecg_data,
          });
          const { error: insertError } = await supabase.from("history").insert({
            email: userEmail,
            file: filePath,
            norm_prob: result.norm_prob,
            mi_prob: result.mi_prob,
            class: result.prediction === 0 ? "NORM" : "MI",
          });
          if (insertError) {
            console.error("Error inserting into history:", insertError);
            // Handle the error appropriately
          }
          setIsResultModalOpen(true);
        } catch (apiError) {
          alert(`Error processing ${file.name}: ${apiError}`);
        }
      }

      setUploadSuccess(true);
      setFiles([]);
    } catch (error) {
      alert(`Upload failed: ${error}`);
    } finally {
      setIsUploading(false);
      getHistory(email);
    }
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
                        <RiScanLine size={22} aria-hidden="true" />
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
              {/* Welcome Message - Now with fixed positioning */}
              <div className="welcome sticky top-0 z-10 mb-4">
                <div
                  className={`dashboard-card ${bgColor} rounded-2xl border ${borderColor} p-8 shadow-lg`}
                >
                  {/* Full-width greeting message */}
                  <div className="w-full">
                    <h2 className={`text-xl font-semibold ${textColor}`}>
                      {greeting}, {email}
                    </h2>
                  </div>

                  {/* File upload section moved below */}
                  <div className="mt-6 border-2 border-dashed border-muted p-6 rounded-lg text-center">
                    <Input
                      type="file"
                      id="documents"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      required
                      accept=".dat"
                    />
                    <label
                      htmlFor="documents"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <FileUp className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload ECG data
                      </span>
                    </label>
                    {files.length > 0 && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        {files.length} file(s) selected
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || files.length === 0}
                    className="mt-4 w-full"
                  >
                    {isUploading ? "Uploading..." : "Save files"}
                  </Button>

                  {/* Upload success message */}
                  {uploadSuccess && (
                    <div className="mt-4 text-sm text-green-500">
                      File & Result saved successfully!
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.parent}>
                <h1>History</h1>
                <div className={styles.mainContent}>
                  <div>
                    <div className={styles.cardList}>
                      {history ? (
                        history.length > 0 ? (
                          history.map((item, index) => (
                            <div
                              key={index}
                              className={`${styles.card} ${item.class === "NORM" ? styles.normal : styles.abnormal}`}
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
                                <div className={styles.probabilityItem}>
                                  <div className={styles.probabilityLabel}>
                                    <TrendingUp
                                      size={14}
                                      className={styles.icon}
                                    />
                                    <span>Normal</span>
                                  </div>
                                  <div className={styles.probabilityValue}>
                                    {item.norm_prob.toFixed(2)}%
                                  </div>
                                  <Progress
                                    value={item.norm_prob}
                                    className={`${styles.progressBar} ${styles.normalProgress}`}
                                  />
                                </div>

                                <div className={styles.probabilityItem}>
                                  <div className={styles.probabilityLabel}>
                                    <TrendingUp
                                      size={14}
                                      className={styles.icon}
                                    />
                                    <span>MI</span>
                                  </div>
                                  <div className={styles.probabilityValue}>
                                    {item.mi_prob.toFixed(2)}%
                                  </div>
                                  <Progress
                                    value={item.mi_prob}
                                    className={`${styles.progressBar} ${styles.abnormalProgress}`}
                                  />
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
