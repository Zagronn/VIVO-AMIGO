export interface BICreditApplication {
  userId: string;
  assetType: 'VEHICLE' | 'REAL_ESTATE';
  assetVerifiedValueGTQ: number;
  veriShieldScore: number;
  requestedLoanAmountGTQ: number;
}

export interface BICreditPreApproval {
  status: 'PRE_APPROVED';
  bankReferenceId: string;
  approvedAmountGTQ: number;
  monthlyInstallmentGTQ: number;
  tenureMonths: number;
  message: string;
}

export interface BIManualReviewResult {
  status: 'REJECTED_OR_MANUAL_REVIEW';
  message: string;
}

export interface BIApprovalAdapter {
  preApprove: (application: BICreditApplication) => Promise<Omit<BICreditPreApproval, 'status' | 'message'>>;
  createEscrowLiquidityIntent?: (application: BICreditApplication) => Promise<{ liquidityReference: string; status: 'LIQUIDITY_PENDING' }>;
}

export interface BIEscrowLiquidityResult {
  status: 'LIQUIDITY_PENDING' | 'MANUAL_REVIEW';
  liquidityReference?: string;
  message: string;
}

const BI_API_ENDPOINT = 'https://api.bi.com.gt/v1/credits/pre-approve';
const MIN_VERI_SHIELD_SCORE = 85;
const unavailableAdapter: BIApprovalAdapter = {
  async preApprove() {
    throw new Error('Banco Industrial adapter is not configured');
  }
};

function validApplication(application: BICreditApplication): boolean {
  return typeof application.userId === 'string'
    && application.userId.trim() !== ''
    && ['VEHICLE', 'REAL_ESTATE'].includes(application.assetType)
    && Number.isFinite(application.assetVerifiedValueGTQ)
    && application.assetVerifiedValueGTQ > 0
    && Number.isFinite(application.veriShieldScore)
    && application.veriShieldScore >= 0
    && application.veriShieldScore <= 100
    && Number.isFinite(application.requestedLoanAmountGTQ)
    && application.requestedLoanAmountGTQ > 0
    && application.requestedLoanAmountGTQ <= application.assetVerifiedValueGTQ;
}

export class BancoIndustrialBridge {
  public readonly apiEndpoint = BI_API_ENDPOINT;

  constructor(private readonly adapter: BIApprovalAdapter = unavailableAdapter) {}

  public async processInstantLoan(application: BICreditApplication): Promise<BICreditPreApproval | BIManualReviewResult> {
    if (!validApplication(application)) {
      return { status: 'REJECTED_OR_MANUAL_REVIEW', message: 'Los datos de crédito o del activo requieren revisión manual.' };
    }
    if (application.veriShieldScore < MIN_VERI_SHIELD_SCORE) {
      return { status: 'REJECTED_OR_MANUAL_REVIEW', message: 'VERI-SHIELD requiere una puntuación mínima para solicitar revisión crediticia.' };
    }

    try {
      const approval = await this.adapter.preApprove(application);
      return { ...approval, status: 'PRE_APPROVED', message: 'Solicitud recibida por Banco Industrial para pre-aprobación en payvivoamigo.com.' };
    } catch {
      return { status: 'REJECTED_OR_MANUAL_REVIEW', message: 'La solicitud requiere revisión manual del socio financiero.' };
    }
  }

  public async connectEscrowLiquidity(application: BICreditApplication): Promise<BIEscrowLiquidityResult> {
    if (!validApplication(application) || application.veriShieldScore < MIN_VERI_SHIELD_SCORE) {
      return { status: 'MANUAL_REVIEW', message: 'La liquidez de escrow requiere verificación financiera y VERI-SHIELD aprobados.' };
    }
    if (!this.adapter.createEscrowLiquidityIntent) return { status: 'MANUAL_REVIEW', message: 'La conexión de liquidez BI requiere revisión del socio financiero.' };
    try {
      const intent = await this.adapter.createEscrowLiquidityIntent(application);
      return { ...intent, message: 'Solicitud de liquidez escrow enviada a Banco Industrial para revisión.' };
    } catch {
      return { status: 'MANUAL_REVIEW', message: 'La conexión de liquidez BI requiere revisión del socio financiero.' };
    }
  }
}
