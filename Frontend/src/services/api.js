export const removeBackground = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("https://bgremover-bqnu.onrender.com/remove-bg", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to process image");
  }

  return await response.blob();
};