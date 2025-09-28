// Blockchain simulation
class BlockchainLedger {
    constructor() {
        this.products = new Map();
    }

    generateHash(data) {
        let hash = 0;
        const str = JSON.stringify(data) + Date.now();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    generateProductId() {
        return 'AGR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
    }

    addFarmerBlock(farmerData) {
        const productId = this.generateProductId();
        const block = {
            blockNumber: 1,
            type: 'farmer',
            timestamp: new Date().toISOString(),
            data: farmerData,
            hash: this.generateHash(farmerData),
            prevHash: '0000000000000000'
        };

        this.products.set(productId, [block]);
        return { productId, block };
    }

    addDealerBlock(productId, dealerData) {
        const chain = this.products.get(productId);
        if (!chain) return null;

        const prevBlock = chain[chain.length - 1];
        const block = {
            blockNumber: chain.length + 1,
            type: 'dealer',
            timestamp: new Date().toISOString(),
            data: dealerData,
            hash: this.generateHash(dealerData),
            prevHash: prevBlock.hash
        };

        chain.push(block);
        return block;
    }

    addRetailerBlock(productId, retailerData) {
        const chain = this.products.get(productId);
        if (!chain) return null;

        const prevBlock = chain[chain.length - 1];
        const block = {
            blockNumber: chain.length + 1,
            type: 'retailer',
            timestamp: new Date().toISOString(),
            data: retailerData,
            hash: this.generateHash(retailerData),
            prevHash: prevBlock.hash
        };

        chain.push(block);
        return block;
    }

    getProductChain(productId) {
        return this.products.get(productId) || null;
    }
}

// Initialize blockchain
const blockchain = new BlockchainLedger();

// Navigation
function showSection(section, event) {
    document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(section + '-section').classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('font-bold', 'underline'));
    if (event) event.target.classList.add('font-bold', 'underline');
}

// Farmer form
document.getElementById('farmer-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const farmerData = {
        farmerName: document.getElementById('farmer-name').value,
        farmLocation: document.getElementById('farm-location').value,
        productType: document.getElementById('product-type').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        basePrice: parseFloat(document.getElementById('base-price').value),
        harvestDate: document.getElementById('harvest-date').value
    };

    const result = blockchain.addFarmerBlock(farmerData);
    document.getElementById('product-id').textContent = result.productId;
    document.getElementById('farmer-result').classList.remove('hidden');
    this.reset();


// Consumer tracking
function trackProduct() {
    const productId = document.getElementById('consumer-product-id').value.trim();
    if (!productId) return;

    const chain = blockchain.getProductChain(productId);
    console.log("Chain fetched for tracking:", chain);

    if (!chain) {
        document.getElementById('no-product-found').classList.remove('hidden');
        document.getElementById('product-timeline').classList.add('hidden');
        return;
    }

    document.getElementById('no-product-found').classList.add('hidden');
    document.getElementById('product-timeline').classList.remove('hidden');

    const bgColors = {
        green: "bg-green-100",
        blue: "bg-blue-100",
        purple: "bg-purple-100"
    };
    const borderColors = {
        green: "border-green-200",
        blue: "border-blue-200",
        purple: "border-purple-200"
    };
    const textColors = {
        green: "text-green-800",
        blue: "text-blue-800",
        purple: "text-purple-800"
    };

    // Build timeline
    const timelineContent = document.getElementById('timeline-content');
    timelineContent.innerHTML = '';

    let totalPrice = 0;
    const priceBreakdown = [];

    chain.forEach((block, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'flex items-start space-x-4';

        let icon, title, details, color;

        if (block.type === 'farmer') {
            icon = '🚜';
            title = 'Farm Origin';
            color = 'green';
            details = `
                <p><strong>Farmer:</strong> ${block.data.farmerName}</p>
                <p><strong>Location:</strong> ${block.data.farmLocation}</p>
                <p><strong>Product:</strong> ${block.data.productType}</p>
                <p><strong>Quantity:</strong> ${block.data.quantity} kg</p>
                <p><strong>Harvest Date:</strong> ${block.data.harvestDate}</p>
                <p><strong>Base Price:</strong> ₹${block.data.basePrice}/kg</p>
            `;
            totalPrice = block.data.basePrice;
            priceBreakdown.push({ stage: 'Farm Price', amount: block.data.basePrice, color: 'green' });
        } else if (block.type === 'dealer') {
            icon = '🚛';
            title = 'Processing & Distribution';
            color = 'blue';
            const totalDealerCost = block.data.transportCost + block.data.processingFee + block.data.storageCost;
            const costPerKg = totalDealerCost / chain[0].data.quantity;
            details = `
                <p><strong>Dealer:</strong> ${block.data.dealerName}</p>
                <p><strong>Location:</strong> ${block.data.dealerLocation}</p>
                <p><strong>Transport Cost:</strong> ₹${block.data.transportCost}</p>
                <p><strong>Processing Fee:</strong> ₹${block.data.processingFee}</p>
                <p><strong>Storage Cost:</strong> ₹${block.data.storageCost}</p>
                <p><strong>Processing Date:</strong> ${block.data.processingDate}</p>
                <p><strong>Added Cost:</strong> ₹${costPerKg.toFixed(2)}/kg</p>
            `;
            totalPrice += costPerKg;
            priceBreakdown.push({ stage: 'Processing Costs', amount: costPerKg, color: 'blue' });
        } else if (block.type === 'retailer') {
            icon = '🏪';
            title = 'Retail Store';
            color = 'purple';
            const marginAmount = (totalPrice * block.data.retailMargin) / 100;
            details = `
                <p><strong>Retailer:</strong> ${block.data.retailerName}</p>
                <p><strong>Store:</strong> ${block.data.storeLocation}</p>
                <p><strong>Retail Margin:</strong> ${block.data.retailMargin}%</p>
                <p><strong>Shelf Date:</strong> ${block.data.shelfDate}</p>
                <p><strong>Margin Added:</strong> ₹${marginAmount.toFixed(2)}/kg</p>
            `;
            totalPrice += marginAmount;
            priceBreakdown.push({ stage: 'Retail Margin', amount: marginAmount, color: 'purple' });
        }

        timelineItem.innerHTML = `
            <div class="flex-shrink-0">
                <div class="w-12 h-12 ${bgColors[color]} rounded-full flex items-center justify-center">
                    <span class="text-xl">${icon}</span>
                </div>
                ${index < chain.length - 1 ? '<div class="w-0.5 h-16 bg-gray-300 mx-auto mt-2"></div>' : ''}
            </div>
            <div class="flex-1 blockchain-block text-white p-6 rounded-lg">
                <h4 class="text-xl font-bold mb-2">${title}</h4>
                <div class="text-sm opacity-90 space-y-1">${details}</div>
                <div class="mt-4 text-xs opacity-75">
                    <p><strong>Block Hash:</strong> ${block.hash}</p>
                    <p><strong>Previous Hash:</strong> ${block.prevHash}</p>
                    <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `;

        timelineContent.appendChild(timelineItem);
    });

    // Build price breakdown
    const priceDetails = document.getElementById('price-details');
    priceDetails.innerHTML = '';

    priceBreakdown.forEach(item => {
        const priceItem = document.createElement('div');
        priceItem.className = `p-4 rounded-lg border ${bgColors[item.color]} ${borderColors[item.color]}`;
        priceItem.innerHTML = `
            <h5 class="font-semibold ${textColors[item.color]}">${item.stage}</h5>
            <p class="text-2xl font-bold ${textColors[item.color]}">₹${item.amount.toFixed(2)}</p>
        `;
        priceDetails.appendChild(priceItem);
    });

    const totalItem = document.createElement('div');
    totalItem.className = 'md:col-span-2 p-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border-2 border-orange-300';
    totalItem.innerHTML = `
        <h5 class="font-bold text-orange-800 text-lg">Final Consumer Price</h5>
        <p class="text-4xl font-bold text-orange-700">₹${totalPrice.toFixed(2)}/kg</p>
    `;
    priceDetails.appendChild(totalItem);
}

// Auto-fill today's date
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('harvest-date').value = today;
    document.getElementById('processing-date').value = today;
    document.getElementById('shelf-date').value = today;
});
});
