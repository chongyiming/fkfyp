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

const Homepage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [email, setEmail] = useState("");
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

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("No files selected!");
      return;
    }

    setIsUploading(true);

    // Get user email from local storage
    const authToken = localStorage.getItem(
      "sb-onroqajvamgdrnrjnzzu-auth-token"
    );
    if (!authToken) {
      console.error("User not authenticated");
      setIsUploading(false);
      return;
    }

    const { user } = JSON.parse(authToken);
    const userEmail = user.email;

    try {
      // Upload files to Supabase Storage
      for (const file of files) {
        // Sanitize the file name
        const sanitizedFileName = file.name
          .replace(/\s+/g, "_") // Replace spaces with underscores
          .replace(/[^a-zA-Z0-9_.-]/g, ""); // Remove special characters

        const filePath = `${userEmail}/${Date.now()}_${sanitizedFileName}`; // Use sanitized file name
        const { data, error } = await supabase.storage
          .from("file") // Replace with your bucket name
          .upload(filePath, file);

        if (error) {
          console.error("Error uploading file:", error);
        } else {
          console.log("File uploaded successfully:", data);
        }
      }

      setUploadSuccess(true);
      setFiles([]); // Clear selected files after upload
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
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
                    Files uploaded successfully!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Homepage;
