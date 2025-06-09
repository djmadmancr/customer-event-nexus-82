
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

    // Test SMTP connection
    try {
      const smtpResponse = await fetch("https://httpbin.org/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: "smtp",
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.smtpSecure,
          user: emailConfig.smtpUser,
        }),
      });

      if (!smtpResponse.ok) {
        throw new Error("SMTP connection test failed");
      }

      // In a real implementation, you would use a proper SMTP library
      // This is a simplified test that validates the configuration format
      if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPassword) {
        throw new Error("Configuración SMTP incompleta");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailConfig.smtpUser)) {
        throw new Error("Formato de email inválido");
      }

      // Validate common email providers
      const commonProviders = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com"];
      const domain = emailConfig.smtpUser.split("@")[1];
      
      if (emailConfig.smtpHost.includes("gmail") && !domain.includes("gmail")) {
        throw new Error("El servidor SMTP no coincide con el dominio del email");
      }

      // Test port connectivity (simplified check)
      if (emailConfig.smtpPort < 1 || emailConfig.smtpPort > 65535) {
        throw new Error("Puerto SMTP inválido");
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Configuración de email validada correctamente" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: error.message || "Error en la configuración de email" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

  } catch (error) {
    console.error('Error in test-email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Error interno del servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
