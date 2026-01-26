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

export interface HyperGuestHotel {
  id: number;
  name: string;
  countryCode?: string;
  country?: string;
  regionName?: string;
  cityName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  starRating?: number;
  propertyType?: string;
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

// API client functions - uses fetch for GET with query params
async function callHyperGuestGet<T>(action: string, queryParams: Record<string, string> = {}): Promise<T> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const searchParams = new URLSearchParams({ action, ...queryParams });
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/hyperguest?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HyperGuest API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  
  return result.data as T;
}

// API client functions - uses supabase.functions.invoke for POST
async function callHyperGuestPost<T>(action: string, body: Record<string, any> = {}): Promise<T> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/hyperguest?action=${action}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HyperGuest API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  
  return result.data as T;
}

// Search API
export async function searchHotels(params: HyperGuestSearchParams): Promise<{ results: HyperGuestSearchResult[] }> {
  return callHyperGuestPost('search', params);
}

// Booking API
export async function preBookHotel(bookingData: HyperGuestBookingData) {
  return callHyperGuestPost('pre-book', bookingData);
}

export async function createBooking(bookingData: HyperGuestBookingData) {
  return callHyperGuestPost('create-booking', bookingData);
}

export async function getBookingDetails(bookingId: string) {
  return callHyperGuestGet('get-booking', { bookingId });
}

export async function listBookings(params: {
  dates?: { from: string; to: string };
  agencyReference?: string;
  customerEmail?: string;
  limit?: number;
  page?: number;
}) {
  return callHyperGuestPost('list-bookings', params);
}

export async function cancelBooking(bookingId: string, options: { reason?: string; simulation?: boolean } = {}) {
  return callHyperGuestPost('cancel-booking', { bookingId, ...options });
}

// Static API
export async function getAllHotels(countryCode?: string): Promise<HyperGuestHotel[]> {
  return callHyperGuestGet('get-hotels', countryCode ? { countryCode } : {});
}

export async function getPropertyDetails(propertyId: number) {
  return callHyperGuestGet('get-property', { propertyId: propertyId.toString() });
}

export async function getFacilities() {
  return callHyperGuestGet('get-facilities');
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
