
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, message, proposal } = await req.json()

    // TODO: Implement actual email sending logic
    // This is a placeholder function
    console.log('Email notification:', {
      to,
      subject,
      message,
      proposal
    })

    // Simulate email sending
    const emailSent = {
      success: true,
      message: 'Email notification logged (placeholder implementation)',
      data: {
        to,
        subject,
        message,
        proposal,
        sentAt: new Date().toISOString()
      }
    }

    return new Response(
      JSON.stringify(emailSent),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
