import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import FormData from "form-data";
const promptDefault =
  "Viết một prompt mô tả hình ảnh này bằng tiếng anh thật chi tiết và bỏ qua text trong ảnh. Chỉ trả về prompt";
const generateImageFromPixlr = async (
  imageBase64: string,
  prompt: string,
  cookie: string
) => {
  try {
    let data = new FormData();
    const imageBuffer = Buffer.from(imageBase64, "base64");
    data.append("amount", "2");
    data.append("width", "576");
    data.append("height", "1024");
    data.append("personal", "true");
    data.append("prompt", `${prompt}`);
    data.append("style", "photographic");
    data.append("influence", "100");
    data.append("model", "fast");
    data.append("image", imageBuffer, {
      filename: "image.png",
      contentType: "image/png",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://pixlr.com/api/ai/remix/",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        origin: "https://pixlr.com",
        priority: "u=1, i",
        referer: "https://pixlr.com/vn/image-generator/",
        "sec-ch-ua":
          '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        Cookie: cookie,
      },
      data: data,
    };

    const respose = await axios.request(config);

    const images = respose.data.data.images;
    return images.map((item: any) => item.image);
  } catch (err: any) {
    console.log(err.response);
    return NextResponse.json({ error: "Lỗi generate image" }, { status: 500 });
  }
};

const createPromptWithGenmini = async (
  prompt: string,
  image: string,
  cookie: string
) => {
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

    const images = await generateImageFromPixlr(
      base64Image,
      response.text || "",
      cookie
    );

    // if (!response.ok) {
    //   const errorJson = await response.json();
    //   return NextResponse.json(
    //     { error: errorJson.error?.message || "API request failed" },
    //     { status: response.status }
    //   );
    // }

    return NextResponse.json({ text: response.text, images });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
};

const createPromptWithDeepseek = async (prompt: string, image: string) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_base64",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data.choices[0].message.content);
    return NextResponse.json({
      text: response.data.choices[0].message.content,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export async function POST(req: NextRequest) {
  try {
    const { prompt = promptDefault, image, cookie } = await req.json();

    // Chuẩn hóa base64 (bỏ prefix data:image/png;base64,...)
    const base64Image = image?.replace(/^data:image\/\w+;base64,/, "");

    return await createPromptWithGenmini(prompt, base64Image, cookie);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Access Key: AmRhBALRhJDRrahpBg4hGbbpEJBfYbdP
// Secret Key: TMetdDTeNK3GJCrmR8GDD3aF4HDQ8D3r
