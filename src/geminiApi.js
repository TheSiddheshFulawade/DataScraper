const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function getSimilarProducts(productName) {
  const prompt = `For the product "${productName}":
  1. Find 3 similar products available on popular e-commerce websites other than Zara.
  2. If exact matches are not found, provide links to relevant category pages or search results for more general terms related to the product.
  3. For each result, provide:
     - The full URL of the product or category page
     - The name of the website (e.g., Amazon, ASOS, H&M)
     - A brief description of the product or category (max 10 words)

  Format the response as a JSON array of objects, each with 'url', 'website', and 'description' keys. Do not include any markdown formatting or extra text outside the JSON array.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    const jsonString = text.replace(/```json\s?|\s?```/g, "").trim();

    const products = JSON.parse(jsonString);

    return products.filter(
      (product) =>
        product.url &&
        product.website &&
        product.description &&
        isValidUrl(product.url)
    );
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
