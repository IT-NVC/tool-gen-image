import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const promptDefault =
  "Describe this image concisely, highlighting key elements and overall mood. Ignore text.";

const createPromptWithGenmini = async (prompt: string, image: string) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Chuẩn hóa base64 (bỏ prefix data:image/png;base64,...)
    const base64Image = image?.replace(/^data:image\/\w+;base64,/, "");

    // // Xây payload theo đúng docs Google Gemini Vision
    const contents: Array<{
      inlineData?: {
        mimeType: string;
        data: string;
      };
      text?: string;
    }> = [];

    contents.push({
      text: prompt || promptDefault,
    });

    if (base64Image) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
    });

    // if (!response.ok) {
    //   const errorJson = await response.json();
    //   return NextResponse.json(
    //     { error: errorJson.error?.message || "API request failed" },
    //     { status: response.status }
    //   );
    // }

    return NextResponse.json({ text: response.text });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
};

export async function POST(req: NextRequest) {
  try {
    const { prompt = promptDefault, image } = await req.json();

    // Chuẩn hóa base64 (bỏ prefix data:image/png;base64,...)
    const base64Image = image?.replace(/^data:image\/\w+;base64,/, "");

    return await createPromptWithGenmini(prompt, base64Image);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
