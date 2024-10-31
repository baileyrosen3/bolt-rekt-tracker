import WebSocket from "ws";
import { randomUUID } from "crypto";

const MAX_RETRIES = 3;

/**
 * Class to handle WebSocket connections to Huobi
 */
export class RektWebsocketClientA {
  /**
   * Constructor for the HuobiWebSocketClient class
   * @param {Object} config - Configuration object
   * @param {string} config.symbol - The symbol to subscribe to
   * @param {string} [config.path='/linear-swap-notification'] - The path for the WebSocket connection
   * @param {number} [config.retries=3] - The number of retries to attempt if the connection fails
   * @returns {KlineWebsocketClient} A new instance of the KlineWebsocketClient class
   */
  constructor({ supabase, symbol, interval, limit }) {
    this.supabase = supabase;
    this.symbol = symbol;
    this.interval = interval;
    this.limit = limit;
    this.path = "wss://fstream.binance.com/ws/wifusdt@forceOrder";
    this.ws = null;
    this.retriesRemaining = MAX_RETRIES;
  }

  /**
   * Method to initialize the WebSocket connection
   * @returns {void}
   */
  async init() {
    this.connect();
  }

  /**
   * Method to connect to the WebSocket
   * @returns {void}
   */
  async connect() {
    // Initialize the WebSocket connection

    this.ws = new WebSocket(this.path);

    // Bind open event listener
    this.ws.on("open", () => {
      console.log("Aggragate Rekt WebSocket connection opened.");
    });

    let lastEntry = null;

    // Bind message event listener
    this.ws.on("message", async (response) => {
      const data = JSON.parse(response);
      if (data && data.o) {
        const { ap: price, q: quantity, S: side } = data.o;
        const position = side === "SELL" ? "Long" : "Short";
        // timestamp
        const date = new Date();
        const time = Math.floor(Date.now() / 1000);
        const Rekt = {
          // to timestamp
          id: randomUUID(),
          date: date,
          time: time,
          position: position,
          quantity: parseFloat(quantity),
          value: parseFloat(quantity) * parseFloat(price),
          price: parseFloat(price),
        };

        // console.log("New Rekt:", Rekt);
        if (lastEntry) {
          // console.log("Last Rekt:", lastEntry);
          const entryDay = new Date(Rekt.date).getDay();
          const entryHour = new Date(Rekt.date).getHours();
          const entryMinute = new Date(Rekt.date).getMinutes();
          const lastEntryDay = new Date(lastEntry.date).getDay();
          const lastEntryHour = new Date(lastEntry.date).getHours();
          const lastEntryMinute = new Date(lastEntry.date).getMinutes();

          console.log(
            "Entry Day:",
            entryDay,
            "Entry Hour:",
            entryHour,
            "Entry Minute:",
            entryMinute
          );
          console.log(
            "Last Entry Day:",
            lastEntryDay,
            "Last Entry Hour:",
            lastEntryHour,
            "Last Entry Minute:",
            lastEntryMinute
          );

          if (
            entryDay === lastEntryDay &&
            entryHour === lastEntryHour &&
            entryMinute === lastEntryMinute
          ) {
            console.log("Still same minute, updating Aggregated Value");
            const { res, error } = await this.supabase
              .from("wifusdt_agg_Rekt_data")
              .update({ value: lastEntry.value + Rekt.value })
              .eq("id", lastEntry.id)
              .select();
            console.log(error);
            console.log(res);
            const updateRekt = {
              ...lastEntry,
              value: lastEntry.value + Rekt.value,
            };
            console.log("Updated Rekt", updateRekt);
          } else {
            const { res, error } = await this.supabase
              .from("wifusdt_agg_Rekt_data")
              .insert(Rekt)
              .select();

            console.log(error);
            console.log(res);

            console.log("New Rekt Added:", Rekt);
          }
        } else {
          const { res, error } = await this.supabase
            .from("wifusdt_agg_Rekt_data")
            .insert(Rekt)
            .select();

          console.log(error);
          console.log("First Rekt Added:", Rekt);
        }

        lastEntry = Rekt;
      }
    });

    // Bind close event listener
    this.ws.on("close", () => {
      console.log("WebSocket disconnected");
      if (this.retriesRemaining > 0) {
        this.retriesRemaining--;
        console.log(
          `Retrying connection... Attempts remaining: ${this.retriesRemaining}`
        );
        setTimeout(this.connect(), 1000); // 1-second delay between retries
      } else {
        console.error("Failed to connect after maximum retries");
      }
    });

    // Bind error event listener
    this.ws.on("error", (error) => console.error("WebSocket error:", error));
  }
}
