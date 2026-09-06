export type FleetVehicleType = 'TRUCK_HEAVY' | 'VAN_CARGO' | 'MOTORCYCLE_EXPRESS';

export interface FleetVehicle {
  vehicleId: string;
  driverName: string;
  driverDpi: string;
  plateNumber: string;
  vehicleType: FleetVehicleType;
  brandingStatus: 'REFLECTIVE_VINYL_APPLIED';
  safetyScore: number;
  isOverspeeding: boolean;
  gpsCoordinates: { lat: number; lng: number };
}

export interface DriverSafetyAlert {
  vehicleId: string;
  penaltyApplied: boolean;
  newSafetyScore: number;
  message: string;
}

export function processVehicleTelematics(vehicle: FleetVehicle, currentSpeedKmh: number, maxSpeedLimitKmh: number): DriverSafetyAlert {
  if (!vehicle.vehicleId.trim()) throw new Error('vehicleId is required');
  if (!Number.isFinite(currentSpeedKmh) || currentSpeedKmh < 0) throw new Error('currentSpeedKmh must be non-negative');
  if (!Number.isFinite(maxSpeedLimitKmh) || maxSpeedLimitKmh <= 0) throw new Error('maxSpeedLimitKmh must be greater than zero');
  if (!Number.isFinite(vehicle.safetyScore) || vehicle.safetyScore < 0 || vehicle.safetyScore > 100) throw new Error('safetyScore must be between 0 and 100');

  const isSpeeding = currentSpeedKmh > maxSpeedLimitKmh;
  if (isSpeeding) {
    const newScore = Math.max(0, vehicle.safetyScore - 5);
    return {
      vehicleId: vehicle.vehicleId,
      penaltyApplied: true,
      newSafetyScore: newScore,
      message: `ALERTA "Transportamos Vidas": Exceso de velocidad detectado (${currentSpeedKmh} km/h). Deducción de 5 puntos de seguridad.`
    };
  }

  return {
    vehicleId: vehicle.vehicleId,
    penaltyApplied: false,
    newSafetyScore: vehicle.safetyScore,
    message: 'Conducción segura dentro de los parámetros de CARGO VIVO.'
  };
}
