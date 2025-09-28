// Retailer logic extracted from blockchain.js

function fetchProductForRetailer() {
    const productId = document.getElementById('retailer-product-id').value.trim();
    if (!productId) return;

    const chain = blockchain.getProductChain(productId);
    if (chain && chain.length >= 2) {
        const farmerBlock = chain[0];
        const dealerBlock = chain[1];
        const totalCost = dealerBlock.data.transportCost + dealerBlock.data.processingFee + dealerBlock.data.storageCost;

        document.getElementById('retailer-product-details').innerHTML = `
            <p><strong>Product:</strong> ${farmerBlock.data.productType}</p>
            <p><strong>Current Cost:</strong> ₹${(farmerBlock.data.basePrice + totalCost/farmerBlock.data.quantity).toFixed(2)}/kg</p>
            <p><strong>Processed by:</strong> ${dealerBlock.data.dealerName}</p>
        `;
        document.getElementById('retailer-product-info').classList.remove('hidden');
        document.getElementById('retailer-form').classList.remove('hidden');
    } else {
        alert('Product not found or not processed by dealer yet!');
    }
}

document.getElementById('retailer-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const productId = document.getElementById('retailer-product-id').value.trim();
    const retailerData = {
        retailerName: document.getElementById('retailer-name').value,
        storeLocation: document.getElementById('store-location').value,
        retailMargin: parseFloat(document.getElementById('retail-margin').value),
        shelfDate: document.getElementById('shelf-date').value
    };

    const result = blockchain.addRetailerBlock(productId, retailerData);
    if (result) {
        document.getElementById('retailer-result').classList.remove('hidden');
        this.reset();
        document.getElementById('retailer-product-info').classList.add('hidden');
        document.getElementById('retailer-form').classList.add('hidden');
    }
});
