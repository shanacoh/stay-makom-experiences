import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GiftCardEmailRequest {
  giftCardId: string;
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
  return `${symbols[currency] || currency}${amount}`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-gift-card function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { giftCardId }: GiftCardEmailRequest = await req.json();
    console.log("Processing gift card:", giftCardId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch gift card details
    const { data: giftCard, error: fetchError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("id", giftCardId)
      .single();

    if (fetchError || !giftCard) {
      console.error("Gift card not found:", fetchError);
      throw new Error("Gift card not found");
    }

    console.log("Gift card found:", giftCard.code);

    const isHebrew = giftCard.language === 'he';
    
    // Email to recipient
    const recipientEmailHtml = `
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
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">STAYMAKOM</h1>
              <p style="color: #c9a87c; margin: 10px 0 0; font-size: 14px; letter-spacing: 1px;">
                ${isHebrew ? 'יותר משהייה, זו חוויה' : 'MORE THAN A STAY, IT\'S AN EXPERIENCE'}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px; font-weight: 500; text-align: center;">
                ${isHebrew ? '🎁 קיבלת מתנה!' : '🎁 You\'ve Received a Gift!'}
              </h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
                ${isHebrew 
                  ? `<strong>${escapeHTML(giftCard.sender_name)}</strong> שלח/ה לך כרטיס מתנה של Staymakom!`
                  : `<strong>${escapeHTML(giftCard.sender_name)}</strong> has sent you a Staymakom gift card!`
                }
              </p>

              ${giftCard.message ? `
              <div style="background-color: #f9f9f6; border-${isHebrew ? 'right' : 'left'}: 4px solid #c9a87c; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 10px; font-weight: 600;">
                  ${isHebrew ? 'ההודעה שלהם:' : 'Their message:'}
                </p>
                <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0; font-style: italic;">
                  "${escapeHTML(giftCard.message)}"
                </p>
              </div>
              ` : ''}

              <!-- Gift Card Code -->
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="color: #c9a87c; font-size: 12px; margin: 0 0 10px; letter-spacing: 2px;">
                  ${isHebrew ? 'קוד הכרטיס שלך' : 'YOUR GIFT CARD CODE'}
                </p>
                <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0 0 15px; letter-spacing: 4px; font-family: monospace;">
                  ${giftCard.code}
                </p>
                <p style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0;">
                  ${formatCurrency(giftCard.amount, giftCard.currency || 'ILS')}
                </p>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
                ${isHebrew 
                  ? 'השתמש/י בקוד זה בעת ביצוע ההזמנה באתר שלנו כדי לממש את המתנה שלך.'
                  : 'Use this code during checkout on our website to redeem your gift.'
                }
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://staymakom.com" style="display: inline-block; background-color: #c9a87c; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 4px; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                      ${isHebrew ? 'גלה חוויות' : 'DISCOVER EXPERIENCES'}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">
                ${isHebrew 
                  ? `כרטיס זה תקף עד ${new Date(giftCard.expires_at).toLocaleDateString('he-IL')}`
                  : `This gift card is valid until ${new Date(giftCard.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                }
              </p>
            </td>
          </tr>

          <!-- Footer -->
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

    // Send email to recipient via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Staymakom Gifts <gifts@staymakom.com>",
        to: [giftCard.recipient_email],
        reply_to: "shana@staymakom.com",
        subject: isHebrew 
          ? `🎁 ${giftCard.sender_name} שלח/ה לך מתנה מ-Staymakom!`
          : `🎁 ${giftCard.sender_name} sent you a Staymakom gift!`,
        html: recipientEmailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log("Email sent successfully to:", giftCard.recipient_email);

    // Update gift card status
    const { error: updateError } = await supabase
      .from("gift_cards")
      .update({ 
        status: "sent",
        sent_at: new Date().toISOString()
      })
      .eq("id", giftCardId);

    if (updateError) {
      console.error("Error updating gift card status:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Gift card email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-gift-card function:", error);
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
