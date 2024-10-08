chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === 'scrapeData') {
      const productCards = document.querySelectorAll('.product-grid-product');
      const productInfo = Array.from(productCards).map(card => ({
        productName: card.querySelector('.product-grid-product-info__name')?.textContent.trim(),
        price: card.querySelector('.price__amount')?.textContent.trim(),
        productImage: card.querySelector('.product-grid-product-image img')?.src
      }));
      sendResponse(productInfo);
    }
  });