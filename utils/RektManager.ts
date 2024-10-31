import supabase from "../database/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import { RektData } from "./types";

export class RektManager {
  private channel: RealtimeChannel | null = null;
  private symbol: string;
  private onRekt: (data: RektData) => void;
  private onError: (error: Error) => void;
  private onClose: () => void;
  private onOpen: () => void;

  constructor(
    symbol: string,
    onRekt: (data: RektData) => void,
    onError: (error: Error) => void,
    onClose: () => void,
    onOpen: () => void
  ) {
    this.symbol = symbol;
    this.onRekt = onRekt;
    this.onError = onError;
    this.onClose = onClose;
    this.onOpen = onOpen;
  }

  connect() {
    if (this.channel) {
      this.disconnect();
    }

    this.channel = supabase
      .channel("custom-insert-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: `${this.symbol
            .toLowerCase()
            .replace(/-/g, "")}_liquidation_data`,
        },
        (payload) => {
          const data = payload.new as RektData;
          data.symbol = this.symbol;
          this.onRekt(data);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Rekt WebSocket connected for ${this.symbol}`);
          this.onOpen();
        } else if (status === "CLOSED") {
          console.log(`Rekt WebSocket closed for ${this.symbol}`);
          this.onClose();
        } else if (status === "CHANNEL_ERROR") {
          console.error(`Rekt WebSocket error for ${this.symbol}`);
          this.onError(new Error("Channel error"));
        }
      });
  }

  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }

  getSymbol() {
    return this.symbol;
  }

  isConnected() {
    return this.channel !== null;
  }
}
