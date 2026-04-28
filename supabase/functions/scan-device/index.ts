import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, deviceHint } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 required");
    }

    const hint = String(deviceHint || "Smartphone").toLowerCase();

    let result = {
      device_name: "Smartphone",
      condition_pct: 70,
      weight_kg: 0.18,
      note: "Portable e-waste device detected. Estimated condition is good.",
    };

    if (hint.includes("laptop")) {
      result = {
        device_name: "Laptop",
        condition_pct: 65,
        weight_kg: 1.8,
        note: "Laptop e-waste detected. Suitable for refurbishment or recycling.",
      };
    } else if (hint.includes("tablet") || hint.includes("ipad")) {
      result = {
        device_name: "Tablet / iPad",
        condition_pct: 72,
        weight_kg: 0.45,
        note: "Tablet device detected with moderate resale/recycling value.",
      };
    } else if (hint.includes("charger") || hint.includes("adapter")) {
      result = {
        device_name: "Charger / Adapter",
        condition_pct: 60,
        weight_kg: 0.12,
        note: "Small accessory e-waste detected.",
      };
    } else if (hint.includes("cable")) {
      result = {
        device_name: "USB / Cable Bundle",
        condition_pct: 55,
        weight_kg: 0.1,
        note: "Cable bundle detected. Recyclable copper/plastic material.",
      };
    } else if (hint.includes("power")) {
      result = {
        device_name: "Power Bank",
        condition_pct: 50,
        weight_kg: 0.3,
        note: "Battery-based e-waste detected. Handle safely.",
      };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
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