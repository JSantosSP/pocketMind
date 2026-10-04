const HORIZONS = [1, 3, 5, 10];

const projectHorizon = (principal, monthlyContribution, annualTin, compoundsPerYear, years) => {
  const periods = years * compoundsPerYear;
  const periodRate = annualTin / compoundsPerYear;
  const contributionPerPeriod = monthlyContribution * (12 / compoundsPerYear);
  const contributed = principal + monthlyContribution * 12 * years;

  let total;
  if (periodRate === 0) {
    total = principal + contributionPerPeriod * periods;
  } else {
    const growth = Math.pow(1 + periodRate, periods);
    total = principal * growth + contributionPerPeriod * ((growth - 1) / periodRate);
  }

  return {
    years,
    total,
    contributed,
    interest: total - contributed,
  };
};

export const projectSavings = ({ principal, monthlyContribution, annualTin, compoundsPerYear }) => {
  return HORIZONS.map((years) =>
    projectHorizon(principal, monthlyContribution, annualTin, compoundsPerYear, years)
  );
};
