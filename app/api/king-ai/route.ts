import { exec } from "child_process";
import { NextRequest, NextResponse } from "next/server";

/**
 * Thực thi một câu lệnh curl và trả về response dưới dạng JSON, text hoặc image.
 * @param curlCommand Câu lệnh curl cần thực thi.
 * @param responseType Loại response: 'json', 'text', 'image'.
 * @returns Promise chứa response và các field phụ trợ.
 */
async function executeCurlWithType(
  curlCommand: string,
  responseType: "json" | "text" | "image" = "json"
): Promise<{
  rawResponse: string;
  parsedResponse?: any;
  imageBase64List?: string[];
  imageUrlList?: string[];
}> {
  return new Promise((resolve, reject) => {
    const safeCurl = curlCommand.includes("-s")
      ? curlCommand
      : curlCommand.replace("curl", "curl -s");

    exec(safeCurl, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Lỗi khi chạy curl: ${error.message}`));
      } else if (stderr) {
        console.warn(`⚠️ stderr: ${stderr}`);
        // Một số API có thể trả stderr nhưng vẫn thành công
      }

      const rawResponse = stdout.trim();
      try {
        if (responseType === "json") {
          const parsedResponse = JSON.parse(rawResponse);
          resolve({ rawResponse, parsedResponse });
        } else if (responseType === "image") {
          const parsedResponse = JSON.parse(rawResponse);
          const imageBase64List = parsedResponse.images || [];
          const imageUrlList = parsedResponse.imageUrls || [];
          resolve({
            rawResponse,
            parsedResponse,
            imageBase64List,
            imageUrlList,
          });
        } else {
          resolve({ rawResponse });
        }
      } catch (err) {
        // Nếu không parse được JSON, trả về raw text
        resolve({ rawResponse });
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { curl, type = "json" } = await req.json();

    const response = await executeCurlWithType(curl, type);
    const parsedResponse = response.parsedResponse || null;
    const history = parsedResponse.data.history;
    const images: string[] = [];
    history.forEach((element: any) => {
      element.works.forEach((item: any) => {
        images.push(item.resource.resource);
      });
    });
    console.log(images);
    return NextResponse.json({
      images,
      text: "success",
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
