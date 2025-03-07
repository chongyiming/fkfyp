"use client";

import { useCharacterLimit } from "@/components/ui/use-character-limit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus } from "lucide-react";
import { useId, useState, useEffect, useRef } from "react";
import { Checkbox } from "./ui/checkbox";
import { supabase } from "../app/supabaseClient";
import { v4 as uuidv4 } from "uuid";

// Image upload hook with enhanced functionality
function useImageUpload(userId: string) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadToSupabase = async (file: File) => {
    try {
      setIsUploading(true);

      // Delete existing profile pictures
      const { data: existingFiles, error: listError } = await supabase.storage
        .from("test")
        .list(`pfp/${userId}/`);

      if (listError) throw listError;

      if (existingFiles && existingFiles.length > 0) {
        // Correctly construct file paths
        const filePaths = existingFiles.map(
          (file) => `pfp/${userId}/${file.name}` // Correct path format
        );

        // Delete existing files
        const { error: deleteError } = await supabase.storage
          .from("test")
          .remove(filePaths);

        if (deleteError) throw deleteError;
      }

      // Upload new profile picture
      const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9-.]/g, "")}`;
      const filePath = `pfp/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("test")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("test")
        .getPublicUrl(filePath);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error handling image upload:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create local preview
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Upload to Supabase
      await uploadToSupabase(file);
    } catch (error) {
      console.error("Error handling file change:", error);
      setPreviewUrl(null);
    }
  };

  return {
    previewUrl,
    isUploading,
    fileInputRef,
    handleFileChange,
  };
}

function Component({
  isOpen,
  onClose,
  images,
  username,
  firstName,
  lastName,
  ren,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  username: string;
  firstName: string;
  lastName: string;
  ren: boolean | "indeterminate";
}) {
  const id = useId();
  const [userId, setUserId] = useState("");
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);
  const [localUsername, setLocalUsername] = useState(username);
  const [isRenChecked, setIsRenChecked] = useState<boolean | "indeterminate">(
    ren
  );
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [agents, setAgents] = useState<{ user_id: string; username: string }[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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
    getAgents();
  }, []);

  useEffect(() => {
    setLocalFirstName(firstName);
    setLocalLastName(lastName);
    setLocalUsername(username);
    setIsRenChecked(ren);
  }, [firstName, lastName, username, ren]);

  async function getAgents() {
    // Fetch all agents
    const { data: agentsData, error: agentsError } = await supabase
      .from("Agents")
      .select("user_id, username");

    if (agentsError) {
      throw agentsError;
    }

    if (agentsData) {
      setAgents(agentsData);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { error: updateError } = await supabase
        .from("Agents")
        .update({
          first_name: localFirstName,
          last_name: localLastName,
          username: localUsername,
          ren: isRenChecked,
          referrer_id: referrerId,
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. Click the image to update your
          photo.
        </DialogDescription>
        <div className="overflow-y-auto">
          <Avatar userId={userId} defaultImage={images[0]} />
          <div className="px-6 pb-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-first-name`}>First name</Label>
                  <Input
                    id={`${id}-first-name`}
                    placeholder="First Name"
                    value={localFirstName}
                    onChange={(e) => setLocalFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-last-name`}>Last name</Label>
                  <Input
                    id={`${id}-last-name`}
                    placeholder="Last Name"
                    value={localLastName}
                    onChange={(e) => setLocalLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-username`}>Username</Label>
                <Input
                  id={`${id}-username`}
                  className="peer pe-9"
                  placeholder="Username"
                  value={localUsername}
                  onChange={(e) => setLocalUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-referrer`}>Referrer</Label>
                <div className="relative">
                  <Input
                    id={`${id}-referrer`}
                    className="peer pe-9"
                    placeholder="Search for a referrer"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsDropdownVisible(true)} // Show dropdown on focus
                    onBlur={() => setIsDropdownVisible(false)} // Hide dropdown on blur
                  />
                  {isDropdownVisible && ( // Only show dropdown when input is focused
                    <div className="absolute z-10 mt-2 w-full rounded-md border border-border bg-background shadow-lg max-h-60 overflow-y-auto">
                      {filteredAgents.map((agent) => (
                        <div
                          key={agent.user_id}
                          className="cursor-pointer px-4 py-2 hover:bg-muted"
                          onMouseDown={(e) => e.preventDefault()} // Prevent input blur on click
                          onClick={() => {
                            setReferrerId(agent.user_id);
                            setSearchTerm(agent.username);
                            setIsDropdownVisible(false); // Hide dropdown after selection
                          }}
                        >
                          {agent.username}
                        </div>
                      ))}
                      {filteredAgents.length === 0 && (
                        <div className="px-4 py-2 text-muted-foreground">
                          No agents found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-ren-checkbox`}
                    checked={isRenChecked}
                    onCheckedChange={(checked) => setIsRenChecked(checked)}
                    aria-label="REN"
                  />
                  <Label htmlFor={`${id}-ren-checkbox`}>REN</Label>
                </div>
              </div>
              <DialogFooter className="border-t border-border px-6 py-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Avatar({
  userId,
  defaultImage,
}: {
  userId: string;
  defaultImage?: string;
}) {
  const { previewUrl, isUploading, fileInputRef, handleFileChange } =
    useImageUpload(userId);
  const currentImage = previewUrl || defaultImage || "./profile.jpg";

  return (
    <div className="px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm shadow-black/10">
        <img
          src={currentImage}
          className="h-full w-full object-cover"
          width={80}
          height={80}
          alt="Profile image"
        />
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Change profile picture"
        >
          <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  );
}

export { Component };
