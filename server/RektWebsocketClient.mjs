import WebSocket from "ws";
import { randomUUID } from "crypto";

const MAX_RETRIES = 3;

/**
 * Class to handle WebSocket connections to Huobi
 */
export class RektWebsocketClient {
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
    this.symbol = symbol.toLowerCase();
    this.interval = interval;
    this.limit = limit;
    this.path = `wss://fstream.binance.com/ws/${this.symbol}@forceOrder`;
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

    // Create a single supabase client for interacting with your database

    console.log("Starting Rekt WebSocket Client for ", this.symbol);
    this.ws = new WebSocket(this.path);

    // Bind open event listener
    this.ws.on("open", () => {
      console.log(`WebSocket started for ${this.symbol}`);
    });

    // Bind message event listener
    this.ws.on("message", async (response) => {
      const data = JSON.parse(response);
      if (data && data.o) {
        const { ap: price, q: quantity, S: side } = data.o;
        const position = side === "SELL" ? "Long" : "Short";
        const date = new Date();
        const time = Math.floor(Date.now() / 1000);
        const value = parseFloat(quantity) * parseFloat(price);

        const Rekt = {
          id: randomUUID(),
          date,
          time,
          position,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          value,
        };

        console.log(`
Rekt detected:
  Symbol:    ${this.symbol.toUpperCase()}
  ID:        ${Rekt.id}
  Time:      ${date.toISOString()}
  Position:  ${Rekt.position}
  Quantity:  ${Rekt.quantity.toFixed(4)}
  Price:     $${Rekt.price.toFixed(2)}
  Value:     $${Rekt.value.toFixed(2)}
`);

        const { error } = await this.supabase
          .from(`${this.symbol}_liquidation_data`)
          .insert(Rekt)
          .select();

        if (error) {
          console.error(`Error inserting Rekt data: ${error.message}`);
        } else {
          console.log(`Rekt data inserted successfully for ${this.symbol}`);
        }
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
