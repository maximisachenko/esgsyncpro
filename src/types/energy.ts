export interface EnergyData {
  id: string;
  date: string;
  energyConsumption: number; // kWh
  energyCost: number; // USD
  energySaved: number; // kWh
  moneySaved: number; // USD
  savingsPercentage: number; // %
}

export interface EnergyDataCreate extends Omit<EnergyData, 'id' | 'savingsPercentage'> {}

export interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  minConsumption?: number;
  maxConsumption?: number;
  minCost?: number;
  maxCost?: number;
}

export type SortField = keyof EnergyData;
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
} 