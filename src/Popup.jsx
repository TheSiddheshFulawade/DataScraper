import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getSimilarProducts } from "./geminiApi";

const { useState, useEffect } = React;

const Popup = () => {
  const [productInfo, setProductInfo] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [similarProducts, setSimilarProducts] = useState({});
  const [loading, setLoading] = useState({});
  const productsPerPage = 10;

  useEffect(() => {
    console.log("Current productInfo:", productInfo);
  }, [productInfo]);

  const scrapeData = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        setErrorMessage("No active tab found");
        return;
      }

      const activeTab = tabs[0];

      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          func: scrapeProductData,
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error("Script injection failed:", chrome.runtime.lastError);
            setErrorMessage(
              "Failed to inject script: " + chrome.runtime.lastError.message
            );
            return;
          }

          if (results && results[0]?.result) {
            console.log("Scraped data:", results[0].result);
            setProductInfo(results[0].result);
            setErrorMessage("");
            setCurrentPage(1);
          } else {
            console.error("Failed to retrieve product data:", results);
            setErrorMessage("Failed to retrieve product data.");
          }
        }
      );
    });
  };

  const handleSimilarProductsSearch = async (productName, index) => {
    setLoading((prev) => ({ ...prev, [index]: true }));
    setErrorMessage("");
    try {
      const results = await getSimilarProducts(productName);
      if (results.length === 0) {
        setSimilarProducts((prev) => ({
          ...prev,
          [index]: null,
        }));
      } else {
        setSimilarProducts((prev) => ({
          ...prev,
          [index]: results,
        }));
      }
    } catch (error) {
      console.error("Error fetching similar products:", error);
      setErrorMessage(
        `Failed to fetch similar products: ${error.message}. Please try again.`
      );
      setSimilarProducts((prev) => ({
        ...prev,
        [index]: null,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const resetSimilarProducts = () => {
    setSimilarProducts({});
  };

  useEffect(() => {
    resetSimilarProducts();
  }, [currentPage]);

  const scrapeProductData = () => {
    const productCards = document.querySelectorAll(".product-grid-product");
    console.log("Number of product cards found:", productCards.length);

    return Array.from(productCards).map((card) => {
      const productName =
        card
          .querySelector(".product-grid-product-info__name")
          ?.textContent.trim() || "No Product Name Found";
      const price =
        card.querySelector(".price__amount")?.textContent.trim() ||
        "No Price Found";

      const productImageElement = card.querySelector(".media-image__image");
      let productImage = "";

      if (productImageElement) {
        productImage =
          productImageElement.src ||
          productImageElement.getAttribute("data-src") ||
          "";
      }

      console.log("Product details:", { productName, price, productImage });

      const absoluteImageUrl = productImage
        ? new URL(productImage, window.location.origin).href
        : "";

      return {
        productName,
        price,
        productImage: absoluteImageUrl,
      };
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(productInfo);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "scraped_products.xlsx");
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productInfo.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.src = "https://via.placeholder.com/50x50?text=No+Image";
  };

  return (
    <div style={{ width: "400px", padding: "20px" }}>
      <h2>Product Scraper</h2>
      <button onClick={scrapeData}>Scrape Data</button>
      {productInfo.length > 0 && (
        <button onClick={exportToExcel} style={{ marginLeft: "10px" }}>
          Export to Excel
        </button>
      )}

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {productInfo.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              marginTop: "20px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Product Name
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Price
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Product Image
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Similar Products
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product, index) => {
                const globalIndex = (currentPage - 1) * productsPerPage + index;
                return (
                  <tr key={globalIndex}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {product.productName}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {product.price}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {product.productImage ? (
                        <img
                          src={product.productImage}
                          alt="Product"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          onError={handleImageError}
                        />
                      ) : (
                        <span>No Image Available</span>
                      )}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      <button
                        onClick={() =>
                          handleSimilarProductsSearch(
                            product.productName,
                            globalIndex
                          )
                        }
                        disabled={loading[globalIndex]}
                      >
                        {loading[globalIndex]
                          ? "Searching..."
                          : "Search Similar"}
                      </button>
                      {similarProducts[globalIndex] &&
                      similarProducts[globalIndex].length > 0 ? (
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                          {similarProducts[globalIndex].map((item, i) => (
                            <li key={i} style={{ marginTop: "10px" }}>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#0066cc",
                                }}
                              >
                                {item.website}: {item.description}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        similarProducts[globalIndex] && (
                          <p>
                            No similar products found. Try searching for more
                            general terms.
                          </p>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: "20px" }}>
            {Array.from(
              { length: Math.ceil(productInfo.length / productsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(i + 1);
                    resetSimilarProducts();
                  }}
                  style={{ margin: "0 5px" }}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
        </>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Popup;
