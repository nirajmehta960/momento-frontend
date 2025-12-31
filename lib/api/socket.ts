// API base URL from environment variable
// Socket.io connects to the base server URL, not the /api endpoint
let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
// Remove /api suffix if present (Socket.io doesn't use REST API paths)
if (apiBaseUrl.endsWith("/api")) {
  apiBaseUrl = apiBaseUrl.slice(0, -4);
}

let socket: any = null;
let connectingPromise: Promise<any> | null = null;

// Lazy initialization - only import and create socket on client side
const createSocket = (userId?: string): Promise<any> => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  // If we're already connecting, return that promise
  if (connectingPromise) {
    return connectingPromise.then((sock) => {
      if (userId && sock) {
        sock.emit("authenticate", userId);
      }
      return sock;
    });
  }

  // Use dynamic import to avoid SSR bundling issues
  connectingPromise = import("socket.io-client").then((socketIO) => {
    // If socket already exists and is connected, just authenticate and return
    if (socket && socket.connected) {
      if (userId) {
        socket.emit("authenticate", userId);
      }
      return socket;
    }

    // If socket exists but not connected, disconnect and recreate
    if (socket && !socket.connected) {
      socket.disconnect();
      socket.removeAllListeners();
      socket = null;
    }

    // Create new socket instance
      socket = socketIO.io(apiBaseUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    return new Promise((resolve, reject) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          connectingPromise = null;
          reject(new Error("Socket connection timeout"));
        }
      }, 20000);

      const onConnect = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        if (userId) {
          socket?.emit("authenticate", userId);
        }
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
        connectingPromise = null;
        resolve(socket);
      };

      const onError = () => {
        // Socket.io will automatically retry
      };

      socket.on("connect", onConnect);
      socket.on("connect_error", onError);

      // If already connected, resolve immediately
      if (socket.connected) {
        onConnect();
      }
      });
  }).catch((error) => {
    connectingPromise = null;
    throw error;
  });

  return connectingPromise;
};

// Synchronous getter that returns existing socket or null
export const getSocket = (userId?: string): any => {
  if (typeof window === "undefined") {
    return null;
  }

  // If socket exists and is connected, return it
  if (socket && socket.connected) {
    if (userId) {
      socket.emit("authenticate", userId);
    }
    return socket;
  }

  // If socket exists but not connected, wait for connection
  if (socket && !socket.connected) {
    return null; // Return null to indicate not ready
  }

  // Otherwise, initialize asynchronously (will be available on next call)
  if (!socket) {
    createSocket(userId).catch(() => {
      // Silently fail - socket will retry automatically
    });
  }

  return socket;
};

// Async getter that ensures socket is ready
export const getSocketAsync = async (userId?: string): Promise<any> => {
  if (typeof window === "undefined") {
    return null;
  }

  // If socket exists and is connected, return it
  if (socket && socket.connected) {
    if (userId) {
      socket.emit("authenticate", userId);
    }
    return socket;
  }

  // Otherwise, create and wait for it
  return createSocket(userId);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};
