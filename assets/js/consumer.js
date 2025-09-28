function trackProduct() {
  const productId = document.getElementById('consumer-product-id').value.trim();
  if (!productId) return;

  const chain = blockchain.getProductChain(productId);
  console.log("Chain fetched for tracking:", chain);

  const noProductEl = document.getElementById('no-product-found');
  const timelineEl = document.getElementById('product-timeline');
  const timelineContent = document.getElementById('timeline-content');
  const priceDetails = document.getElementById('price-details');

  if (!chain) {
    noProductEl.classList.remove('hidden');
    timelineEl.classList.add('hidden');
    return;
  }

  noProductEl.classList.add('hidden');
  timelineEl.classList.remove('hidden');

  // 🎨 Centralized style config
  const blockStyles = {
    green: { bg: "bg-green-50", text: "text-green-900", border: "border-green-400" },
    blue: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-400" },
    purple: { bg: "bg-purple-50", text: "text-purple-900", border: "border-purple-400" }
  };

  timelineContent.innerHTML = '';
  priceDetails.innerHTML = '';

  let totalPrice = 0;
  const priceBreakdown = [];

  // ✅ Helper: Build a timeline card
  const createTimelineCard = (icon, title, color, details, block, showConnector) => {
    const style = blockStyles[color];
    return `
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full flex items-center justify-center ${style.bg} ${style.border} border-2">
            <span class="text-xl">${icon}</span>
          </div>
          ${showConnector ? '<div class="w-0.5 h-16 bg-gray-300 mx-auto mt-2"></div>' : ''}
        </div>
        <div class="flex-1 ${style.bg} ${style.text} p-6 rounded-xl shadow-md border ${style.border} transition-transform transform hover:scale-105">
          <h4 class="text-xl font-bold mb-2">${title}</h4>
          <div class="text-sm opacity-90 space-y-1">${details}</div>
          <div class="mt-4 text-xs opacity-75">
            <p><strong>Block Hash:</strong> ${block.hash}</p>
            <p><strong>Previous Hash:</strong> ${block.prevHash}</p>
            <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
  };

  // ✅ Helper: Add price breakdown card
  const createPriceCard = (stage, amount, color) => {
    const style = blockStyles[color];
    return `
      <div class="p-4 rounded-lg border ${style.bg} ${style.border}">
        <h5 class="font-semibold ${style.text}">${stage}</h5>
        <p class="text-2xl font-bold ${style.text}">₹${amount.toFixed(2)}</p>
      </div>
    `;
  };

  chain.forEach((block, index) => {
    let icon, title, details, color;

    if (block.type === 'farmer') {
      color = 'green';
      icon = '🚜';
      title = 'Farm Origin';
      details = `
        <p><strong>Farmer:</strong> ${block.data.farmerName}</p>
        <p><strong>Location:</strong> ${block.data.farmLocation}</p>
        <p><strong>Product:</strong> ${block.data.productType}</p>
        <p><strong>Quantity:</strong> ${block.data.quantity} kg</p>
        <p><strong>Harvest Date:</strong> ${block.data.harvestDate}</p>
        <p><strong>Base Price:</strong> ₹${block.data.basePrice}/kg</p>
      `;
      totalPrice = block.data.basePrice;
      priceBreakdown.push({ stage: 'Farm Price', amount: totalPrice, color });

    } else if (block.type === 'dealer') {
      color = 'blue';
      icon = '🚛';
      title = 'Processing & Distribution';
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
      priceBreakdown.push({ stage: 'Processing Costs', amount: costPerKg, color });

    } else if (block.type === 'retailer') {
      color = 'purple';
      icon = '🏪';
      title = 'Retail Store';
      const marginAmount = (totalPrice * block.data.retailMargin) / 100;
      details = `
        <p><strong>Retailer:</strong> ${block.data.retailerName}</p>
        <p><strong>Store:</strong> ${block.data.storeLocation}</p>
        <p><strong>Retail Margin:</strong> ${block.data.retailMargin}%</p>
        <p><strong>Shelf Date:</strong> ${block.data.shelfDate}</p>
        <p><strong>Margin Added:</strong> ₹${marginAmount.toFixed(2)}/kg</p>
      `;
      totalPrice += marginAmount;
      priceBreakdown.push({ stage: 'Retail Margin', amount: marginAmount, color });
    }

    timelineContent.innerHTML += createTimelineCard(icon, title, color, details, block, index < chain.length - 1);
  });

  // Render price breakdown
  priceBreakdown.forEach(item => {
    priceDetails.innerHTML += createPriceCard(item.stage, item.amount, item.color);
  });

  // Final total price card
  priceDetails.innerHTML += `
    <div class="md:col-span-2 p-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border-2 border-orange-300">
      <h5 class="font-bold text-orange-800 text-lg">Final Consumer Price</h5>
      <p class="text-4xl font-bold text-orange-700">₹${totalPrice.toFixed(2)}/kg</p>
    </div>
  `;
}
