import { supabase } from "@/integrations/supabase/client";

// Types for HyperGuest API
export interface HyperGuestSearchParams {
  checkIn: string; // YYYY-MM-DD
  nights: number;
  guests: string; // Format: "2" or "2-5,7" or "2.1"
  hotelIds?: number[];
  customerNationality?: string; // ISO 2-letter code
  currency?: string; // USD, EUR, ILS
}

export interface HyperGuestLeadGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
}

export interface HyperGuestRoom {
  roomId: number;
  ratePlanId: number;
  guests: {
    adults: number;
    children: number[];
  };
}

export interface HyperGuestBookingData {
  dates: { from: string; to: string };
  propertyId: number;
  leadGuest: HyperGuestLeadGuest;
  rooms: HyperGuestRoom[];
  customerNationality?: string;
  currency?: string;
  isTest?: boolean;
}

export interface HyperGuestPropertyInfo {
  name: string;
  starRating: number;
  cityName: string;
  cityId: number;
  countryCode: string;
  regionName: string;
  longitude: number;
  latitude: number;
  propertyType: number;
  propertyTypeName: string;
}

export interface HyperGuestRatePlan {
  ratePlanId: number;
  ratePlanCode: string;
  ratePlanName: string;
  prices: {
    sell: { amount: number; currency: string };
    net: { amount: number; currency: string };
  };
  cancellationPolicy: {
    type: string;
    deadline: string;
  };
  paymentInfo: {
    type: string;
    required: boolean;
  };
  board: string;
}

export interface HyperGuestRoomResult {
  roomId: number;
  roomName: string;
  roomTypeCode: string;
  numberOfAvailableRooms: number;
  settings: {
    numberOfBedrooms: number;
    roomSize: number | null;
    maxAdultsNumber: number;
    maxChildrenNumber: number;
    maxOccupancy: number;
    numberOfBeds: number;
    beddingConfigurations: Array<{
      type: string;
      size: string;
      quantity: number;
    }>;
  };
  ratePlans: HyperGuestRatePlan[];
}

export interface HyperGuestSearchResult {
  propertyId: number;
  propertyInfo: HyperGuestPropertyInfo;
  rooms: HyperGuestRoomResult[];
  remarks: string[];
}

// Helper to format guests parameter
export function formatGuests(rooms: Array<{ adults: number; children: number[] }>): string {
  return rooms.map(room => {
    let str = room.adults.toString();
    if (room.children && room.children.length > 0) {
      str += '-' + room.children.join(',');
    }
    return str;
  }).join('.');
}

// API client functions
async function callHyperGuest<T>(action: string, params: Record<string, any> = {}, queryParams: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({ action, ...queryParams });
  
  const { data, error } = await supabase.functions.invoke('hyperguest', {
    body: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // The function is called without query params in the body, we need to add action
  const response = await supabase.functions.invoke(`hyperguest?${searchParams.toString()}`, {
    body: Object.keys(params).length > 0 ? params : undefined,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data.success) {
    throw new Error(response.data.error || 'Unknown error');
  }

  return response.data.data as T;
}

// Search API
export async function searchHotels(params: HyperGuestSearchParams): Promise<{ results: HyperGuestSearchResult[] }> {
  return callHyperGuest('search', params);
}

// Booking API
export async function preBookHotel(bookingData: HyperGuestBookingData) {
  return callHyperGuest('pre-book', bookingData);
}

export async function createBooking(bookingData: HyperGuestBookingData) {
  return callHyperGuest('create-booking', bookingData);
}

export async function getBookingDetails(bookingId: string) {
  return callHyperGuest('get-booking', {}, { bookingId });
}

export async function listBookings(params: {
  dates?: { from: string; to: string };
  agencyReference?: string;
  customerEmail?: string;
  limit?: number;
  page?: number;
}) {
  return callHyperGuest('list-bookings', params);
}

export async function cancelBooking(bookingId: string, options: { reason?: string; simulation?: boolean } = {}) {
  return callHyperGuest('cancel-booking', { bookingId, ...options });
}

// Static API
export async function getAllHotels(countryCode?: string) {
  return callHyperGuest('get-hotels', {}, countryCode ? { countryCode } : {});
}

export async function getPropertyDetails(propertyId: number) {
  return callHyperGuest('get-property', {}, { propertyId: propertyId.toString() });
}

export async function getFacilities() {
  return callHyperGuest('get-facilities');
}

// Utility: Calculate checkout date from checkin and nights
export function calculateCheckout(checkIn: string, nights: number): string {
  const date = new Date(checkIn);
  date.setDate(date.getDate() + nights);
  return date.toISOString().split('T')[0];
}

// Utility: Board types
export const BOARD_TYPES = {
  RO: 'Room Only',
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
  AI: 'All Inclusive',
} as const;
