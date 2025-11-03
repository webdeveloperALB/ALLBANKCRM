import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GeoLocation {
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { bank_key, user_id, is_online } = await req.json();

    if (!bank_key || !user_id) {
      throw new Error("Missing required parameters");
    }

    const bankUrl = Deno.env.get(`SUPABASE_${bank_key.toUpperCase()}_URL`);
    const bankKey = Deno.env.get(`SUPABASE_${bank_key.toUpperCase()}_SERVICE_ROLE_KEY`);

    if (!bankUrl || !bankKey) {
      throw new Error(`Invalid bank configuration for ${bank_key}`);
    }

    const supabase = createClient(bankUrl, bankKey);

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    let geoData: GeoLocation = {};
    
    if (clientIp && clientIp !== "unknown") {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
        if (geoResponse.ok) {
          const geo = await geoResponse.json();
          geoData = {
            country: geo.country_name,
            country_code: geo.country_code,
            city: geo.city,
            region: geo.region,
          };
        }
      } catch (error) {
        console.error("Error fetching geolocation:", error);
      }
    }

    const { data: existingPresence } = await supabase
      .from("user_presence")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    let result;
    if (existingPresence) {
      const { data, error } = await supabase
        .from("user_presence")
        .update({
          is_online: is_online ?? true,
          last_seen: new Date().toISOString(),
          ip_address: clientIp,
          ...geoData,
        })
        .eq("user_id", user_id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("user_presence")
        .insert({
          user_id,
          is_online: is_online ?? true,
          last_seen: new Date().toISOString(),
          ip_address: clientIp,
          ...geoData,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
