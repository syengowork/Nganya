import 'server-only';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Vision Client
// Ensure you have GOOGLE_APPLICATION_CREDENTIALS in your .env
const client = new ImageAnnotatorClient();

export async function scanImageForSafety(file: File): Promise<boolean> {
  try {
    // 1. If no Google Keys are set, we return TRUE (Safe) to allow development
    // In production, this should throw an error instead.
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_API_KEY) {
      console.warn("⚠️ Google Vision API keys missing. Skipping safety check (DEV MODE).");
      return true;
    }

    // 2. Convert File to Buffer for Google API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Send to Google SafeSearch
    const [result] = await client.safeSearchDetection(buffer);
    const detections = result.safeSearchAnnotation;

    if (!detections) return true; // No results = assume safe

    // 4. Check for Likelihoods (Adult, Violence, Racy)
    // Possible values: UNKNOWN, VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY
    const isExplicit = 
      detections.adult === 'LIKELY' || 
      detections.adult === 'VERY_LIKELY' ||
      detections.violence === 'LIKELY' || 
      detections.violence === 'VERY_LIKELY' ||
      detections.racy === 'VERY_LIKELY'; // We allow 'LIKELY' racy for art/graffiti, but block VERY_LIKELY

    if (isExplicit) {
      console.error(`🚨 Image rejected by AI: Adult(${detections.adult}), Violence(${detections.violence})`);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Safety Scan Error:", error);
    // Fail closed: If scanner breaks, don't allow upload
    return false;
  }
}