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
  } | null>(null);
  const defaultCards = [
    {
      icon: <Sparkles className="size-4 text-blue-300" />,
      title: "Featured",
      description: "Discover amazing content",
      date: "Just now",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Sparkles className="size-4 text-blue-300" />,
      title: "Popular",
      description: "Trending this week",
      date: "2 days ago",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className:
        "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Sparkles className="size-4 text-blue-300" />,
      title: "New",
      description: "Latest updates and features",
      date: "Today",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className:
        "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
  ];
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
  }, []);
  const ResultModal = () => (
    <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Prediction Results for {predictionResult?.fileName}
          </DialogTitle>
          {/* <DialogDescription>Analysis of the ECG data</DialogDescription> */}
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
          <div className="space-y-1"></div>
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

          const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData,
          });

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
          <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
            <div className="h-[calc(100vh-4rem)] overflow-auto pb-6">
              {/* CSS Grid Dashboard Layout */}
              {/* Welcome Message */}
              <div className="welcome">
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
              <div className="flex min-h-[400px] w-full items-center justify-center py-20">
                <div className="w-full max-w-3xl">
                  <DisplayCards cards={defaultCards} />
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
