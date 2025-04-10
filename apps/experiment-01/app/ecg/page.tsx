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
import { RiScanLine, RiBardLine } from "@remixicon/react";
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
function page() {
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
                      <RiBardLine size={22} aria-hidden="true" />
                      <span className="sr-only">ECG Chart</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>ECG Chart</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default page;
