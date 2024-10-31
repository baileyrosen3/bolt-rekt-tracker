// import { KlineWebsocketClient } from "./KlineWebsocketClient.mjs";
import { RektWebsocketClient } from "./RektWebsocketClient.mjs";
// import { RektWebsocketClientA } from "./RektWebsocketClientA.mjs";
import express from "express";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase URL and Anon Key
const SUPABASE_URL = "https://lsnmvskwmvqggisitukw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzbm12c2t3bXZxZ2dpc2l0dWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM3NjMxMzQsImV4cCI6MjAzOTMzOTEzNH0.FqBoMkNQxA1Nz7LmB67cWdA4X780yAYqmSexHUUk7pk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
// Map of string and HuobiFuturesWebsocketClient
const activeKlineWebSocketClients = {};
const activeRektWebSocketClients = {};
app.use(express.json()); // for parsing application/json
app.post("/start-websocket/:symbol", (req, res) => {
  const { id, interval, limit } = req.body;
  const { symbol } = req.params;

  const RektClient = new RektWebsocketClient({
    supabase,
    symbol,
    interval,
    limit,
  });

  activeRektWebSocketClients[id] = RektClient;
  RektClient.init();

  res.send(`WebSocket client initialized for symbol: ${symbol}`);
});

app.post("/end-websocket", (req, res) => {
  const { id } = req.body;

  const client = activeKlineWebSocketClients[id];
  if (client) {
    client.ws.close(); // Terminate the WebSocket connection
    delete activeKlineWebSocketClients[id];
    res.send("WebSocket terminated");
  } else {
    res.status(404).send("WebSocket not found");
  }
});

const PORT = 8088;
console.log("Starting server...");
app.listen(PORT, () => console.log(`Kline Manager listening on port ${PORT}`));

async function startWebhook(data) {
  const vmEndpoint = `http://localhost:${PORT}/start-websocket/${data.symbol}`;
  try {
    const response = await axios.post(vmEndpoint, data, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(response.data);
  } catch (error) {
    console.error(`Error in startWebhook for ${data.symbol}:`, error); // Log errors
  }
}

async function startWebhooks() {
  try {
    console.log("Initializing Kline And Rekt Webhooks");

    const symbols = [
      "AR-USDT",
      "AVAX-USDT",
      "BONK-USDT",
      "BTC-USDT",
      "DOGE-USDT",
      "ETH-USDT",
      "FET-USDT",
      "FLOKI-USDT",
      "FTM-USDT",
      "INJ-USDT",
      "JUP-USDT",
      "KAS-USDT",
      "NEAR-USDT",
      "ONDO-USDT",
      "PEPE-USDT",
      "POPCAT-USDT",
      "PYTH-USDT",
      "SEI-USDT",
      "SHIB-USDT",
      "SOL-USDT",
      "SUI-USDT",
      "TAO-USDT",
      "TIA-USDT",
      "WIF-USDT",
      "TON-USDT",
    ];

    const webhookData = symbols.map((symbol) => ({
      id: `foo_bar_${symbol.toLowerCase().replace(/-usdt/g, "")}`,
      symbol: symbol.toLowerCase().replace(/-/g, ""),
      interval: "1min",
      limit: 1000,
    }));

    for (const data of webhookData) {
      console.log(`Starting WebSocket for: ${data.symbol}`);
      try {
        await startWebhook(data);
      } catch (error) {
        console.error(`Error starting WebSocket for ${data.symbol}:`, error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// Run startWebhooks when file is ran
startWebhooks();
