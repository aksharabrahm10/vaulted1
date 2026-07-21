import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ExtractedReceipt {
  store_name: string;
  store_category: string;
  receipt_date: string;
  total_amount: number;
  subtotal_amount: number;
  tax_amount: number;
  item_count: number;
  items: ReceiptItem[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured. Please add an OpenAI API key." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a receipt OCR assistant. Extract structured data from the receipt image. Return ONLY valid JSON with this exact schema:
{
  "store_name": "string - the store/merchant name",
  "store_category": "string - one of: Grocery, Electronics, Clothing, Coffee, Restaurant, Gas, Pharmacy, Home, Sporting, Books, Other",
  "receipt_date": "string - YYYY-MM-DD format, use the date on the receipt",
  "total_amount": number - total paid,
  "subtotal_amount": number - subtotal before tax (0 if not shown),
  "tax_amount": number - tax amount (0 if not shown),
  "item_count": number - total number of line items,
  "items": [{"name": "string", "quantity": number, "price": number}]
}
Rules:
- Extract every individual line item from the receipt.
- If a date is not visible, use today's date.
- All amounts should be numbers (no currency symbols).
- Return ONLY the JSON, no markdown, no explanation.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all data from this receipt."
              },
              {
                type: "image_url",
                image_url: { url: image, detail: "high" }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `AI extraction failed: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content returned from AI" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip markdown code fences if present
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const extracted: ExtractedReceipt = JSON.parse(jsonStr);

    return new Response(
      JSON.stringify({ receipt: extracted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
