import './PriceCalculator.css'

import React, { useState } from 'react';

const PriceCalculator = () => {
  const [inputs, setInputs] = useState({
    rawCost: '',
    laborCost: '',
    otherCosts: '',
    quantity: '',
    profitMargin: '',
    clientOffer: ''
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculate = (e) => {
    e.preventDefault();
    const {
      rawCost,
      laborCost,
      otherCosts,
      quantity,
      profitMargin,
      clientOffer
    } = inputs;

    // Convert all inputs to numbers
    const parsedValues = {
      rawCost: parseFloat(rawCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
      otherCosts: parseFloat(otherCosts) || 0,
      quantity: parseInt(quantity) || 1,
      profitMargin: parseFloat(profitMargin) || 0,
      clientOffer: parseFloat(clientOffer) || 0
    };

    const calculation = calculateFinalPrice(
      parsedValues.rawCost,
      parsedValues.laborCost,
      parsedValues.otherCosts,
      parsedValues.quantity,
      parsedValues.profitMargin,
      parsedValues.clientOffer
    );

    setResult(calculation);
  };

  const resetForm = () => {
    setInputs({
      rawCost: '',
      laborCost: '',
      otherCosts: '',
      quantity: '',
      profitMargin: '',
      clientOffer: ''
    });
    setResult(null);
  };

  return (
    <div className="calculator-container">
      <h2 className="calculator-title">Pricing Calculator</h2>
      
      <form onSubmit={calculate} className="calculator-form">
        <div className="input-group">
          <label>Raw Material Cost (LRK)</label>
          <input
            type="number"
            name="rawCost"
            value={inputs.rawCost}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label>Labor Cost (LRK)</label>
          <input
            type="number"
            name="laborCost"
            value={inputs.laborCost}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label>Other Costs (LRK)</label>
          <input
            type="number"
            name="otherCosts"
            value={inputs.otherCosts}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={inputs.quantity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="input-group">
          <label>Profit Margin (%)</label>
          <input
            type="number"
            name="profitMargin"
            value={inputs.profitMargin}
            onChange={handleChange}
            step="0.1"
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label>Client Offer (LRK)</label>
          <input
            type="number"
            name="clientOffer"
            value={inputs.clientOffer}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="calculate-btn">
            Calculate
          </button>
          <button type="button" onClick={resetForm} className="reset-btn">
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="results-container">
          <h3>Calculation Results</h3>
          
          <div className={`status-badge ${result.status.toLowerCase().replace(' ', '-')}`}>
            {result.status}
          </div>

          <div className="result-grid">
            <div className="result-item">
              <span>Total Cost:</span>
              <span>LRK{result.totalCost}</span>
            </div>
            <div className="result-item">
              <span>Cost Per Piece:</span>
              <span>LRK{result.costPerPiece}</span>
            </div>
            <div className="result-item">
              <span>Final Price:</span>
              <span>LRK{result.finalPrice}</span>
            </div>
            <div className="result-item">
              <span>Profit Per Piece:</span>
              <span>LRK{result.profitPerPiece}</span>
            </div>
            <div className="result-item">
              <span>Client Offer Difference:</span>
              <span className={result.clientOfferVsFinal >= 0 ? 'positive' : 'negative'}>
                LRK{result.clientOfferVsFinal}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Your existing calculation function
function calculateFinalPrice(rawCost, laborCost, otherCosts, quantity, profitMargin, clientOffer) {
    const totalCost = rawCost + laborCost + otherCosts;
    const costPerPiece = totalCost / quantity;
    const finalPrice = costPerPiece * (1 + profitMargin / 100);
    const profitPerPiece = finalPrice - costPerPiece;
    const clientDiff = clientOffer - finalPrice;

    let status = "";
    if (clientOffer < costPerPiece) {
        status = "Actual Loss";
    } else if (clientOffer >= finalPrice) {
        status = "Full Profit";
    } else {
        status = "Partial Profit";
    }

    return {
        totalCost: parseFloat(totalCost.toFixed(2)),
        costPerPiece: parseFloat(costPerPiece.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        profitPerPiece: parseFloat(profitPerPiece.toFixed(2)),
        clientOfferVsFinal: parseFloat(clientDiff.toFixed(2)),
        status: status
    };
}

export default PriceCalculator;