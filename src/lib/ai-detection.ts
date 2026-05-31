/**
 * AI-powered device detection using TensorFlow.js and MobileNet
 * Classifies waste devices from images and estimates their condition
 */

import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

let modelInstance: any = null;

/**
 * Load the pre-trained MobileNet model for image classification
 * Model is cached in memory for subsequent calls
 */
export async function loadMobileNetModel() {
  if (modelInstance) {
    return modelInstance;
  }

  try {
    await tf.ready();
    const model = await mobilenet.load();
    modelInstance = model;
    return model;
  } catch (error) {
    console.error("Failed to load MobileNet model:", error);
    throw new Error("AI model loading failed. Please try again.");
  }
}

/**
 * Unload the model to free up memory
 */
export function unloadModel() {
  if (modelInstance) {
    modelInstance.dispose();
    modelInstance = null;
  }
}

/**
 * Classify an image and return predictions
 * @param source - HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, or ImageData
 * @param maxPredictions - Maximum number of predictions to return (default: 3)
 */
export async function classifyImage(source: any, maxPredictions = 3) {
  const model = await loadMobileNetModel();
  return model.classify(source, maxPredictions);
}

/**
 * Map AI prediction labels to device types
 * Uses fuzzy matching for better accuracy
 */
export function mapLabelToDeviceId(label: string): string | null {
  const l = label.toLowerCase();

  // Device type mappings
  const mappings: Record<string, string> = {
    // Tablets
    tablet: "tablet",
    ipad: "tablet",
    "digital tablet": "tablet",

    // Laptops
    laptop: "laptop",
    notebook: "laptop",
    netbook: "laptop",
    "laptop computer": "laptop",

    // Phones
    smartphone: "phone",
    iphone: "phone",
    "cell phone": "phone",
    cellular: "phone",
    "mobile phone": "phone",

    // Cameras
    camera: "camera",
    "digital camera": "camera",

    // Watches
    watch: "smartwatch",
    smartwatch: "smartwatch",
    "apple watch": "smartwatch",

    // Headphones/Earbuds
    headphone: "earbuds",
    earbud: "earbuds",
    earphone: "earbuds",
    "wireless earbud": "earbuds",

    // Speakers
    speaker: "speaker",
    "bluetooth speaker": "speaker",

    // Consoles
    console: "console",
    gamepad: "console",
    "game console": "console",

    // Power Banks
    "power bank": "powerbank",
    "portable charger": "powerbank",

    // Chargers
    charger: "charger",
    adapter: "charger",
    "power adapter": "charger",

    // Cables
    cable: "cable",
    cord: "cable",
    usb: "cable",
  };

  // Check for exact matches first
  if (mappings[l]) return mappings[l];

  // Check for partial matches
  for (const [key, value] of Object.entries(mappings)) {
    if (l.includes(key) || key.includes(l)) {
      return value;
    }
  }

  return null;
}

/**
 * Estimate device condition from image using edge detection
 * Higher sharpness = better condition
 * Returns a score from 0-100
 */
export function estimateConditionFromImage(imageData: ImageData): number {
  const data = imageData.data;
  let edgeSum = 0;
  const width = imageData.width;
  const height = imageData.height;

  // Sobel edge detection for wear assessment
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      // Sobel X kernel
      const gx =
        -1 * data[idx - 4 - width * 4] +
        1 * data[idx + 4 - width * 4] +
        -2 * data[idx - 4] +
        2 * data[idx + 4] +
        -1 * data[idx - 4 + width * 4] +
        1 * data[idx + 4 + width * 4];

      // Sobel Y kernel
      const gy =
        -1 * data[idx - 4 - width * 4] +
        -2 * data[idx - width * 4] +
        -1 * data[idx + 4 - width * 4] +
        1 * data[idx - 4 + width * 4] +
        2 * data[idx + width * 4] +
        1 * data[idx + 4 + width * 4];

      edgeSum += Math.sqrt(gx * gx + gy * gy);
    }
  }

  const avgSharpness = edgeSum / ((width - 2) * (height - 2));
  const conditionScore = Math.min(
    100,
    Math.max(0, Math.round((avgSharpness / 1200) * 100))
  );

  return conditionScore;
}

/**
 * Perform full AI detection on a video/image element
 * Returns device ID and confidence score
 */
export async function detectDevice(
  source: HTMLVideoElement | HTMLCanvasElement
) {
  try {
    const predictions = await classifyImage(source, 5);

    let bestMatch = { id: null as string | null, confidence: 0 };

    for (const pred of predictions) {
      const deviceId = mapLabelToDeviceId(pred.className);

      if (deviceId && pred.probability > bestMatch.confidence) {
        bestMatch = {
          id: deviceId,
          confidence: pred.probability,
        };
      }
    }

    return bestMatch;
  } catch (error) {
    console.error("Device detection failed:", error);
    throw new Error("Failed to detect device. Please try again.");
  }
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(probability: number): string {
  if (probability >= 0.8) return "Very High";
  if (probability >= 0.6) return "High";
  if (probability >= 0.4) return "Medium";
  if (probability >= 0.2) return "Low";
  return "Very Low";
}

/**
 * Clean up resources
 */
export function cleanup() {
  unloadModel();
  tf.dispose();
}
