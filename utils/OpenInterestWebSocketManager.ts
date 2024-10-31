type OpenInterestCallback = (data: {
  openInterest: string;
  symbol: string;
  time: number;
}) => void;

export class OpenInterestWebSocketManager {
  private socket: WebSocket | null = null;
  private symbol: string;
  private onMessage: OpenInterestCallback;
  private onError: (error: Event) => void;
  private onClose: () => void;
  private onOpen: () => void;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(
    symbol: string,
    onMessage: OpenInterestCallback,
    onError: (error: Event) => void,
    onClose: () => void,
    onOpen: () => void
  ) {
    this.symbol = symbol;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
    this.onOpen = onOpen;
  }

  connect() {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING ||
        this.socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(
      `wss://fstream.binance.com/ws/${this.symbol.toLowerCase()}@openInterest`
    );

    this.socket.onopen = () => {
      console.log(`Open Interest WebSocket connected for ${this.symbol}`);
      this.onOpen();
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    };

    this.socket.onerror = (error) => {
      this.onError(error);
    };

    this.socket.onclose = () => {
      this.onClose();
      this.reconnect();
    };
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      this.reconnectTimeout = setTimeout(
        () => this.connect(),
        1000 * this.reconnectAttempts
      );
    } else {
      console.error(`Max reconnect attempts reached for ${this.symbol}`);
    }
  }

  disconnect() {
    console.log(`Disconnecting Open Interest WebSocket for ${this.symbol}`);
    if (this.socket) {
      this.socket.onclose = null; // Remove the onclose handler to prevent reconnection attempts
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
  }

  getSymbol() {
    return this.symbol;
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}
