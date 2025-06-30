import { EnergyData } from '@/types/energy';

// Seed-based random number generator to ensure consistent data across server/client
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const generateMockData = (): EnergyData[] => {
  const data: EnergyData[] = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    // Use deterministic seed based on month/year instead of Math.random()
    const seed = date.getFullYear() * 12 + date.getMonth();
    
    // Generate realistic energy consumption data with seeded randomness
    const baseConsumption = 800 + seededRandom(seed) * 400; // 800-1200 kWh
    const seasonalMultiplier = Math.sin((date.getMonth() * Math.PI) / 6) * 0.3 + 1; // Higher in winter/summer
    const energyConsumption = Math.round(baseConsumption * seasonalMultiplier);
    
    const energyCost = Math.round(energyConsumption * 0.12 * 100) / 100; // $0.12 per kWh
    
    // Calculate savings compared to baseline (1000 kWh)
    const baseline = 1000;
    const energySaved = Math.max(0, baseline - energyConsumption);
    const moneySaved = Math.round(energySaved * 0.12 * 100) / 100;
    
    data.push({
      id: `energy-${seed}`, // Use deterministic ID instead of Date.now()
      date: monthName,
      energyConsumption,
      energyCost,
      energySaved,
      moneySaved,
      savingsPercentage: 0, // Will be calculated separately
    });
  }
  
  // Calculate savings percentage compared to previous month
  return data.map((item, index) => {
    if (index === 0) {
      return { ...item, savingsPercentage: 0 };
    }
    
    const previousConsumption = data[index - 1].energyConsumption;
    const currentConsumption = item.energyConsumption;
    const savingsPercentage = Math.round(
      ((previousConsumption - currentConsumption) / previousConsumption) * 100 * 100
    ) / 100;
    
    return { ...item, savingsPercentage };
  });
};

export const calculateSavingsPercentage = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Math.round(((previous - current) / previous) * 100 * 100) / 100;
};

export const updateSavingsPercentages = (data: EnergyData[]): EnergyData[] => {
  return data.map((item, index) => {
    if (index === 0) {
      return { ...item, savingsPercentage: 0 };
    }
    
    const previousConsumption = data[index - 1].energyConsumption;
    const savingsPercentage = calculateSavingsPercentage(item.energyConsumption, previousConsumption);
    
    return { ...item, savingsPercentage };
  });
};

export const sortData = (data: EnergyData[], field: keyof EnergyData, direction: 'asc' | 'desc'): EnergyData[] => {
  return [...data].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
};

export const filterData = (data: EnergyData[], filters: any): EnergyData[] => {
  return data.filter(item => {
    if (filters.minConsumption && item.energyConsumption < filters.minConsumption) return false;
    if (filters.maxConsumption && item.energyConsumption > filters.maxConsumption) return false;
    if (filters.minCost && item.energyCost < filters.minCost) return false;
    if (filters.maxCost && item.energyCost > filters.maxCost) return false;
    return true;
  });
}; 