export const uploadToCloudinary = async (file: File | string): Promise<string> => {
  // Extracting credentials manually since Vite ignores non-VITE_ prefixed envs,
  // or dynamically process the cloudinary url format if provided directly as a string 
  // cloudinary://[api_key]:[api_secret]@[cloud_name]
  const cloudUrl = import.meta.env.VITE_CLOUDINARY_URL || "cloudinary://172467848816522:2BaWWnYdLMQDsNBCRAjUpFjx_N4@dkqw7zkzl";
  
  const parseUrl = cloudUrl.replace("cloudinary://", "").split("@");
  if (parseUrl.length !== 2) throw new Error("Invalid Cloudinary URL format");
  
  const credentials = parseUrl[0].split(":");
  const apiKey = credentials[0];
  const apiSecret = credentials[1];
  const cloudName = parseUrl[1];

  const timestamp = Math.round(new Date().getTime() / 1000).toString();

  // Generate SHA-1 Signature manually
  const signatureString = `timestamp=${timestamp}${apiSecret}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const resourceType = typeof file !== "string" && file.type === "application/pdf" ? "raw" : "auto";

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const responseData = await response.json();
  if (!response.ok) {
    console.error("Cloudinary upload failed", responseData);
    throw new Error(responseData.error?.message || "Cloudinary Upload Failed");
  }

  return responseData.secure_url;
};
