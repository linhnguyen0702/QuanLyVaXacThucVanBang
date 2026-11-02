import jsQR from "jsqr";

const getLookupValue = (payload) => {
  const value = payload.trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    const lookupValue = ["code", "certificate_code", "hash", "query", "id"]
      .map((key) => url.searchParams.get(key))
      .find(Boolean);
    if (lookupValue) return lookupValue;

    const pathSegments = url.pathname.split("/").filter(Boolean);
    return decodeURIComponent(pathSegments[pathSegments.length - 1] || value);
  } catch {
    return value;
  }
};

export const decodeQrCodeFromImage = async (file) => {
  if (!file || (file.type && !file.type.startsWith("image/"))) {
    throw new Error("Vui lòng chọn tệp hình ảnh chứa mã QR.");
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Không thể đọc tệp hình ảnh."));
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Trình duyệt không hỗ trợ đọc hình ảnh QR.");

    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(imageData.data, imageData.width, imageData.height);
    if (!decoded?.data) {
      throw new Error("Không tìm thấy mã QR hợp lệ trong hình ảnh đã chọn.");
    }

    const lookupValue = getLookupValue(decoded.data);
    if (!lookupValue) {
      throw new Error("Mã QR không chứa mã tra cứu hợp lệ.");
    }
    return lookupValue;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};
