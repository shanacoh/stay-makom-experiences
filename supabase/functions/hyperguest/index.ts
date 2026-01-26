import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Domains
const SEARCH_DOMAIN = 'https://search-api.hyperguest.io/2.0/';
const BOOKING_DOMAIN = 'https://book-api.hyperguest.io/2.0/';
const STATIC_DOMAIN = 'https://hg-static.hyperguest.com/';

interface SearchParams {
  checkIn: string;
  nights: number;
  guests: string;
  hotelIds?: number[];
  customerNationality?: string;
  currency?: string;
}

interface BookingData {
  dates: { from: string; to: string };
  propertyId: number;
  leadGuest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nationality?: string;
  };
  rooms: Array<{
    roomId: number;
    ratePlanId: number;
    guests: { adults: number; children: number[] };
  }>;
  customerNationality?: string;
  currency?: string;
  isTest?: boolean;
}

// Validate search parameters
function validateSearchParams(params: SearchParams): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!params.checkIn || !dateRegex.test(params.checkIn)) {
    errors.push('checkIn must be in YYYY-MM-DD format');
  }
  
  if (!Number.isInteger(params.nights) || params.nights < 1) {
    errors.push('nights must be a positive integer');
  }
  
  if (!params.guests || typeof params.guests !== 'string') {
    errors.push('guests must be a string');
  }
  
  if (params.hotelIds && !Array.isArray(params.hotelIds)) {
    errors.push('hotelIds must be an array');
  }
  
  if (params.customerNationality && !/^[A-Z]{2}$/.test(params.customerNationality)) {
    errors.push('customerNationality must be a 2-letter ISO country code');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = Deno.env.get('HYPERGUEST_BEARER_TOKEN');
  if (!token) {
    throw new Error('HYPERGUEST_BEARER_TOKEN not configured');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Accept-Encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
  };
}

// Search hotels
async function searchHotels(params: SearchParams) {
  console.log('🔍 Searching hotels with params:', JSON.stringify(params));
  
  const validation = validateSearchParams(params);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  const queryParams = new URLSearchParams();
  queryParams.append('checkIn', params.checkIn);
  queryParams.append('nights', params.nights.toString());
  queryParams.append('guests', params.guests);
  
  if (params.hotelIds) {
    params.hotelIds.forEach(id => queryParams.append('hotelIds', id.toString()));
  }
  if (params.customerNationality) {
    queryParams.append('customerNationality', params.customerNationality);
  }
  if (params.currency) {
    queryParams.append('currency', params.currency);
  }
  
  const url = `${SEARCH_DOMAIN}?${queryParams.toString()}`;
  console.log('📡 Request URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Search failed:', response.status, errorText);
    throw new Error(`Search failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Search successful, results count:', data.results?.length || 0);
  return data;
}

// Pre-book (verification before booking)
async function preBook(bookingData: BookingData) {
  console.log('📋 Pre-booking:', JSON.stringify(bookingData));
  
  const url = `${BOOKING_DOMAIN}booking/pre-book`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Pre-book failed:', response.status, errorText);
    throw new Error(`Pre-book failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Pre-book successful');
  return data;
}

// Create booking
async function createBooking(bookingData: BookingData) {
  console.log('🎫 Creating booking:', JSON.stringify(bookingData));
  
  const url = `${BOOKING_DOMAIN}booking/create`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Create booking failed:', response.status, errorText);
    throw new Error(`Create booking failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Booking created successfully');
  return data;
}

// Get booking details
async function getBookingDetails(bookingId: string) {
  console.log('📖 Getting booking details:', bookingId);
  
  const url = `${BOOKING_DOMAIN}booking/get/${bookingId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Get booking failed:', response.status, errorText);
    throw new Error(`Get booking failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Booking details retrieved');
  return data;
}

// List bookings
async function listBookings(params: { dates?: { from: string; to: string }; agencyReference?: string; customerEmail?: string; limit?: number; page?: number }) {
  console.log('📋 Listing bookings:', JSON.stringify(params));
  
  const url = `${BOOKING_DOMAIN}booking/list`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ List bookings failed:', response.status, errorText);
    throw new Error(`List bookings failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Bookings listed successfully');
  return data;
}

// Cancel booking
async function cancelBooking(bookingId: string, options: { reason?: string; simulation?: boolean } = {}) {
  console.log('🚫 Cancelling booking:', bookingId, options);
  
  const url = `${BOOKING_DOMAIN}booking/cancel`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      bookingId,
      ...options,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Cancel booking failed:', response.status, errorText);
    throw new Error(`Cancel booking failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Booking cancelled successfully');
  return data;
}

// Get all hotels (static data)
async function getAllHotels(countryCode?: string) {
  console.log('🏨 Getting all hotels, country filter:', countryCode);
  
  const url = `${STATIC_DOMAIN}hotels.json`;
  console.log('📡 Static API URL:', url);
  
  const headers = getAuthHeaders();
  console.log('🔑 Using auth headers');
  
  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  
  console.log('📥 Response status:', response.status, response.statusText);
  
  const responseText = await response.text();
  console.log('📝 Response length:', responseText.length, 'chars');
  
  if (!response.ok) {
    console.error('❌ Get hotels failed:', response.status, responseText.substring(0, 500));
    throw new Error(`Get hotels failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  if (!responseText || responseText.trim() === '') {
    console.error('❌ Empty response from API');
    throw new Error('Empty response from HyperGuest API');
  }
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('❌ Failed to parse JSON:', responseText.substring(0, 500));
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
  }
  
  // Filter by country if specified
  if (countryCode && Array.isArray(data)) {
    data = data.filter((hotel: any) => hotel.countryCode === countryCode);
  }
  
  console.log('✅ Hotels retrieved, count:', Array.isArray(data) ? data.length : 'N/A');
  return data;
}

// Get property details
async function getPropertyDetails(propertyId: number) {
  console.log('🏠 Getting property details:', propertyId);
  
  const url = `${STATIC_DOMAIN}${propertyId}/property-static.json`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Get property failed:', response.status, errorText);
    throw new Error(`Get property failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Property details retrieved');
  return data;
}

// Get facilities list
async function getFacilities() {
  console.log('🛎️ Getting facilities list');
  
  const url = `${STATIC_DOMAIN}facilities.json`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Get facilities failed:', response.status, errorText);
    throw new Error(`Get facilities failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Facilities retrieved');
  return data;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log('🚀 HyperGuest API request:', action, 'method:', req.method);
    
    // Parse body only for POST with actual content
    let body: Record<string, any> = {};
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      const contentLength = req.headers.get('content-length');
      
      if (contentType.includes('application/json') && contentLength && parseInt(contentLength) > 0) {
        try {
          const text = await req.text();
          if (text && text.trim()) {
            body = JSON.parse(text);
          }
        } catch (parseErr) {
          console.log('⚠️ No JSON body or parse error, using empty object');
        }
      }
    }
    
    console.log('📦 Body:', JSON.stringify(body));
    
    let result;
    
    switch (action) {
      // Search API
      case 'search':
        result = await searchHotels(body as SearchParams);
        break;
      
      // Booking API
      case 'pre-book':
        result = await preBook(body as BookingData);
        break;
      
      case 'create-booking':
        result = await createBooking(body as BookingData);
        break;
      
      case 'get-booking':
        const bookingId = url.searchParams.get('bookingId');
        if (!bookingId) throw new Error('bookingId is required');
        result = await getBookingDetails(bookingId);
        break;
      
      case 'list-bookings':
        result = await listBookings(body as any);
        break;
      
      case 'cancel-booking':
        const cancelBookingId = (body as any).bookingId;
        if (!cancelBookingId) throw new Error('bookingId is required');
        result = await cancelBooking(cancelBookingId, body as any);
        break;
      
      // Static API
      case 'get-hotels':
        const countryCode = url.searchParams.get('countryCode') || undefined;
        result = await getAllHotels(countryCode);
        break;
      
      case 'get-property':
        const propertyId = url.searchParams.get('propertyId');
        if (!propertyId) throw new Error('propertyId is required');
        result = await getPropertyDetails(parseInt(propertyId));
        break;
      
      case 'get-facilities':
        result = await getFacilities();
        break;
      
      default:
        throw new Error(`Unknown action: ${action}. Available actions: search, pre-book, create-booking, get-booking, list-bookings, cancel-booking, get-hotels, get-property, get-facilities`);
    }
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ HyperGuest API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
