/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Bell } from "lucide-react";
import supabase from "../database/supabaseClient";

export default function NotificationForm() {
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("alerts")
        .insert([{ email, threshold }]);

      if (error) {
        throw error;
      }

      console.log("Alert set for", email, "at threshold", threshold);
      setEmail("");
      setThreshold("");
    } catch (error) {
      // setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-300">
          Alerts
        </CardTitle>
        <CardDescription className="text-gray-300">
          Set up email notifications for significant rekt events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSetAlert} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="bg-gray-700 border-gray-600 text-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="threshold" className="text-gray-300">
              Rekt Threshold ($)
            </Label>
            <Input
              id="threshold"
              type="number"
              placeholder="Enter threshold amount"
              className="bg-gray-700 border-gray-600 text-gray-300"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full text-gray-300"
            disabled={loading}
          >
            {loading ? "Setting Alert..." : "Set Alert"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
