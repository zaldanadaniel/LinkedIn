import React, { useState, useEffect, useCallback } from 'react';

const BankingCustomerSegmentation = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [customers, setCustomers] = useState([]);
  const [hoveredCustomer, setHoveredCustomer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Generate random customer data
  const generateCustomerData = useCallback((numCustomers, numSegments) => {
    const customers = [];
    for (let i = 0; i < numSegments; i++) {
      const centerIncome = Math.random() * 150000 + 20000;
      const centerAge = Math.random() * 50 + 20;
      const centerTransactions = Math.random() * 80 + 10;
      
      for (let j = 0; j < numCustomers / numSegments; j++) {
        customers.push({
          income: centerIncome + (Math.random() - 0.5) * 40000,
          age: centerAge + (Math.random() - 0.5) * 20,
          transactions: centerTransactions + (Math.random() - 0.5) * 30,
          segment: i
        });
      }
    }
    return customers;
  }, []);

  // Simple k-means clustering
  const kMeansClustering = useCallback((customers, k, iterations) => {
    let centroids = customers.slice(0, k);
    
    for (let iter = 0; iter < iterations; iter++) {
      // Assign customers to nearest centroid
      customers.forEach(customer => {
        let minDist = Infinity;
        centroids.forEach((centroid, index) => {
          const dist = Math.sqrt(
            Math.pow((customer.income - centroid.income) / 100000, 2) +
            Math.pow((customer.age - centroid.age) / 50, 2) +
            Math.pow((customer.transactions - centroid.transactions) / 50, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            customer.segment = index;
          }
        });
      });
      
      // Update centroids
      centroids = centroids.map((_, i) => {
        const segment = customers.filter(c => c.segment === i);
        return {
          income: segment.reduce((sum, c) => sum + c.income, 0) / segment.length,
          age: segment.reduce((sum, c) => sum + c.age, 0) / segment.length,
          transactions: segment.reduce((sum, c) => sum + c.transactions, 0) / segment.length,
        };
      });
    }
    
    return customers;
  }, []);

  useEffect(() => {
    const customerData = generateCustomerData(200, 4);
    const segmentedCustomers = kMeansClustering(customerData, 4, 5);
    setCustomers(segmentedCustomers);

    let lastTime = 0;
    const animate = (time) => {
      if (isPlaying) {
        const deltaTime = time - lastTime;
        setRotation(prev => ({
          x: (prev.x + 0.02 * deltaTime) % 360,
          y: (prev.y + 0.015 * deltaTime) % 360,
          z: (prev.z + 0.01 * deltaTime) % 360
        }));
      }
      lastTime = time;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [generateCustomerData, kMeansClustering, isPlaying]);

  const project3DTo2D = useCallback((x, y, z, rotation) => {
    const rad = Math.PI / 180;
    const { x: rotX, y: rotY, z: rotZ } = rotation;
    
    // Rotation around X-axis
    let x1 = x;
    let y1 = y * Math.cos(rotX * rad) - z * Math.sin(rotX * rad);
    let z1 = y * Math.sin(rotX * rad) + z * Math.cos(rotX * rad);
    
    // Rotation around Y-axis
    let x2 = x1 * Math.cos(rotY * rad) + z1 * Math.sin(rotY * rad);
    let y2 = y1;
    let z2 = -x1 * Math.sin(rotY * rad) + z1 * Math.cos(rotY * rad);
    
    // Rotation around Z-axis
    let x3 = x2 * Math.cos(rotZ * rad) - y2 * Math.sin(rotZ * rad);
    let y3 = x2 * Math.sin(rotZ * rad) + y2 * Math.cos(rotZ * rad);
    let z3 = z2;
    
    const scale = 200 / (200 + z3);
    return { x: x3 * scale, y: y3 * scale, z: z3 };
  }, []);

  const colors = ['#ff6b6b', '#4ecdc4', '#45aaf2', '#fed330'];
  const segmentNames = ['High-Value', 'Young Professionals', 'Steady Savers', 'New Customers'];

  const handleMouseEnter = (customer) => {
    setHoveredCustomer(customer);
  };

  const handleMouseLeave = () => {
    setHoveredCustomer(null);
  };

  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#2c3e50', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="-100 -100 200 200">
        {/* Axis lines */}
        <line x1="-90" y1="0" x2="90" y2="0" stroke="#ecf0f1" strokeWidth="0.5" />
        <line x1="0" y1="-90" x2="0" y2="90" stroke="#ecf0f1" strokeWidth="0.5" />
        <line x1="-90" y1="90" x2="90" y2="90" stroke="#ecf0f1" strokeWidth="0.5" opacity="0.3" />

        {/* Axis labels */}
        <text x="95" y="5" fill="#ecf0f1" fontSize="8">Income</text>
        <text x="-5" y="-95" fill="#ecf0f1" fontSize="8">Age</text>
        <text x="-95" y="95" fill="#ecf0f1" fontSize="8">Transactions</text>

        {/* Customer data points */}
        {customers.map((customer, index) => {
          const { x, y, z } = project3DTo2D(
            (customer.income - 100000) / 1000, 
            (customer.age - 40) * 2, 
            (customer.transactions - 50) * 2, 
            rotation
          );
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={2 + (z + 100) / 40}
                fill={colors[customer.segment]}
                opacity={(z + 100) / 200}
                onMouseEnter={() => handleMouseEnter(customer)}
                onMouseLeave={handleMouseLeave}
              />
              {hoveredCustomer === customer && (
                <text x={x + 5} y={y - 5} fill="#ecf0f1" fontSize="5">
                  Income: ${customer.income.toFixed(0)}
                  Age: {customer.age.toFixed(0)}
                  Transactions: {customer.transactions.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Controls and Legend */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            style={{ padding: '5px 10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button 
            onClick={() => {
              const newCustomerData = generateCustomerData(200, 4);
              const newSegmentedCustomers = kMeansClustering(newCustomerData, 4, 5);
              setCustomers(newSegmentedCustomers);
            }} 
            style={{ padding: '5px 10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
          >
            Regenerate Data
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {segmentNames.map((name, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: colors[index], borderRadius: '50%' }}></div>
              <span style={{ color: '#ecf0f1', fontSize: '12px' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '14px', color: '#ecf0f1' }}>
        Banking Customer Segmentation
      </div>
    </div>
  );
};

export default BankingCustomerSegmentation;
