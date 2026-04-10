import crypto from "crypto";
import { NextResponse } from "next/server";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

export async function POST(request: Request) {
  try {
    // 🔹 Check env variables
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { success: false, message: "Missing Cloudinary environment variables" },
        { status: 500 }
      );
    }

    // 🔹 Get file
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File is required" },
        { status: 400 }
      );
    }

    // 🔹 Validate file type (PDF only)
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // 🔹 Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "alumunity/resumes";

    // 🔹 Signature params (ONLY include what you send)
    const signatureParams: Record<string, string | number> = {
      access_mode: "public",
      folder,
      timestamp,
      type: "upload",
    };

    if (UPLOAD_PRESET) {
      signatureParams.upload_preset = UPLOAD_PRESET;
    }

    // 🔹 Generate signature
    const signatureString =
      Object.keys(signatureParams)
        .sort()
        .map((key) => `${key}=${signatureParams[key]}`)
        .join("&") + API_SECRET;

    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    // 🔹 Create FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("api_key", API_KEY);
    cloudinaryFormData.append("timestamp", String(timestamp));
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("type", "upload");
    cloudinaryFormData.append("access_mode", "public");

    if (UPLOAD_PRESET) {
      cloudinaryFormData.append("upload_preset", UPLOAD_PRESET);
    }

    cloudinaryFormData.append("signature", signature);

    // 🔥 IMPORTANT: use /auto/upload for PDFs
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const data = await response.json();

    // 🔹 Handle Cloudinary error
    if (!response.ok) {
      const cloudinaryMessage = data?.error?.message || "Cloudinary upload failed";
      const normalizedMessage = String(cloudinaryMessage).toLowerCase();

      if (
        response.status === 401 ||
        normalizedMessage.includes("pdf") ||
        normalizedMessage.includes("deny") ||
        normalizedMessage.includes("not allowed")
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cloudinary is blocking PDF delivery. In Cloudinary dashboard enable 'Allow delivery of PDF and ZIP files' in Security settings, then re-upload the file.",
          },
          { status: response.status || 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: cloudinaryMessage,
        },
        { status: response.status || 500 }
      );
    }

    // ✅ Success response
    return NextResponse.json({
      success: true,
      data: {
        url: data.secure_url,          // 🔥 Use this everywhere
        publicId: data.public_id,     // useful for delete/update later
        format: data.format,
        resourceType: data.resource_type,
        originalFilename: data.original_filename,
        bytes: data.bytes,
        createdAt: data.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unexpected upload error",
      },
      { status: 500 }
    );
  }
}