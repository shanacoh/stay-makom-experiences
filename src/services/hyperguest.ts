/**
 * HyperGuest API Service
 * Complete integration with Search, Booking, and Static APIs
 */

// =====================
// TYPES
// =====================

// Search Types
export interface HyperGuestSearchParams {
  checkIn: string; // YYYY-MM-DD
  nights: number;
  guests: string; // Format: "2" or "2-5,7" (adults-children ages) or "2.1" (two rooms)
  hotelIds?: number[];
  customerNationality?: string; // ISO 2-letter code
  currency?: string; // USD, EUR, ILS
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

// Booking Types
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

export interface HyperGuestBookingResponse {
  id: string;
  status: string;
  propertyId: number;
  dates: { from: string; to: string };
  totalPrice: { amount: number; currency: string };
  [key: string]: any;
}

// Static Types
export interface HyperGuestHotel {
  id: number;
  name: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  cityName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  starRating?: number;
  propertyType?: string;
}

export interface HyperGuestPropertyDetails {
  id: number;
  name: string;
  description?: string;
  address?: string;
  cityName?: string;
  regionName?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  starRating?: number;
  facilities?: Array<{ id: number; name: string }>;
  photos?: Array<{ url: string; caption?: string }>;
  rooms?: Array<{
    roomId: number;
    roomName: string;
    description?: string;
    photos?: string[];
  }>;
  [key: string]: any;
}

export interface HyperGuestListBookingsParams {
  dates?: { from: string; to: string };
  agencyReference?: string;
  customerEmail?: string;
  limit?: number;
  page?: number;
}

export interface HyperGuestCancelOptions {
  reason?: string;
  simulation?: boolean;
}

// =====================
// API CLIENT
// =====================

const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return { supabaseUrl, supabaseKey };
};

// GET request helper
async function callHyperGuestGet<T>(action: string, queryParams: Record<string, string> = {}): Promise<T> {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  
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

// POST request helper
async function callHyperGuestPost<T>(action: string, body: Record<string, any> = {}): Promise<T> {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  
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

// =====================
// SEARCH API
// =====================

/**
 * Search for available hotels
 * @param params Search parameters (checkIn, nights, guests, etc.)
 * @returns Search results with available rooms and rates
 */
export async function searchHotels(params: HyperGuestSearchParams): Promise<{ results: HyperGuestSearchResult[] }> {
  return callHyperGuestPost('search', params);
}

/**
 * Get property availability for a specific hotel
 * @param propertyId Hotel ID
 * @param params Search parameters
 */
export async function getPropertyAvailability(
  propertyId: number, 
  params: Omit<HyperGuestSearchParams, 'hotelIds'>
): Promise<HyperGuestSearchResult | null> {
  const results = await searchHotels({ ...params, hotelIds: [propertyId] });
  return results.results?.[0] || null;
}

// =====================
// BOOKING API
// =====================

/**
 * Pre-book verification (optional step before creating booking)
 * @param bookingData Booking details
 */
export async function preBook(bookingData: HyperGuestBookingData): Promise<HyperGuestBookingResponse> {
  return callHyperGuestPost('pre-book', bookingData);
}

/**
 * Create a new booking
 * @param bookingData Booking details including guest info, rooms, dates
 */
export async function createBooking(bookingData: HyperGuestBookingData): Promise<HyperGuestBookingResponse> {
  return callHyperGuestPost('create-booking', bookingData);
}

/**
 * Get booking details by ID
 * @param bookingId HyperGuest booking ID
 */
export async function getBookingDetails(bookingId: string): Promise<HyperGuestBookingResponse> {
  return callHyperGuestGet('get-booking', { bookingId });
}

/**
 * List bookings with optional filters
 * @param params Filter parameters (dates, agencyReference, customerEmail, etc.)
 */
export async function listBookings(params: HyperGuestListBookingsParams = {}): Promise<HyperGuestBookingResponse[]> {
  return callHyperGuestPost('list-bookings', params);
}

/**
 * Simulate a booking cancellation (without actually cancelling)
 * @param bookingId HyperGuest booking ID
 */
export async function simulateCancellation(bookingId: string): Promise<any> {
  return callHyperGuestPost('cancel-booking', { bookingId, simulation: true });
}

/**
 * Cancel a booking
 * @param bookingId HyperGuest booking ID
 * @param options Optional cancellation reason
 */
export async function cancelBooking(bookingId: string, options: HyperGuestCancelOptions = {}): Promise<any> {
  return callHyperGuestPost('cancel-booking', { bookingId, ...options });
}

// =====================
// STATIC API
// =====================

/**
 * Get all available hotels (static data)
 * @param countryCode Optional country filter (e.g., 'IL' for Israel)
 */
export async function getAllHotels(countryCode?: string): Promise<HyperGuestHotel[]> {
  return callHyperGuestGet('get-hotels', countryCode ? { countryCode } : {});
}

/**
 * Get detailed property information
 * @param propertyId Hotel ID
 */
export async function getPropertyDetails(propertyId: number): Promise<HyperGuestPropertyDetails> {
  return callHyperGuestGet('get-property', { propertyId: propertyId.toString() });
}

/**
 * Get list of all available facilities/amenities
 */
export async function getFacilities(): Promise<Array<{ id: number; name: string }>> {
  return callHyperGuestGet('get-facilities');
}

// =====================
// UTILITIES
// =====================

/**
 * Format guests parameter for search API
 * @example formatGuests([{ adults: 2, children: [5, 7] }]) => "2-5,7"
 * @example formatGuests([{ adults: 2, children: [] }, { adults: 1, children: [] }]) => "2.1"
 */
export function formatGuests(rooms: Array<{ adults: number; children: number[] }>): string {
  return rooms.map(room => {
    let str = room.adults.toString();
    if (room.children && room.children.length > 0) {
      str += '-' + room.children.join(',');
    }
    return str;
  }).join('.');
}

/**
 * Calculate checkout date from checkin and nights
 */
export function calculateCheckout(checkIn: string, nights: number): string {
  const date = new Date(checkIn);
  date.setDate(date.getDate() + nights);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Board type labels
 */
export const BOARD_TYPES = {
  RO: 'Room Only',
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
  AI: 'All Inclusive',
} as const;

/**
 * Get human-readable board type label
 */
export function getBoardTypeLabel(code: string): string {
  return BOARD_TYPES[code as keyof typeof BOARD_TYPES] || code;
}
