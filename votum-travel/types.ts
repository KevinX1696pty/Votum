
export enum TravelMethod {
  PACKAGE = 'package',
  FLIGHT = 'flight',
  BUS = 'bus',
  OWN_CAR = 'own_car',
  RENTAL_CAR = 'rental_car'
}

export enum Importance {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum CostMagnitude {
  LOW = 'bajo',
  MEDIUM = 'medio',
  HIGH = 'alto'
}

export enum Complexity {
  SIMPLE = 'simple',
  MEDIUM = 'media',
  COMPLEX = 'compleja'
}

export enum RecommendationStatus {
  RECOMMENDED = 'recommended',
  POSSIBLE = 'possible',
  NOT_RECOMMENDED = 'not_recommended'
}

export interface UserContext {
  originCountry: string;
  monthlySavings: number;
  initialSavings: number;
  currency: string;
}

export interface TripRequest {
  id: string;
  name: string;
  days: number;
  method: TravelMethod;
  importance: Importance;
  preferredMonth?: number;
}

export interface CostBreakdown {
  flight: number;
  stay: number;
  food: number;
  attractions: number;
}

export interface AnalyzedTrip extends TripRequest {
  isInternational: boolean;
  costMagnitude: CostMagnitude;
  estimatedCostRange: { min: number; max: number };
  manualCost?: number;
  breakdown?: CostBreakdown;
  touristPlaces: string[];
  complexity: Complexity;
  seasonality: string;
  seasonalLevel: 'alta' | 'media' | 'baja';
  experienceDescription: string;
  recommendation: RecommendationStatus;
  reasoning: string;
  plannedMonth?: number;
  imageUrl?: string; // Nueva propiedad para la imagen generada
}
