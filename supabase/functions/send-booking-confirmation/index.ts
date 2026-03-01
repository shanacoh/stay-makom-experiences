import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHTML = (str: string): string => {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = { ILS: '₪', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || currency}${amount.toLocaleString()}`;
};

const formatDate = (dateStr: string, isHebrew: boolean): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-confirmation function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      to,
      guestName,
      experienceTitle,
      hotelName,
      roomName,
      boardType,
      checkIn,
      checkOut,
      nights,
      partySize,
      totalPrice,
      currency = "USD",
      bookingRef,
      hgBookingId,
      remarks,
      specialRequests,
      lang,
      cancellationPolicy,
    } = body;

    console.log("Processing booking confirmation for:", to, "ref:", bookingRef);

    if (!to) {
      throw new Error("Recipient email (to) is required");
    }

    const isHebrew = lang === 'he';
    const customerName = escapeHTML(guestName || 'Guest');
    const safeTitle = escapeHTML(experienceTitle || 'Experience');
    const safeHotel = escapeHTML(hotelName || 'Hotel');
    const safeRoom = escapeHTML(roomName || '');
    const safeRef = escapeHTML(bookingRef || hgBookingId || '');

    // Build remarks HTML
    const genericFilter = /general message that should be shown/i;
    const filteredRemarks = Array.isArray(remarks)
      ? remarks.filter((r: string) => r && !genericFilter.test(r))
      : [];
    const remarksHtml = filteredRemarks.length > 0
      ? `<div style="background-color:#fff8e1;border-radius:8px;padding:20px;margin-bottom:20px;">
           ${filteredRemarks.map((r: string) => `<p style="color:#666;font-size:14px;line-height:1.6;margin:4px 0;">• ${escapeHTML(r)}</p>`).join('')}
         </div>`
      : '';

    // Build cancellation policy HTML
    let cancellationHtml = '';
    if (cancellationPolicy?.summaryText) {
      const bgColor = cancellationPolicy.isNonRefundable ? '#ffebee' : '#e8f5e9';
      const textColor = cancellationPolicy.isNonRefundable ? '#c62828' : '#2e7d32';
      const icon = cancellationPolicy.isNonRefundable ? '⚠️' : '✓';
      const label = isHebrew ? 'מדיניות ביטול' : 'Cancellation Policy';
      cancellationHtml = `
        <div style="background-color:${bgColor};border-radius:8px;padding:15px;margin-bottom:20px;">
          <p style="color:${textColor};font-size:14px;font-weight:600;margin:0 0 4px;">${icon} ${label}</p>
          <p style="color:${textColor};font-size:13px;margin:0;">${escapeHTML(cancellationPolicy.summaryText)}</p>
        </div>`;
    }

    const emailHtml = `
<!DOCTYPE html>
<html dir="${isHebrew ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#1a1a1a 0%,#333 100%);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:300;letter-spacing:2px;">STAYMAKOM</h1>
          <p style="color:#c9a87c;margin:10px 0 0;font-size:14px;letter-spacing:1px;">${isHebrew ? 'יותר משהייה, זו חוויה' : "MORE THAN A STAY, IT'S AN EXPERIENCE"}</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="text-align:center;margin-bottom:30px;">
            <div style="display:inline-block;background-color:#e8f5e9;color:#2e7d32;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;">
              ✓ ${isHebrew ? 'הזמנה אושרה' : 'Booking Confirmed'}
            </div>
          </div>
          <h2 style="color:#1a1a1a;margin:0 0 10px;font-size:24px;font-weight:500;text-align:center;">
            ${isHebrew ? `שלום ${customerName},` : `Hello ${customerName},`}
          </h2>
          <p style="color:#666;font-size:16px;line-height:1.6;text-align:center;margin-bottom:30px;">
            ${isHebrew ? 'ההזמנה שלך אושרה בהצלחה!' : 'Your booking has been confirmed!'}
          </p>
          <div style="background-color:#f9f9f6;border-radius:8px;padding:25px;margin-bottom:30px;">
            <h3 style="color:#1a1a1a;margin:0 0 20px;font-size:18px;font-weight:600;border-bottom:2px solid #c9a87c;padding-bottom:10px;">
              ${isHebrew ? 'פרטי ההזמנה' : 'Booking Details'}
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">${isHebrew ? 'מספר הזמנה' : 'Reference'}</p>
                <p style="color:#1a1a1a;font-size:16px;margin:0;font-weight:600;">${safeRef}</p>
              </td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">${isHebrew ? 'חוויה' : 'Experience'}</p>
                <p style="color:#1a1a1a;font-size:16px;margin:0;font-weight:600;">${safeTitle}</p>
              </td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">${isHebrew ? 'מלון' : 'Hotel'}</p>
                <p style="color:#1a1a1a;font-size:16px;margin:0;">${safeHotel}</p>
              </td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">${isHebrew ? "צ'ק-אין" : 'Check-in'}</p>
                <p style="color:#1a1a1a;font-size:16px;margin:0;">${formatDate(checkIn, isHebrew)}</p>
              </td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">${isHebrew ? "צ'ק-אאוט" : 'Check-out'}</p>
                <p style="color:#1a1a1a;font-size:16px;margin:0;">${formatDate(checkOut, isHebrew)} (${nights} ${isHebrew ? 'לילות' : nights === 1 ? 'night' : 'nights'})</p>
              </td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">${isHebrew ? 'אורחים' : 'Guests'}</p>
                <p style="color:#1a1a1a;font-size:16px;margin:0;">${partySize} ${isHebrew ? 'אורחים' : partySize === 1 ? 'guest' : 'guests'}</p>
              </td></tr>
              ${safeRoom ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
                <p style="color:#999;font-size:12px;margin:0 0 3px;text-transform:uppercase;letter-spacing:1px;">${isHebrew ? 'חדר' : 'Room'}</p>
                <p style="color:#1a1a1a;font-size:16px;margin:0;">${safeRoom}</p>
              </td></tr>` : ''}
            </table>
            <div style="margin-top:20px;padding-top:20px;border-top:2px solid #1a1a1a;">
              <table width="100%"><tr>
                <td><p style="color:#1a1a1a;font-size:18px;margin:0;font-weight:600;">${isHebrew ? 'סה"כ' : 'Total'}</p></td>
                <td style="text-align:${isHebrew ? 'left' : 'right'};"><p style="color:#1a1a1a;font-size:24px;margin:0;font-weight:700;">${formatCurrency(totalPrice || 0, currency)}</p></td>
              </tr></table>
            </div>
          </div>
          ${cancellationHtml}
          ${remarksHtml}
          ${specialRequests ? `<div style="background-color:#f0f4ff;border-radius:8px;padding:15px;margin-bottom:20px;">
            <p style="color:#666;font-size:13px;margin:0;"><strong>${isHebrew ? 'בקשות מיוחדות:' : 'Special requests:'}</strong> ${escapeHTML(specialRequests)}</p>
          </div>` : ''}
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="https://staymakom.com/account" style="display:inline-block;background-color:#c9a87c;color:#fff;text-decoration:none;padding:16px 40px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:1px;">
              ${isHebrew ? 'צפה בהזמנות שלי' : 'VIEW MY BOOKINGS'}
            </a>
          </td></tr></table>
        </td></tr>
        <tr><td style="background-color:#f9f9f6;padding:30px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} Staymakom. ${isHebrew ? 'כל הזכויות שמורות.' : 'All rights reserved.'}</p>
          <p style="color:#999;font-size:12px;margin:10px 0 0;">${isHebrew ? 'שאלות? צור/י קשר' : 'Questions? Contact us at'} <a href="mailto:shana@staymakom.com" style="color:#c9a87c;">shana@staymakom.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Staymakom Reservations <reservations@staymakom.com>",
        to: [to],
        reply_to: "shana@staymakom.com",
        subject: isHebrew
          ? `✓ הזמנתך אושרה - ${experienceTitle || 'Experience'}`
          : `✓ Booking confirmed - ${experienceTitle || 'Experience'}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log("Booking confirmation sent successfully to:", to);

    return new Response(
      JSON.stringify({ success: true, message: "Booking confirmation sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
