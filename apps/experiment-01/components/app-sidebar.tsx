"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  RiScanLine,
  RiBardLine,
  RiUserFollowLine,
  RiCodeSSlashLine,
  RiLoginCircleLine,
  RiLayoutLeftLine,
  RiSettings3Line,
  RiLeafLine,
  RiLogoutBoxLine,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../app/supabaseClient";

// This is sample data.
const data = {
  teams: [
    // {
    //   name: "InnovaCraft",
    //   logo: "/logo-01.png",
    // },
    // {
    //   name: "Acme Corp.",
    //   logo: "/logo-01.png",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: "/logo-01.png",
    // },
  ],
  navMain: [
    {
      title: "Sections",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: RiScanLine,
        },
        // {
        //   title: "Insights",
        //   url: "#",
        //   icon: RiBardLine,
        // },
        {
          title: "Contacts",
          url: "/contact",
          icon: RiUserFollowLine,
        },
        // {
        //   title: "Tools",
        //   url: "#",
        //   icon: RiCodeSSlashLine,
        // },
        {
          title: "Manage Role",
          url: "/managerole",
          icon: RiLoginCircleLine,
        },
        {
          title: "Integration",
          url: "#",
          icon: RiLoginCircleLine,
        },
        // {
        //   title: "Layouts",
        //   url: "#",
        //   icon: RiLayoutLeftLine,
        // },
        {
          title: "Reports",
          url: "/reports",
          icon: RiLeafLine,
        },
      ],
    },
    {
      title: "Other",
      url: "#",
      items: [
        {
          title: "Settings",
          url: "#",
          icon: RiSettings3Line,
        },
        {
          title: "Help Center",
          url: "#",
          icon: RiLeafLine,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const handleSignOut = () => {
    router.push("/");
  };
  const [userId, setUserId] = useState("");
  const [perm, setPerm] = useState("");
  const [read,setRead] = useState(false)
  // console.log("Perm",perm)
  // console.log("Read",read)

  useEffect(() => {
    const authToken = localStorage.getItem(
      "sb-velfmvmemrzurdweumyo-auth-token"
    );
    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        setUserId(parsedToken?.user?.id);
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userId || perm) {
      getInfo(userId); // Call getInfo only when userId is set
      getPerm(perm);

    }
  }, [userId,perm]);

  async function getInfo(userId: string) {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from("Agents")
        .select("perm")
        .eq("user_id", userId)
        .single(); // Use .single() if you expect only one row

      if (agentError) {
        throw new Error(agentError.message);
      }

      // Set the form fields with the fetched data
      if (agentData) {

        setPerm(agentData.perm)
        
      }

      console.log("Agent data fetched successfully:", agentData);
      return agentData;
    } catch (error) {
      console.error("Error fetching agent info:", error);
      throw error;
    }
  }

  async function getPerm(perm: string) {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from("Permissions")
        .select("read")
        .eq("id", perm)
        .single(); // Use .single() if you expect only one row



      // Set the form fields with the fetched data
      if (agentData) {

        setRead(agentData.read)
        
      }

      console.log("Agent data fetched successfully:", agentData);
      return agentData;
    } catch (error) {
      console.error("Error fetching agent info:", error);
      throw error;
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <div className="flex justify-center items-center my-4">
          Your Logo
          {/* <img
            src="/path/to/your/logo.png" // Replace with the path to your logo
            alt="Your Logo"
            className="h-10 w-10" // Adjust the size as needed
          /> */}
        </div>
        <hr className="border-t border-border mx-2 -mt-px" />

        <SearchForm className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/60">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button font-medium gap-3 h-9 rounded-lg bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
                      isActive={item.url === pathname}
                    >
                      <Link href={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <hr className="border-t border-border mx-2 -mt-px" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-medium gap-3 h-9 rounded-lg bg-gradient-to-r hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto"
              onClick={handleSignOut}
            >
              <RiLogoutBoxLine
                className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                size={22}
                aria-hidden="true"
              />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
