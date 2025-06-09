
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { emailConfig } = await req.json();

    // Comprehensive validation of email configuration
    console.log('Testing email configuration:', {
      smtpHost: emailConfig.smtpHost,
      smtpPort: emailConfig.smtpPort,
      smtpUser: emailConfig.smtpUser,
      fromEmail: emailConfig.fromEmail
    });

    // Check if all required fields are present
    if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPassword || !emailConfig.fromEmail) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Configuración SMTP incompleta. Faltan campos requeridos." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailConfig.smtpUser)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Formato de email de usuario SMTP inválido" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!emailRegex.test(emailConfig.fromEmail)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Formato de email del remitente inválido" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate port number
    if (emailConfig.smtpPort < 1 || emailConfig.smtpPort > 65535) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Puerto SMTP inválido. Debe estar entre 1 y 65535." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check common SMTP providers and their expected configurations
    const commonProviders = {
      'gmail.com': { host: 'smtp.gmail.com', port: [587, 465] },
      'outlook.com': { host: 'smtp-mail.outlook.com', port: [587] },
      'hotmail.com': { host: 'smtp-mail.outlook.com', port: [587] },
      'yahoo.com': { host: 'smtp.mail.yahoo.com', port: [587, 465] }
    };

    const domain = emailConfig.smtpUser.split("@")[1]?.toLowerCase();
    
    if (domain && commonProviders[domain]) {
      const expected = commonProviders[domain];
      if (!emailConfig.smtpHost.toLowerCase().includes(expected.host.toLowerCase())) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: `Para ${domain}, se esperaba el servidor SMTP: ${expected.host}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
        });
      }
      
      if (!expected.port.includes(emailConfig.smtpPort)) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: `Para ${domain}, se esperaban los puertos: ${expected.port.join(' o ')}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Test DNS resolution of SMTP host (simplified check)
    try {
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${emailConfig.smtpHost}&type=A`);
      const dnsData = await dnsResponse.json();
      
      if (dnsData.Status !== 0 || !dnsData.Answer || dnsData.Answer.length === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: `No se pudo resolver el nombre del servidor SMTP: ${emailConfig.smtpHost}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } catch (error) {
      console.error('DNS resolution error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Error al verificar la conectividad del servidor SMTP" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // If using Gmail, check for App Password requirements
    if (domain === 'gmail.com') {
      // App passwords are typically 16 characters without spaces
      const passwordLength = emailConfig.smtpPassword.replace(/\s/g, '').length;
      if (passwordLength === 16 && /^[a-zA-Z0-9]+$/.test(emailConfig.smtpPassword.replace(/\s/g, ''))) {
        // Likely using App Password - good
      } else if (emailConfig.smtpPassword.length < 8) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: "Para Gmail, se recomienda usar una 'Contraseña de aplicación' de 16 caracteres en lugar de tu contraseña normal." 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // All validations passed
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Configuración de email validada correctamente. Los parámetros parecen ser correctos." 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in test-email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Error interno del servidor: ${error.message}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
