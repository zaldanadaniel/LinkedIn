import React, { useState, useEffect } from 'react';
import { Search, Filter, Brain, Database, Target, Award, BarChart2 } from 'lucide-react';

const SemanticSearchVisualization = () => {
  const [activeStep, setActiveStep] = useState(-1);
  const [isHovering, setIsHovering] = useState(null);
  const [showFinalAnimation, setShowFinalAnimation] = useState(false);

  const colorPalette = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];

  const steps = [
    { Icon: Search, title: 'User Query', description: 'Input search query' },
    { Icon: Filter, title: 'Preprocessing', description: 'Tokenize and clean' },
    { Icon: Brain, title: 'Embedding', description: 'Generate vector' },
    { Icon: Database, title: 'Indexing', description: 'Store embeddings' },
    { Icon: Target, title: 'Retrieval', description: 'Find matches' },
    { Icon: Award, title: 'Ranking', description: 'Sort by relevance' },
    { Icon: BarChart2, title: 'Results', description: 'Present to user' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => {
        if (prevStep < steps.length - 1) {
          return prevStep + 1;
        } else {
          clearInterval(timer);
          setShowFinalAnimation(true);
          return prevStep;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const Component = ({ Icon, title, description, index, isActive }) => (
    <div 
      className={`component ${isActive ? 'active' : ''} ${isHovering === index ? 'hover' : ''}`}
      style={{ 
        backgroundColor: colorPalette[index],
        animationDelay: `${index * 1}s`
      }}
      onMouseEnter={() => setIsHovering(index)}
      onMouseLeave={() => setIsHovering(null)}
    >
      <Icon size={50} className="icon" color="white" />
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="tooltip">{description}</div>
    </div>
  );

  const Arrow = ({ index }) => (
    <div className="arrow-container" style={{ animationDelay: `${index * 1 + 0.5}s` }}>
      <div className="arrow" style={{ backgroundColor: colorPalette[index] }}></div>
    </div>
  );

  return (
    <div className="visualization-container">
      <h2 className="title">Semantic Search Process</h2>
      <div className={`semantic-search-container ${showFinalAnimation ? 'final-animation' : ''}`}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <Component
              {...step}
              index={index}
              isActive={activeStep >= index}
            />
            {index < steps.length - 1 && <Arrow index={index} />}
          </React.Fragment>
        ))}
      </div>
      <div className="credits">
        Created by Daniel Zaldaña <a href="https://www.linkedin.com/in/danielzaldana/" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/danielzaldana/</a>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes flow {
          0% { width: 0; }
          100% { width: 100%; }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
          100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
        }
        @keyframes zoomOut {
          from { transform: scale(1); }
          to { transform: scale(0.95); }
        }
        .visualization-container {
          font-family: 'Arial', sans-serif;
          padding: 30px;
          background: #2f3e46;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          animation: fadeIn 1s ease-out;
        }
        .title {
          text-align: center;
          color: #f9c74f;
          margin-bottom: 30px;
          font-size: 28px;
          animation: fadeIn 1s ease-out;
        }
        .semantic-search-container {
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-x: auto;
          padding: 20px 0;
        }
        .component {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          width: 160px;
          height: 250px;
          text-align: center;
          margin: 0 15px;
          opacity: 0;
          animation: slideIn 1s ease-out forwards, bounce 1s ease-out 1s;
        }
        .component.active {
          animation: slideIn 1s ease-out forwards, bounce 1s ease-out 1s, glow 2s infinite;
        }
        .component:hover {
          transform: scale(1.05);
        }
        .component.hover {
          animation: glow 2s infinite;
        }
        .icon {
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }
        .component:hover .icon {
          transform: scale(1.1);
        }
        h3 {
          margin: 15px 0 10px;
          font-size: 1.2em;
          font-weight: bold;
          color: white;
        }
        p {
          font-size: 0.9em;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        .arrow-container {
          display: flex;
          align-items: center;
          width: 50px;
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }
        .arrow {
          width: 0;
          height: 3px;
          position: relative;
          animation: flow 1s ease-out forwards;
        }
        .arrow::after {
          content: '';
          position: absolute;
          right: -6px;
          top: -5px;
          width: 0;
          height: 0;
          border-left: 12px solid;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
        }
        .tooltip {
          position: absolute;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.9em;
          bottom: 105%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          width: 180px;
        }
        .component:hover .tooltip {
          opacity: 1;
        }
        .final-animation {
          animation: zoomOut 1s ease-out forwards;
        }
        .credits {
          text-align: center;
          margin-top: 30px;
          color: white;
          font-size: 1em;
        }
        .credits a {
          color: white;
          text-decoration: none;
        }
        .credits a:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .semantic-search-container {
            flex-direction: column;
          }
          .component {
            margin-bottom: 30px;
            width: 90%;
            height: auto;
            min-height: 220px;
          }
          .arrow-container {
            width: 3px;
            height: 50px;
            margin: 15px 0;
          }
          .arrow {
            width: 3px;
            height: 0;
            animation: flow 1s ease-out forwards;
          }
          .arrow::after {
            right: -5px;
            top: auto;
            bottom: -6px;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 12px solid;
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SemanticSearchVisualization;
