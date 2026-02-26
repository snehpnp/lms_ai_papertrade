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

  // Generate SHA-1 Signature
  const signatureString = `timestamp=${timestamp}${apiSecret}`;

  let signature = "";
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);

    // Check if crypto.subtle is available (it's only available in secure contexts like HTTPS/localhost)
    const cryptoObj = window.crypto || (window as any).crypto;
    if (cryptoObj?.subtle) {
      const hashBuffer = await cryptoObj.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } else {
      // Manual SHA-1 implementation fallback for insecure contexts (HTTP / IP access)
      signature = hex_sha1(signatureString);
    }
  } catch (e: any) {
    console.error("Signature generation failed:", e);
    // Helpful error if even the manual fallback fails (which shouldn't happen)
    throw new Error("Failed to generate signature for Cloudinary upload.");
  }

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

/**
 * Manual SHA-1 implementation fallback for insecure contexts
 */
function hex_sha1(s: string) {
  return binb2hex(core_sha1(str2binb(s), s.length * 8));
}

function core_sha1(x: any, len: number) {
  x[len >> 5] |= 0x80 << (24 - (len % 32));
  x[((len + 64 >> 9) << 4) + 15] = len;
  let w = new Array(80), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776;
  for (let i = 0; i < x.length; i += 16) {
    let olda = a, oldb = b, oldc = c, oldd = d, olde = e;
    for (let j = 0; j < 80; j++) {
      if (j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      let t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d; d = c; c = rol(b, 30); b = a; a = t;
    }
    a = safe_add(a, olda); b = safe_add(b, oldb); c = safe_add(c, oldc); d = safe_add(d, oldd); e = safe_add(e, olde);
  }
  return [a, b, c, d, e];
}

function sha1_ft(t: number, b: number, c: number, d: number) {
  if (t < 20) return (b & c) | (~b & d);
  if (t < 40) return b ^ c ^ d;
  if (t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

function sha1_kt(t: number) {
  return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
}

function safe_add(x: number, y: number) {
  let lsw = (x & 0xffff) + (y & 0xffff);
  let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function rol(num: number, cnt: number) {
  return (num << cnt) | (num >>> (32 - cnt));
}

function str2binb(str: string) {
  let bin = [], mask = (1 << 8) - 1;
  for (let i = 0; i < str.length * 8; i += 8)
    bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (24 - (i % 32));
  return bin;
}

function binb2hex(binarray: any[]) {
  let hex_tab = "0123456789abcdef", str = "";
  for (let i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8 + 4)) & 0xf) +
      hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xf);
  }
  return str;
}
