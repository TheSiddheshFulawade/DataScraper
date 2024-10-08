# E-commerce Data Scraper Chrome Plugin

This Chrome extension scrapes product information from e-commerce websites, displays it in a table format with pagination, and allows exporting the data to an Excel file. The plugin also integrates with the Gemini API to search for similar products.

## Features:

1. Scrapes product information (Product Name, Price, Product Image) from e-commerce sites.
2. Displays scraped data in a table with pagination (10 results per page).
3. Provides an "Export to Excel" button, allowing users to download all scraped data in an Excel file.
4. Integrates with the Gemini API to search for similar products.

## Prerequisites:

- Node.js
- npm (Node package manager)
- Chrome Browser (latest version)

## Installation Instructions:

1. Clone the repository to your local machine using the command:
   ```
   git clone https://github.com/TheSiddheshFulawade/DataScraper.git
   ```
2. Navigate to the project directory by using:
   ```
   cd DataScraper
   ```
3. Install the necessary dependencies by running:
   ```
   npm install
   ```
4. Build the project using:
   ```
   npm run build
   ```
5. Load the extension in Chrome:
   1. Open Chrome and go to chrome://extensions/.
   2. Enable "Developer Mode" in the top-right corner.
   3. Click "Load unpacked" and select the dist folder from the project directory.

6. The extension should now be installed and ready to use.

## How to Use:

1. Once the extension is installed, visit an e-commerce product page (e.g., Zara).
2. Click on the extension icon in the Chrome toolbar.
3. The extension will scrape product details such as the product name, price, and image.
4. The scraped data will be displayed in a table format with pagination, showing 10 results at a time.
5. You can click on the "Export to Excel" button to download an Excel file containing all the scraped data.
6. The extension also allows searching for similar products using the Gemini API, which can be accessed by clicking on the "Search for Similar Products" button.

## Testing the Extension:

1. Visit an e-commerce site like Zara and go to a product page.
2. Click on the extension icon.
3. You should see product data being scraped and displayed in a table.
4. Use the pagination controls to navigate through the results.
5. Test the "Export to Excel" functionality by downloading the scraped data.
6. Try searching for similar products using the Gemini API integration.

## Gemini API Setup:

To use the Gemini API for searching similar products, follow these steps:

1. Sign up and create an account on the Gemini API website.
2. After logging in, navigate to the API section and generate a new API key.
3. In the root directory of the project, create a .env file and add the following entry:
```
VITE_GEMINI_API_KEY= key
```
4. Use this API key to enable the Gemini API integration for searching similar products.
