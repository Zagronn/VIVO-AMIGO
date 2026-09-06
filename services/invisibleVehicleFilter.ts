export interface VehicleVerificationInput {
  vinNumber: string;
  licensePlate: string;
  registrationDocumentImage: string;
  ownerDPI: string;
}

export type SatPncStatus = 'CLEAN' | 'STOLEN_ALERT' | 'LEGAL_LIEN' | 'MISMATCH';

export interface VerificationResult {
  isVerified: boolean;
  satPncStatus: SatPncStatus;
  ocrMatched: boolean;
  vivoVerifySealEligible: boolean;
  errorMessage?: string;
}

export interface RegistrationDocumentData {
  vinNumber: string;
  licensePlate: string;
  ownerDPI: string;
}

export interface OfficialVehicleRecord {
  satPncStatus: Exclude<SatPncStatus, 'MISMATCH'>;
  ownerDPI: string;
}

export interface VehicleVerificationAdapters {
  readRegistrationDocument: (image: string) => Promise<RegistrationDocumentData>;
  querySatPnc: (vehicle: Pick<VehicleVerificationInput, 'vinNumber' | 'licensePlate'>) => Promise<OfficialVehicleRecord>;
}

const unavailableAdapters: VehicleVerificationAdapters = {
  async readRegistrationDocument() {
    throw new Error('registration document OCR adapter is not configured');
  },
  async querySatPnc() {
    throw new Error('SAT/PNC adapter is not configured');
  }
};

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

function normalize(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, '');
}

function rejected(errorMessage: string, satPncStatus: SatPncStatus = 'MISMATCH', ocrMatched = false): VerificationResult {
  return { isVerified: false, satPncStatus, ocrMatched, vivoVerifySealEligible: false, errorMessage };
}

export async function processInvisibleVehicleFilter(
  input: VehicleVerificationInput,
  adapters: VehicleVerificationAdapters = unavailableAdapters
): Promise<VerificationResult> {
  try {
    const vinNumber = required(input.vinNumber, 'vinNumber');
    const licensePlate = required(input.licensePlate, 'licensePlate');
    const registrationDocumentImage = required(input.registrationDocumentImage, 'registrationDocumentImage');
    const ownerDPI = required(input.ownerDPI, 'ownerDPI');
    const [document, officialRecord] = await Promise.all([
      adapters.readRegistrationDocument(registrationDocumentImage),
      adapters.querySatPnc({ vinNumber, licensePlate })
    ]);

    const ocrMatched = normalize(document.vinNumber) === normalize(vinNumber)
      && normalize(document.licensePlate) === normalize(licensePlate)
      && normalize(document.ownerDPI) === normalize(ownerDPI);
    const ownerMatched = normalize(officialRecord.ownerDPI) === normalize(ownerDPI);
    const officialRecordClean = officialRecord.satPncStatus === 'CLEAN';

    if (ocrMatched && ownerMatched && officialRecordClean) {
      return { isVerified: true, satPncStatus: 'CLEAN', ocrMatched: true, vivoVerifySealEligible: true };
    }

    if (!officialRecordClean) {
      return rejected('El vehículo tiene una alerta oficial y no puede recibir el sello VIVO-VERIFY.', officialRecord.satPncStatus, ocrMatched);
    }

    return rejected('Los datos del vehículo no coinciden con los registros oficiales de la SAT/PNC.', 'MISMATCH', ocrMatched);
  } catch (error) {
    return rejected(error instanceof Error ? error.message : 'Vehicle verification failed.');
  }
}