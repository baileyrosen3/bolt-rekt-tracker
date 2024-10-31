"use client";

import { useState } from "react";
import { supabase } from "@/app/supabaseClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowRight, AtSign, Lock } from "lucide-react";
import { FaGoogle, FaApple, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { bclogo } from "../assets";

type AuthFormProps = {
  mode: "login" | "signup";
  onModeChange: (mode: "login" | "signup") => void;
};

export function AuthFormComponent({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) console.error("Error logging in:", error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) console.error("Error signing up:", error.message);
    }
  };

  const signInWithProvider = async (
    provider: "google" | "apple" | "twitter"
  ) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) console.error("Error signing in:", error.message);
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Image
          src={bclogo}
          alt="RektTracker Logo"
          width={60}
          height={60}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-white mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-gray-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account yet?{" "}
              <button
                onClick={() => onModeChange("signup")}
                className="text-blue-500 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => onModeChange("login")}
                className="text-blue-500 hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <div className="relative">
            <AtSign
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={18}
            />
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          {mode === "login" ? "Log in" : "Sign up"}
          <ArrowRight className="ml-2" size={18} />
        </Button>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={() => signInWithProvider("apple")}
          >
            <FaApple className="w-5 h-5" />
            <span className="sr-only">Sign in with Apple</span>
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={() => signInWithProvider("google")}
          >
            <FaGoogle className="w-5 h-5" />
            <span className="sr-only">Sign in with Google</span>
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={() => signInWithProvider("twitter")}
          >
            <FaTwitter className="w-5 h-5" />
            <span className="sr-only">Sign in with Twitter</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
