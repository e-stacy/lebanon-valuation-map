# Methodology

## Core Metrics
- **ASR** = Assessed Value ÷ Sale Price (arms-length only).
- **Percent Difference** = (ASR - 1.0). Over 0 ? over-valued; below 0 ? under-valued.

## Uniformity
- **COD (Coefficient of Dispersion)** = 100 × median(|ASR - median(ASR)|) ÷ median(ASR).

## Price-Related Bias
- **PRD (Price-Related Differential)** = mean(ASR) ÷ weighted mean(ASR).
  - PRD > 1.03 suggests progressivity; PRD < 0.98 suggests regressivity.
- **PRB** (regression of ASR on sale price) is recommended for larger samples.

## Smoothing for Non-Sales
- Non-sales parcels inherit a **neighborhood median ASR** or a local spatial average (k-nearest neighbors).

## Revaluation Windows
- Align sales with the assessment date (e.g., ±12 months around revaluation) and exclude non-market transfers.
