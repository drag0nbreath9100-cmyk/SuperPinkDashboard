import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        let body;
        try {
            const rawBody = await req.text();
            console.log("Proxy Request Body:", rawBody);
            body = rawBody ? JSON.parse(rawBody) : {};
        } catch (e) {
            console.error("Failed to parse request body:", e);
            throw new Error("Invalid request body");
        }

        const response = await fetch("https://n8n-production-cebd.up.railway.app/webhook/workout-ai-plan-generator", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body),
        });

        console.log("n8n Status:", response.status);
        console.log("n8n Content-Type:", response.headers.get("content-type"));

        if (!response.ok) {
            const errorText = await response.text();
            console.error("n8n Error Body:", errorText);
            return NextResponse.json(
                { error: `n8n Error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const text = await response.text();
        console.log("n8n Raw Response Length:", text.length);
        console.log("n8n Raw Response Preview:", text.substring(0, 100));

        if (!text) {
            return NextResponse.json({ error: `Empty response from n8n. Status: ${response.status}` }, { status: 500 });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            return NextResponse.json({ error: "Invalid JSON from n8n", details: text.substring(0, 100) }, { status: 500 });
        }
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}
