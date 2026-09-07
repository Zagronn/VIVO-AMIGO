export interface VoiceSearchIntent {
  action: 'SEARCH' | 'CREATE_LISTING' | 'CONFIRM_PAYMENT';
  category?: 'VEHICLE' | 'ELECTRONICS' | 'REAL_ESTATE';
  maxPriceGTQ?: number;
  keyword?: string;
  voiceBiometricScore?: number;
}

export interface DemandPrediction {
  region: string;
  category: string;
  projectedDemandIncreasePercent: number;
  recommendedStockAdjustment: string;
}

export interface VoiceBiometricProvider {
  verify: (transcript: string) => Promise<number>;
}

const unavailableBiometricProvider: VoiceBiometricProvider = {
  async verify() {
    throw new Error('voice biometric provider is not configured');
  }
};

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

function parseMaxPrice(transcript: string): number | undefined {
  const normalized = transcript.toLowerCase().replace(/\./g, '').replace(/,/g, '');
  const direct = normalized.match(/(\d+)\s*(?:gtq|quetzales?)/i);
  const thousands = normalized.match(/(\d+)\s*mil/);
  const value = direct ? Number(direct[1]) : thousands ? Number(thousands[1]) * 1000 : undefined;
  return value && value > 0 ? value : undefined;
}

export class VivoVoiceEngine {
  constructor(private readonly biometricProvider: VoiceBiometricProvider = unavailableBiometricProvider) {}

  public parseVoiceCommand(transcript: string): VoiceSearchIntent {
    const source = required(transcript, 'transcript');
    const lower = source.toLowerCase();
    const maxPriceGTQ = parseMaxPrice(source);
    if (/(ilan oluştur|ilan ver|satmak|sat)/i.test(lower)) return { action: 'CREATE_LISTING', maxPriceGTQ, keyword: source };
    if (/(onayla|ödemeyi yap|ödeme yap|confirm payment)/i.test(lower)) return { action: 'CONFIRM_PAYMENT', keyword: source };
    const category = /(toyota|hilux|araba|araç|vehicle)/i.test(lower) ? 'VEHICLE' : /(ev|emlak|gayrimenkul|casa|real estate)/i.test(lower) ? 'REAL_ESTATE' : 'ELECTRONICS';
    return { action: 'SEARCH', category, maxPriceGTQ, keyword: source };
  }

  public async authorizePaymentVoice(transcript: string, minimumScore = 0.9): Promise<VoiceSearchIntent> {
    const source = required(transcript, 'transcript');
    const score = await this.biometricProvider.verify(source);
    if (!Number.isFinite(score) || score < 0 || score > 1) throw new Error('voice biometric score must be between 0 and 1');
    if (score < minimumScore) throw new Error('voice biometric verification requires manual review');
    return { action: 'CONFIRM_PAYMENT', keyword: source, voiceBiometricScore: score };
  }

  public getRegionalDemandMap(_region: string): DemandPrediction[] {
    return [
      { region: 'Guatemala City - Zona 10', category: 'ELECTRONICS', projectedDemandIncreasePercent: 35, recommendedStockAdjustment: 'Review electronics inventory capacity; projection requires fresh demand data.' },
      { region: 'Quetzaltenango (Xela)', category: 'VEHICLE', projectedDemandIncreasePercent: 22, recommendedStockAdjustment: 'Review utility vehicle inventory and logistics capacity.' }
    ];
  }
}