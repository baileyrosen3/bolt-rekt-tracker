import WebSocket from "ws";
import { randomUUID } from "crypto";

const MAX_RETRIES = 3;

// create tickdata object
export class TickData {
  time;
  open;
  high;
  low;
  close;
}
/**
 * Class to handle WebSocket connections to Huobi
 */
export class KlineWebsocketClient {
  /**
   * Constructor for the HuobiWebSocketClient class
   * @param {Object} config - Configuration object
   * @param {string} config.symbol - The symbol to subscribe to
   * @param {string} [config.path='/linear-swap-notification'] - The path for the WebSocket connection
   * @param {number} [config.retries=3] - The number of retries to attempt if the connection fails
   * @returns {KlineWebsocketClient} A new instance of the KlineWebsocketClient class
   */
  constructor({ symbol, interval, limit }) {
    this.symbol = symbol;
    this.interval = interval;
    this.limit = limit;
    this.path = "wss://fstream.binance.com/ws/wifusdt@kline_1m";
    this.ws = null;
    this.retriesRemaining = MAX_RETRIES;
    this.tickData = {
      "1min": new TickData(),
      "5min": new TickData(),
      "15min": new TickData(),
      "30min": new TickData(),
      "1hour": new TickData(),
      "4hour": new TickData(),
      "1day": new TickData(),
    };
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
    this.ws = new WebSocket(this.path);

    // Bind open event listener
    this.ws.on("open", () => {
      console.log("Kline WebSocket connection opened.");
    });

    // Bind message event listener
    this.ws.on("message", async (response) => {
      const data = JSON.parse(response);
      if (data && data.k) {
        const kline = data.k;
        const tick = {
          // to timestamp
          id: randomUUID(),
          time: new Date(kline.t),
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };
        const { res } = await supabase
          .from("wifusdt_kline_data")
          .insert(tick)
          .select();
        console.log(res);
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
