import type {
  QuoteInputs,
  QuoteCalculation,
  QuoteFieldErrors,
} from '../types/quote';

const MILES_TO_KM = 1.60934;
const MPG_TO_KM_PER_L = 0.425144; // 1 mpg ~ 0.425144 km/l

export const DEFAULT_QUOTE: QuoteInputs = {
  origin: '',
  destination: '',
  distanceUnit: 'km',
  distance: 920,
  cargoWeight: 22,
  emptyTruckWeight: 14,
  efficiencyUnit: 'km/l',
  efficiency: 2.6,
  fuelPrice: 25.8,
  driverDailySalary: 1200,
  tripDays: 2,
  tireWearPerKm: 0.45,
  numberOfTires: 18,
  tolls: 2850,
  perDiem: 1800,
  maintenancePerKm: 1.2,
};

export const normalizeDistanceKm = (
  distance: number,
  unit: QuoteInputs['distanceUnit']
) => (unit === 'mi' ? distance * MILES_TO_KM : distance);

export const normalizeEfficiencyKmPerL = (
  efficiency: number,
  unit: QuoteInputs['efficiencyUnit']
) => (unit === 'mpg' ? efficiency * MPG_TO_KM_PER_L : efficiency);

export const calculateQuote = (input: QuoteInputs): QuoteCalculation => {
  const distanceKm = normalizeDistanceKm(input.distance, input.distanceUnit);
  const efficiency = normalizeEfficiencyKmPerL(
    input.efficiency,
    input.efficiencyUnit
  );

  const safeEfficiency = efficiency > 0 ? efficiency : 1;

  const fuel = (distanceKm / safeEfficiency) * input.fuelPrice;
  const tires = distanceKm * input.tireWearPerKm * input.numberOfTires;
  const maintenance = distanceKm * input.maintenancePerKm;
  const driver = input.driverDailySalary * input.tripDays;
  const tolls = input.tolls;
  const perDiem = input.perDiem;

  const subtotal = fuel + tires + maintenance + driver + tolls + perDiem;
  const total = subtotal;

  return {
    distanceKm,
    fuel,
    tires,
    maintenance,
    driver,
    tolls,
    perDiem,
    subtotal,
    total,
  };
};

const numericFields: Array<keyof QuoteInputs> = [
  'distance',
  'cargoWeight',
  'emptyTruckWeight',
  'efficiency',
  'fuelPrice',
  'driverDailySalary',
  'tripDays',
  'tireWearPerKm',
  'numberOfTires',
  'tolls',
  'perDiem',
  'maintenancePerKm',
];

export const validateQuote = (input: QuoteInputs): QuoteFieldErrors => {
  const errors: QuoteFieldErrors = {};

  if (!input.origin?.trim()) errors.origin = 'Origen requerido';
  if (!input.destination?.trim()) errors.destination = 'Destino requerido';

  numericFields.forEach((field) => {
    const value = input[field] as number;
    if (value === null || value === undefined || Number.isNaN(value)) {
      errors[field] = 'Campo requerido';
      return;
    }
    if (value < 0) {
      errors[field] = 'No puede ser negativo';
      return;
    }
  });

  if (input.distance <= 0)
    errors.distance = 'La distancia debe ser mayor a cero';
  if (input.efficiency <= 0)
    errors.efficiency = 'El rendimiento debe ser mayor a cero';
  if (input.tripDays <= 0)
    errors.tripDays = 'Los dias deben ser mayor a cero';
  if (input.numberOfTires < 1)
    errors.numberOfTires = 'Minimo 1 llanta';

  return errors;
};
