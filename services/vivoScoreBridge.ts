export interface VivoScoreRequest {
  userId: string;
  nitOrDpi: string;
  consentGiven: boolean;
}

export interface VivoScoreResponse {
  creditScore: number;
  maxCreditAmountGTQ: number;
  preApprovedOffersCount: number;
  aiRecommendations: string[];
}

export interface VivoScoreProvider {
  fetchScore: (request: VivoScoreRequest) => Promise<VivoScoreResponse>;
}

const VIVOSCORE_ENDPOINT = 'https://api.bi.com.gt/v1/fintech/vivoscore';
const unavailableProvider: VivoScoreProvider = {
  async fetchScore() {
    throw new Error('Banco Industrial VivoScore provider is not configured');
  }
};

function validRequest(request: VivoScoreRequest): boolean {
  return typeof request.userId === 'string' && request.userId.trim() !== ''
    && typeof request.nitOrDpi === 'string' && request.nitOrDpi.trim() !== ''
    && request.consentGiven === true;
}

function validResponse(response: VivoScoreResponse): boolean {
  return Number.isInteger(response.creditScore) && response.creditScore >= 300 && response.creditScore <= 850
    && Number.isFinite(response.maxCreditAmountGTQ) && response.maxCreditAmountGTQ >= 0
    && Number.isInteger(response.preApprovedOffersCount) && response.preApprovedOffersCount >= 0
    && Array.isArray(response.aiRecommendations) && response.aiRecommendations.every((item) => typeof item === 'string');
}

export class VivoScoreBridge {
  public readonly endpoint = VIVOSCORE_ENDPOINT;

  constructor(private readonly provider: VivoScoreProvider = unavailableProvider) {}

  public async fetchUserScore(request: VivoScoreRequest): Promise<VivoScoreResponse> {
    if (!request.consentGiven) throw new Error('VERI-SHIELD: Consent required for FinTech score retrieval.');
    if (!validRequest(request)) throw new Error('userId and NIT/DPI are required for VivoScore retrieval.');
    const response = await this.provider.fetchScore(request);
    if (!validResponse(response)) throw new Error('VivoScore provider returned an invalid response.');
    return response;
  }
}
