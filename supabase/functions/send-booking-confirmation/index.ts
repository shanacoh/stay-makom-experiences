import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  bookingId: string;
}

const escapeHTML = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = { ILS: '₪', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency}${amount.toLocaleString()}`;
};

const formatDate = (dateStr: string, isHebrew: boolean): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-confirmation function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId }: BookingConfirmationRequest = await req.json();
    console.log("Processing booking confirmation for:", bookingId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        experience:experiences(title, title_he, slug, hero_image),
        hotel:hotels(name, name_he, city, city_he, hero_image),
        customer:customers(first_name, last_name, user_id)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found:", bookingError);
      throw new Error("Booking not found");
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      booking.customer?.user_id
    );

    if (userError || !userData?.user?.email) {
      console.error("User email not found:", userError);
      throw new Error("Customer email not found");
    }

    const customerEmail = userData.user.email;
    const customerName = `${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`.trim() || 'Guest';
    
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("locale")
      .eq("user_id", booking.customer?.user_id)
      .single();
    
    const isHebrew = profile?.locale === 'he';

    const experienceTitle = isHebrew && booking.experience?.title_he 
      ? booking.experience.title_he 
      : booking.experience?.title || 'Experience';
    
    const hotelName = isHebrew && booking.hotel?.name_he 
      ? booking.hotel.name_he 
      : booking.hotel?.name || 'Hotel';

    const hotelCity = isHebrew && booking.hotel?.city_he
      ? booking.hotel.city_he
      : booking.hotel?.city || '';

    const heroImage = booking.experience?.hero_image || booking.hotel?.hero_image || '';

    console.log("Sending confirmation to:", customerEmail);

    const emailHtml = `
<!DOCTYPE html>
<html dir="${isHebrew ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">STAYMAKOM</h1>
              <p style="color: #c9a87c; margin: 10px 0 0; font-size: 14px; letter-spacing: 1px;">
                ${isHebrew ? 'יותר משהייה, זו חוויה' : 'MORE THAN A STAY, IT\'S AN EXPERIENCE'}
              </p>
            </td>
          </tr>
          ${heroImage ? `
          <tr>
            <td>
              <img src="${heroImage}" alt="${escapeHTML(experienceTitle)}" style="width: 100%; height: 200px; object-fit: cover;">
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #e8f5e9; color: #2e7d32; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  ✓ ${isHebrew ? 'הזמנה התקבלה' : 'Booking Received'}
                </div>
              </div>
              <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 24px; font-weight: 500; text-align: center;">
                ${isHebrew ? `שלום ${escapeHTML(customerName)},` : `Hello ${escapeHTML(customerName)},`}
              </h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
                ${isHebrew 
                  ? 'תודה על ההזמנה שלך! קיבלנו את הבקשה והמלון יבדוק אותה בקרוב.'
                  : 'Thank you for your booking! We\'ve received your request and the hotel will review it shortly.'
                }
              </p>
              <div style="background-color: #f9f9f6; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1a1a1a; margin: 0 0 20px; font-size: 18px; font-weight: 600; border-bottom: 2px solid #c9a87c; padding-bottom: 10px;">
                  ${isHebrew ? 'פרטי ההזמנה' : 'Booking Details'}
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px;">
                        ${isHebrew ? 'חוויה' : 'Experience'}
                      </p>
                      <p style="color: #1a1a1a; font-size: 16px; margin: 0; font-weight: 600;">${escapeHTML(experienceTitle)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px;">
                        ${isHebrew ? 'מלון' : 'Hotel'}
                      </p>
                      <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${escapeHTML(hotelName)}${hotelCity ? ` · ${escapeHTML(hotelCity)}` : ''}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px;">
                        ${isHebrew ? 'צ\'ק-אין' : 'Check-in'}
                      </p>
                      <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${formatDate(booking.checkin, isHebrew)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px;">
                        ${isHebrew ? 'צ\'ק-אאוט' : 'Check-out'}
                      </p>
                      <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${formatDate(booking.checkout, isHebrew)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px;">
                        ${isHebrew ? 'אורחים' : 'Guests'}
                      </p>
                      <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${booking.party_size} ${isHebrew ? 'אורחים' : booking.party_size === 1 ? 'guest' : 'guests'}</p>
                    </td>
                  </tr>
                  ${booking.selected_room_name ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 1px;">
                        ${isHebrew ? 'חדר' : 'Room'}
                      </p>
                      <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${escapeHTML(booking.selected_room_name)}</p>
                    </td>
                  </tr>
                  ` : ''}
                </table>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #1a1a1a;">
                  <table width="100%">
                    <tr>
                      <td>
                        <p style="color: #1a1a1a; font-size: 18px; margin: 0; font-weight: 600;">
                          ${isHebrew ? 'סה"כ' : 'Total'}
                        </p>
                      </td>
                      <td style="text-align: ${isHebrew ? 'left' : 'right'};">
                        <p style="color: #1a1a1a; font-size: 24px; margin: 0; font-weight: 700;">
                          ${formatCurrency(booking.total_price, booking.currency || 'ILS')}
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="background-color: #fff8e1; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h4 style="color: #f57c00; margin: 0 0 10px; font-size: 14px; font-weight: 600;">
                  ${isHebrew ? '⏳ מה הלאה?' : '⏳ What\'s next?'}
                </h4>
                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                  ${isHebrew 
                    ? 'המלון יבדוק את ההזמנה שלך ויאשר אותה תוך 24-48 שעות. תקבל/י מייל נוסף עם האישור הסופי.'
                    : 'The hotel will review your booking and confirm it within 24-48 hours. You\'ll receive another email with the final confirmation.'
                  }
                </p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://staymakom.com/account" style="display: inline-block; background-color: #c9a87c; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 4px; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                      ${isHebrew ? 'צפה בהזמנות שלי' : 'VIEW MY BOOKINGS'}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f6; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Staymakom. ${isHebrew ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
              </p>
              <p style="color: #999999; font-size: 12px; margin: 10px 0 0;">
                ${isHebrew ? 'שאלות? צור/י קשר' : 'Questions? Contact us at'} 
                <a href="mailto:shana@staymakom.com" style="color: #c9a87c;">shana@staymakom.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Staymakom Reservations <reservations@staymakom.com>",
        to: [customerEmail],
        reply_to: "shana@staymakom.com",
        subject: isHebrew 
          ? `✓ הזמנתך התקבלה - ${experienceTitle}`
          : `✓ Booking received - ${experienceTitle}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log("Booking confirmation sent successfully to:", customerEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Booking confirmation sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
