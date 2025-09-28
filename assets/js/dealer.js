// Dealer logic extracted from blockchain.js

function fetchProductForDealer() {
    const productId = document.getElementById('dealer-product-id').value.trim();
    if (!productId) return;

    const chain = blockchain.getProductChain(productId);
    if (chain) {
        const farmerBlock = chain[0];
        document.getElementById('dealer-product-details').innerHTML = `
            <p><strong>Product:</strong> ${farmerBlock.data.productType}</p>
            <p><strong>Farmer:</strong> ${farmerBlock.data.farmerName}</p>
            <p><strong>Quantity:</strong> ${farmerBlock.data.quantity} kg</p>
            <p><strong>Base Price:</strong> ₹${farmerBlock.data.basePrice}/kg</p>
        `;
        document.getElementById('dealer-product-info').classList.remove('hidden');
        document.getElementById('dealer-form').classList.remove('hidden');
    } else {
        alert('Product not found!');
    }
}

document.getElementById('dealer-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const productId = document.getElementById('dealer-product-id').value.trim();
    const dealerData = {
        dealerName: document.getElementById('dealer-name').value,
        dealerLocation: document.getElementById('dealer-location').value,
        transportCost: parseFloat(document.getElementById('transport-cost').value),
        processingFee: parseFloat(document.getElementById('processing-fee').value),
        storageCost: parseFloat(document.getElementById('storage-cost').value),
        processingDate: document.getElementById('processing-date').value
    };

    const result = blockchain.addDealerBlock(productId, dealerData);
    if (result) {
        document.getElementById('dealer-result').classList.remove('hidden');
        this.reset();
        document.getElementById('dealer-product-info').classList.add('hidden');
        document.getElementById('dealer-form').classList.add('hidden');
    }
});
