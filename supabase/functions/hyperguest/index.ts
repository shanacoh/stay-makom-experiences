// HyperGuest API Edge Function v5
// B3: isTest driven by ENVIRONMENT secret
// S2: JWT auth for mutative actions
// B1: Proper pre-book format

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Domains
const SEARCH_DOMAIN = 'https://search-api.hyperguest.io/2.0/';
const BOOKING_DOMAIN = 'https://book-api.hyperguest.io/2.0/';
const STATIC_DOMAIN = 'https://hg-static.hyperguest.com/';

// ✅ S2 FIX: Actions that require user authentication
const PROTECTED_ACTIONS = ['create-booking', 'pre-book', 'cancel-booking', 'list-bookings', 'get-booking'];

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
    birthDate: string;
    title: string;
    name: { first: string; last: string };
    contact: {
      address?: string;
      city?: string;
      country: string;
      email: string;
      phone: string;
      state?: string;
      zip?: string;
    };
  };
  reference?: { agency: string };
  rooms: Array<{
    roomId: number;
    ratePlanId: number;
    expectedPrice?: { amount: number; currency: string };
    specialRequests?: string;
    guests: Array<{
      birthDate: string;
      title: string;
      name: { first: string; last: string };
    }>;
  }>;
  isTest?: boolean;
}

// ✅ B1 FIX: Dedicated interface for pre-book (HyperGuest format)
interface PreBookData {
  search: {
    dates: { from: string; to: string };
    propertyId: number;
    nationality?: string;
    pax: Array<{ adults: number; children: number[] }>;
  };
  rooms: Array<{
    roomCode?: string;
    roomId?: number;
    rateCode?: string;
    ratePlanId?: number;
    expectedPrice: { amount: number; currency: string };
  }>;
}

// ✅ S2 FIX: Verify Supabase auth for protected actions
async function verifyAuth(req: Request, action: string): Promise<{ authenticated: boolean; userId?: string; error?: string }> {
  if (!PROTECTED_ACTIONS.includes(action)) {
    return { authenticated: true };
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { authenticated: false, error: 'Invalid or expired token' };
    }

    return { authenticated: true, userId: user.id };
  } catch (err) {
    console.error('❌ Auth verification failed:', err);
    return { authenticated: false, error: 'Auth verification failed' };
  }
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

// ✅ B1 FIX: Pre-book with correct HyperGuest format
async function preBook(preBookData: PreBookData) {
  console.log('📋 Pre-booking for property:', preBookData.search.propertyId);
  
  const url = `${BOOKING_DOMAIN}booking/pre-book`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(preBookData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Pre-book failed:', response.status, errorText);
    throw new Error(`Pre-book failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Pre-book successful');
  return data.content || data;
}

// Create booking
async function createBooking(bookingData: BookingData) {
  // ✅ B3 FIX: Force isTest based on environment — never trust frontend
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
  const safeBookingData = {
    ...bookingData,
    isTest: !isProduction,
    // Payment details — test card for staging, will come from Stripe in production
    paymentDetails: bookingData.paymentDetails || {
      type: "credit_card",
      details: {
        number: "4111111111111111",
        cvv: "123",
        expiration: { month: "12", year: "2027" },
        holderName: "TEST STAYMAKOM",
      },
    },
  };

  console.log('🎫 Creating booking for property:', safeBookingData.propertyId,
    'isTest:', safeBookingData.isTest, 'env:', isProduction ? 'PROD' : 'DEV/STAGING');
  
  const url = `${BOOKING_DOMAIN}booking/create`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(safeBookingData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Create booking failed:', response.status, errorText);
    
    // 409 may contain a bookingId — HG created the booking but flagged an issue
    // Try to extract bookingId and return partial success so the frontend can handle it
    if (response.status === 409) {
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.bookingId) {
          console.log('⚠️ 409 with bookingId:', parsed.bookingId, '— treating as partial success');
          return { id: String(parsed.bookingId), status: 'PendingReview', partialError: parsed.error };
        }
      } catch (_) { /* not JSON, fall through */ }
    }
    
    throw new Error(`Create booking failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Booking created successfully, id:', data.id || data.content?.id);
  return data.content || data;
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
  return data.content || data;
}

// List bookings
async function listBookings(params: { dates?: { from: string; to: string }; agencyReference?: string; customerEmail?: string; limit?: number; page?: number }) {
  console.log('📋 Listing bookings with params:', JSON.stringify(params));
  
  const url = `${BOOKING_DOMAIN}booking/list`;
  
  const body: Record<string, unknown> = {};
  if (params.dates) body.dates = params.dates;
  if (params.agencyReference) body.agencyReference = params.agencyReference;
  if (params.customerEmail) body.customerEmail = params.customerEmail;
  if (params.limit) body.limit = params.limit;
  if (params.page) body.page = params.page;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ List bookings failed:', response.status, errorText);
    throw new Error(`List bookings failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Bookings listed successfully');
  return data.content || data;
}

// Cancel booking
async function cancelBooking(bookingId: string, options: { reason?: string; simulation?: boolean } = {}) {
  const isSimulation = options.simulation || false;
  console.log(isSimulation ? '🔍 Simulating cancellation:' : '🚫 Cancelling booking:', bookingId);
  
  const url = `${BOOKING_DOMAIN}booking/cancel`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      bookingId,
      simulation: isSimulation,
      ...(options.reason && { reason: options.reason }),
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Cancel booking failed:', response.status, errorText);
    throw new Error(`Cancel booking failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅', isSimulation ? 'Cancellation simulated' : 'Booking cancelled');
  return data.content || data;
}

// Get all hotels (static data)
async function getAllHotels(countryCode?: string) {
  console.log('🏨 Getting all hotels, country filter:', countryCode);
  
  const url = `${STATIC_DOMAIN}hotels.json`;
  console.log('📡 Static API URL:', url);
  
  const headers = getAuthHeaders();
  
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
  } catch (_parseError) {
    console.error('❌ Failed to parse JSON:', responseText.substring(0, 500));
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
  }
  
  if (Array.isArray(data) && data.length > 0) {
    const firstHotel = data[0];
    console.log('📋 First hotel keys:', JSON.stringify(Object.keys(firstHotel)));
  }
  
  if (countryCode && Array.isArray(data)) {
    const upperCountryCode = countryCode.toUpperCase();
    const originalCount = data.length;
    
    data = data.filter((hotel: { country?: string; countryCode?: string; country_code?: string }) => {
      return hotel.country === countryCode || 
             hotel.country === upperCountryCode ||
             hotel.countryCode === countryCode ||
             hotel.countryCode === upperCountryCode ||
             hotel.country_code === countryCode ||
             (hotel.country && String(hotel.country).toUpperCase() === upperCountryCode);
    });
    
    console.log('🔍 Filtered by country', upperCountryCode, ':', data.length, 'of', originalCount, 'hotels');
  }
  
  if (!countryCode && Array.isArray(data)) {
    console.log('⚠️ No country filter, returning first 2000 hotels');
    data = data.slice(0, 2000);
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log('🚀 HyperGuest API request:', action, 'method:', req.method);

    // ✅ S2 FIX: Verify auth for protected actions
    if (action) {
      const auth = await verifyAuth(req, action);
      if (!auth.authenticated) {
        console.error('🔒 Auth failed for action:', action, auth.error);
        return new Response(JSON.stringify({
          success: false,
          error: `Authentication required: ${auth.error}`
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (auth.userId) {
        console.log('🔓 Authenticated user:', auth.userId, 'for action:', action);
      }
    }
    
    // Parse body only for POST with actual content
    let body: Record<string, unknown> = {};
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      const contentLength = req.headers.get('content-length');
      
      if (contentType.includes('application/json') && contentLength && parseInt(contentLength) > 0) {
        try {
          const text = await req.text();
          if (text && text.trim()) {
            body = JSON.parse(text);
          }
        } catch (_parseErr) {
          console.log('⚠️ No JSON body or parse error, using empty object');
        }
      }
    }
    
    console.log('📦 Body:', JSON.stringify(body));
    
    let result;
    
    switch (action) {
      case 'search':
        result = await searchHotels(body as unknown as SearchParams);
        break;
      
      case 'pre-book':
        result = await preBook(body as unknown as PreBookData);
        break;
      
      case 'create-booking':
        result = await createBooking(body as unknown as BookingData);
        break;
      
      case 'get-booking': {
        const bookingId = url.searchParams.get('bookingId');
        if (!bookingId) throw new Error('bookingId is required');
        result = await getBookingDetails(bookingId);
        break;
      }
      
      case 'list-bookings':
        result = await listBookings(body as { dates?: { from: string; to: string }; agencyReference?: string; customerEmail?: string; limit?: number; page?: number });
        break;
      
      case 'cancel-booking': {
        const cancelBookingId = (body as { bookingId?: string }).bookingId;
        if (!cancelBookingId) throw new Error('bookingId is required');
        result = await cancelBooking(cancelBookingId, body as { reason?: string; simulation?: boolean });
        break;
      }
      
      case 'get-hotels': {
        const countryCode = url.searchParams.get('countryCode') || undefined;
        result = await getAllHotels(countryCode);
        break;
      }
      
      case 'get-property': {
        const propertyId = url.searchParams.get('propertyId');
        if (!propertyId) throw new Error('propertyId is required');
        result = await getPropertyDetails(parseInt(propertyId));
        break;
      }
      
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
