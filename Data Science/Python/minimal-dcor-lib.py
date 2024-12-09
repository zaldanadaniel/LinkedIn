import numpy as np
from dcor import distance_correlation

# Generate example data
X = np.random.uniform(-1, 1, 100)
Y = X**2  # Quadratic relationship

# Calculate distance correlation
result = distance_correlation(X, Y)
print(f"Distance correlation: {result:.3f}")  # Should be close to 1