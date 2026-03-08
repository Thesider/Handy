import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { API_BASE_URL } from "../utils/constants";
import { getToken } from "../utils/tokenStorage";
import type { BookingMessage } from "../api/messages.api";

export type BookingEventPayload = {
  bookingId: number;
  status?: string;
  price?: number;
  amount?: number;
  paymentStatus?: string;
  eventType: string;
};

export type JobGigEventPayload = {
  jobGigId: number;
  eventType: string;
  response: unknown;
};

export type ChatMessageEventPayload = {
  bookingId: number;
  message: BookingMessage;
};

export type UserAlertPayload = {
  title: string;
  message: string;
  alertType: string;
  meta?: {
    bookingId?: number;
    jobGigId?: number;
    responseType?: string;
  };
  createdAt: string;
};

type EventMap = {
  BookingEvent: BookingEventPayload;
  JobGigEvent: JobGigEventPayload;
  ChatMessage: ChatMessageEventPayload;
  UserAlert: UserAlertPayload;
};

class SignalRService {
  private connection: HubConnection | null = null;

  private ensureConnection() {
    if (this.connection) {
      return this.connection;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/marketplace`, {
        accessTokenFactory: () => getToken() ?? "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    return this.connection;
  }

  async connect() {
    const conn = this.ensureConnection();
    if (conn.state === HubConnectionState.Connected || conn.state === HubConnectionState.Connecting) {
      return;
    }
    await conn.start();
  }

  async disconnect() {
    if (!this.connection) return;
    if (this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop();
    }
  }

  async joinUser(userId: number) {
    const conn = this.ensureConnection();
    await conn.invoke("JoinUser", userId);
  }

  async leaveUser(userId: number) {
    const conn = this.ensureConnection();
    await conn.invoke("LeaveUser", userId);
  }

  async joinBooking(bookingId: number) {
    const conn = this.ensureConnection();
    await conn.invoke("JoinBooking", bookingId);
  }

  async leaveBooking(bookingId: number) {
    const conn = this.ensureConnection();
    await conn.invoke("LeaveBooking", bookingId);
  }

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void) {
    const conn = this.ensureConnection();
    conn.on(event, handler);
    return () => conn.off(event, handler);
  }
}

export const signalRService = new SignalRService();
