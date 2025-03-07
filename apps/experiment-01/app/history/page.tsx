"use client";
import { useEffect, useState } from "react";
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
import { supabase } from "../supabaseClient";
import { Button } from "@/components/ui/button"; // Import Button component

// Define the FileObject type
type FileObject = {
  name: string;
  created_at: string;
  publicUrl: string; // Add publicUrl to the type
};

export default function Page() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      // Get user email from local storage
      const authToken = localStorage.getItem(
        "sb-onroqajvamgdrnrjnzzu-auth-token"
      );
      if (!authToken) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      const { user } = JSON.parse(authToken);
      const userEmail = user.email;

      try {
        // Fetch files from Supabase Storage
        const { data, error } = await supabase.storage
          .from("file")
          .list(userEmail, {
            sortBy: { column: "created_at", order: "desc" }, // Sort by newest first
          });

        if (error) {
          console.error("Error fetching files:", error);
        } else {
          // Generate public URLs for each file
          const filesWithUrls = data.map((file) => {
            const publicUrl = supabase.storage
              .from("file")
              .getPublicUrl(`${userEmail}/${file.name}`).data.publicUrl;

            return {
              ...file,
              publicUrl, // Add publicUrl to the file object
            };
          });

          setFiles(filesWithUrls as FileObject[]);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
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
                  <BreadcrumbPage>History</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
