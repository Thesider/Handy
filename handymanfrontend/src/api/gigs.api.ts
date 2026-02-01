import { httpClient } from "./httpClient";
import type { Address } from "../features/handyman/handyman.types";

export type Bid = {
    bidId: number;
    jobGigId: number;
    workerId: number;
    workerName: string;
    amount: number;
    message: string;
    isAccepted: boolean;
    createdAtUtc: string;
    workerRating: number;
};

export type JobGig = {
    jobGigId: number;
    title: string;
    description: string | null;
    budget: number;
    serviceType: string;
    customerId: number;
    customerName: string;
    address: Address;
    status: "Open" | "InProgress" | "Completed" | "Closed";
    createdAtUtc: string;
    // acceptedBidId?: number;
    numWorkersRequired: number;
    durationDays: number;
    bids: Bid[];
};

export const getGigs = () =>
    httpClient.get<JobGig[]>("/api/job-gigs");

export const getGigsByCustomer = (customerId: number) =>
    httpClient.get<JobGig[]>(`/api/job-gigs/by-customer/${customerId}`);

export const createGig = (gig: {
    title: string;
    description: string | null;
    budget: number;
    serviceId: number;
    customerId: number;
    address: Address;
    numWorkersRequired: number;
    durationDays: number;
}) => httpClient.post<JobGig>("/api/job-gigs", gig);

export const addBid = (bid: {
    jobGigId: number;
    workerId: number;
    amount: number;
    message: string;
}) => httpClient.post<Bid>("/api/job-gigs/bids", bid);

export const acceptBid = (jobGigId: number, bidId: number) =>
    httpClient.put<void>(`/api/job-gigs/${jobGigId}/accept-bid/${bidId}`, {});
