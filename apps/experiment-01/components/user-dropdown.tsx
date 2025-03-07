"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "../app/supabaseClient";
import { RiSettingsLine, RiTeamLine, RiLogoutBoxLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Component } from "./Component"; // Import the Component

export default function UserDropdown() {
  const router = useRouter();
  const [gmail, setGmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ren, setRen] = useState<boolean | "indeterminate">(false);
  const [userId, setUserId] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleSignOut = () => {
    // Add any sign out logic here (e.g., clearing tokens, cookies, etc.)

    // Redirect to home page
    router.push("/");
  };

  useEffect(() => {
    const authToken = localStorage.getItem(
      "sb-velfmvmemrzurdweumyo-auth-token"
    );

    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        const userId = parsedToken?.user?.id;
        setGmail(parsedToken?.user?.email);
        setUserId(parsedToken?.user?.id);
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    } else {
      console.error("Auth token not found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      getImage(userId);
      getInfo(userId); // Call getInfo only when userId is set
    }
  }, [userId]);

  async function getInfo(userId: string) {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from("Agents")
        .select("username, first_name, last_name, ren")
        .eq("user_id", userId)
        .single(); // Use .single() if you expect only one row

      if (agentError) {
        throw new Error(agentError.message);
      }

      // Set the form fields with the fetched data
      if (agentData) {
        setUsername(agentData.username || "");
        setFirstName(agentData.first_name || "");
        setLastName(agentData.last_name || "");
        setRen(agentData.ren ?? false);
      }

      console.log("Agent data fetched successfully:", agentData);
      return agentData;
    } catch (error) {
      console.error("Error fetching agent info:", error);
      throw error;
    }
  }

  async function getImage(userId: string) {
    const path = `pfp/${userId}/`;

    const { data, error } = await supabase.storage.from("test").list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      setImages([]);
      return;
    }

    if (data && data.length > 0) {
      const validFiles = data.slice(0, 1); // Take the first file
      const imageUrls = validFiles.map(
        (file) =>
          supabase.storage.from("test").getPublicUrl(`${path}${file.name}`).data
            .publicUrl
      );
      setImages(imageUrls);
    } else {
      setImages([]);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
            <Avatar className="size-8">
              <AvatarImage
                src={images.length > 0 ? images[0] : "./profile.jpg"} // Use the first image URL or a fallback
                width={32}
                height={32}
                alt="Profile image"
              />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-64" align="end">
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {username}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {gmail}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
              <RiSettingsLine
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Account settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <RiLogoutBoxLine
              size={16}
              className="opacity-60"
              aria-hidden="true"
            />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render the Component dialog */}
      <Component
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        images={images}
        username={username}
        firstName={firstName}
        lastName={lastName}
        ren={ren}
      />
    </>
  );
}
