import numpy as np
import pandas as pd
from scipy import stats
from dcor import distance_correlation
from scipy.stats import chi2_contingency

def generate_sample_data(n=100):
    """Generate sample data with different relationship patterns."""
    np.random.seed(42)
    
    # Linear relationship
    x1 = np.random.normal(0, 1, n)
    y1 = 0.8 * x1 + np.random.normal(0, 0.2, n)
    
    # Monotonic but non-linear relationship
    x2 = np.random.uniform(-3, 3, n)
    y2 = x2**2 + np.random.normal(0, 1, n)
    
    # Complex non-linear relationship
    x3 = np.linspace(-3, 3, n)
    y3 = np.sin(x3) + np.random.normal(0, 0.2, n)
    
    return pd.DataFrame({
        'x1': x1, 'y1': y1,  # Linear
        'x2': x2, 'y2': y2,  # Monotonic
        'x3': x3, 'y3': y3   # Non-linear
    })

def analyze_correlations(x, y, method_name=""):
    """Calculate and format multiple correlation coefficients with p-values."""
    results = {}
    
    # Pearson correlation
    pearson_corr, pearson_p = stats.pearsonr(x, y)
    results['Pearson'] = {
        'correlation': pearson_corr,
        'p_value': pearson_p
    }
    
    # Spearman correlation
    spearman_corr, spearman_p = stats.spearmanr(x, y)
    results['Spearman'] = {
        'correlation': spearman_corr,
        'p_value': spearman_p
    }
    
    # Kendall correlation
    kendall_corr, kendall_p = stats.kendalltau(x, y)
    results['Kendall'] = {
        'correlation': kendall_corr,
        'p_value': kendall_p
    }
    
    # Distance correlation (no p-value available)
    dist_corr = distance_correlation(x, y)
    results['Distance'] = {
        'correlation': dist_corr,
        'p_value': None
    }
    
    # Format and print results
    print(f"\nCorrelation Analysis{': ' + method_name if method_name else ''}")
    print("-" * 50)
    for method, values in results.items():
        corr = values['correlation']
        p_val = values['p_value']
        
        print(f"\n{method} Correlation:")
        print(f"  Coefficient: {corr:.4f}")
        if p_val is not None:
            print(f"  P-value: {p_val:.4e}")
            print(f"  Significance: {'Significant' if p_val < 0.05 else 'Not significant'} at α=0.05")
    
    return results

def cramer_v(x, y):
    """Calculate Cramer's V statistic for categorical variables."""
    contingency_table = pd.crosstab(x, y)
    chi2, p_value, dof, expected = chi2_contingency(contingency_table)
    n = len(x)
    min_dim = min(contingency_table.shape) - 1
    cramer = np.sqrt(chi2 / (n * min_dim))
    
    print("\nCramer's V Analysis")
    print("-" * 50)
    print(f"Cramer's V: {cramer:.4f}")
    print(f"Chi-square p-value: {p_value:.4e}")
    print(f"Significance: {'Significant' if p_value < 0.05 else 'Not significant'} at α=0.05")
    print("\nContingency Table (Counts):")
    print(contingency_table)
    print("\nContingency Table (Proportions):")
    print(contingency_table / contingency_table.sum())
    
    return cramer, p_value

def interpret_correlation(correlation):
    """Provide interpretation of correlation strength."""
    abs_corr = abs(correlation)
    if abs_corr < 0.1:
        return "Negligible"
    elif abs_corr < 0.3:
        return "Weak"
    elif abs_corr < 0.5:
        return "Moderate"
    elif abs_corr < 0.7:
        return "Strong"
    else:
        return "Very Strong"

# Example usage
if __name__ == "__main__":
    # Generate sample data
    df = generate_sample_data(1000)
    
    # Analyze different relationships
    relationships = [
        ('Linear', 'x1', 'y1'),
        ('Monotonic', 'x2', 'y2'),
        ('Non-linear', 'x3', 'y3')
    ]
    
    # Calculate and display correlations for each relationship
    for name, x, y in relationships:
        results = analyze_correlations(df[x], df[y], name)
        print("\nInterpretation:")
        for method, values in results.items():
            strength = interpret_correlation(values['correlation'])
            print(f"{method}: {strength} relationship")
        print("\n" + "="*50)
    
    # Example with categorical variables
    df['cat1'] = pd.qcut(df['x1'], q=4, labels=['A', 'B', 'C', 'D'])
    df['cat2'] = pd.qcut(df['y1'], q=3, labels=['Low', 'Medium', 'High'])
    cramer_v(df['cat1'], df['cat2'])
