import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  userId: string;
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { userId, title, description, variant = 'default', priority = 'medium' }: NotificationEmailRequest = await req.json();

    console.log(`Sending notification email to user ${userId}: ${title}`);

    // Get user profile with email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.email) {
      console.error('Failed to get user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User not found or no email available' }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Determine email styling based on variant and priority
    const getEmailStyle = (variant: string, priority: string) => {
      const baseColors = {
        default: { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' },
        success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
        warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
        destructive: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
      };
      
      const priorityColors = {
        low: '#6b7280',
        medium: '#3b82f6', 
        high: '#f59e0b',
        critical: '#ef4444'
      };

      return {
        ...baseColors[variant as keyof typeof baseColors] || baseColors.default,
        priority: priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium
      };
    };

    const style = getEmailStyle(variant, priority);
    const priorityText = priority.toUpperCase();
    const isUrgent = priority === 'critical' || priority === 'high';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Africa World Cargo</h1>
              <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Logistics Management System</p>
            </div>

            <!-- Priority Banner (if urgent) -->
            ${isUrgent ? `
              <div style="background: ${style.priority}; color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 14px;">
                🚨 ${priorityText} PRIORITY NOTIFICATION
              </div>
            ` : ''}

            <!-- Content -->
            <div style="padding: 24px;">
              <div style="background: ${style.bg}; border-left: 4px solid ${style.border}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <div style="flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; background: ${style.priority}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                    ${priority === 'critical' ? '!' : priority === 'high' ? '⚠' : priority === 'low' ? 'ℹ' : '●'}
                  </div>
                  <div style="flex: 1;">
                    <h2 style="color: ${style.text}; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${title}</h2>
                    <p style="color: ${style.text}; margin: 0; font-size: 14px; line-height: 1.5;">${description}</p>
                  </div>
                </div>
              </div>

              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                  <strong>Sent to:</strong> ${profile.name || profile.email}<br>
                  <strong>Priority:</strong> ${priorityText}<br>
                  <strong>Time:</strong> ${new Date().toLocaleString()}
                </p>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://your-app-url.com'}" 
                   style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Access System Dashboard
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                This is an automated notification from Africa World Cargo Logistics Management System.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const subject = isUrgent ? `🚨 [${priorityText}] ${title}` : `📢 ${title}`;

    const emailResponse = await resend.emails.send({
      from: "Africa World Cargo <notifications@resend.dev>",
      to: [profile.email],
      subject: subject,
      html: emailHtml,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      sentTo: profile.email 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
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