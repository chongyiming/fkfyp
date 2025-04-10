"use client";
import { useId, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "./supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const getBaseUrl = () => {
    // Check if running in the browser
    if (typeof window !== "undefined") {
      return window.location.origin; // Returns the current origin (e.g., http://localhost:3000 or https://your-vercel-app.vercel.app)
    }

    // Check if running on Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`; // Returns the Vercel deployment URL
    }

    // Default to localhost for development
    return "http://localhost:3002";
  };

  useEffect(() => {
    const authToken = localStorage.getItem(
      "sb-onroqajvamgdrnrjnzzu-auth-token"
    );
    if (!authToken) {
      console.log("User not authenticated");
      setIsLoading(true);
      return;
    }
    router.push("/homepage");
  }, []);
  // Validate email and password
  const validateInputs = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  // Create account and insert into Permissions table
  const handleCreateAccount = async () => {
    if (!validateInputs()) return;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Set success message
      setSuccessMessage("Please check your email to verify your account.");
      setError(""); // Clear any previous error
    } catch (error) {
      console.error("Error creating account:", error);
      setError("An error occurred while creating the account.");
      setSuccessMessage(""); // Clear any previous success message
    }
  };

  // Sign in with email and password
  const handleSignIn = async () => {
    if (!validateInputs()) return;

    try {
      // Authenticate user
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      console.log("Sign in successful:", authData);

      router.push("/homepage");
    } catch (error) {
      console.error("Error signing in:", error);
      setError("An error occurred while signing in.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getBaseUrl()}/reset-password`, // Dynamically set the redirect URL
      });

      if (error) {
        setError(error.message);
      } else {
        setError("Password reset email sent. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error sending reset password email:", error);
      setError("An error occurred while sending the reset password email.");
    }
  };
  return (
    isLoading && (
      <Dialog open={true}>
        <DialogContent>
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
              aria-hidden="true"
            >
              <svg
                className="stroke-zinc-800 dark:stroke-zinc-100"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
              </svg>
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
              <DialogDescription className="sm:text-center">
                Enter your credentials to login to your account.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${id}-email`}>Email</Label>
                <Input
                  id={`${id}-email`}
                  placeholder="Enter your gmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-password`}>Password</Label>
                <Input
                  id={`${id}-password`}
                  placeholder="Enter your password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-between gap-2">
              <a
                className="text-sm underline hover:no-underline"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}
              >
                Forgot password?
              </a>
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            <span className="text-xs text-muted-foreground">Or</span>
          </div>

          <div>
            {/* Success message */}
            {successMessage && (
              <p style={{ color: "green" }}>{successMessage}</p>
            )}

            {/* Create account button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCreateAccount}
            >
              Create an account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
}
