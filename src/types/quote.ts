export type DistanceUnit = 'km' | 'mi';
export type EfficiencyUnit = 'km/l' | 'mpg';

export type QuoteInputs = {
  origin: string;
  destination: string;
  distanceUnit: DistanceUnit;
  distance: number;
  cargoWeight: number; // toneladas
  emptyTruckWeight: number; // toneladas
  efficiencyUnit: EfficiencyUnit;
  efficiency: number; // km/l o mpg segun unidad
  fuelPrice: number; // MXN por litro (siempre)
  driverDailySalary: number; // MXN
  tripDays: number;
  tireWearPerKm: number; // MXN/km por llanta
  numberOfTires: number;
  tolls: number; // MXN
  perDiem: number; // MXN
  maintenancePerKm: number; // MXN/km
};

export type QuoteCalculation = {
  distanceKm: number;
  fuel: number;
  tires: number;
  maintenance: number;
  driver: number;
  tolls: number;
  perDiem: number;
  subtotal: number;
  total: number;
};

export type QuoteFieldErrors = Partial<Record<keyof QuoteInputs, string>>;
