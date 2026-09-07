export type MailChannel = 'INFO' | 'SALES';

export interface IncomingEmail {
  id: string;
  from: string;
  subject: string;
  bodyText: string;
  attachments: { fileName: string; fileType: string; isSafe: boolean }[];
  receivedAt: string;
}

export interface AIAnalyzedMail {
  originalMailId: string;
  channel: MailChannel;
  category: 'SUPPORT_FAQ' | 'PARTNERSHIP_LEAD' | 'SPAM_PHISHING' | 'HIGH_VALUE_B2B';
  priorityScore: number;
  aiSummary: string;
  draftedResponse: string;
  requiresHumanAction: boolean;
}

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

function validateMail(mail: IncomingEmail): void {
  required(mail.id, 'id');
  required(mail.from, 'from');
  required(mail.bodyText, 'bodyText');
  if (!Array.isArray(mail.attachments)) throw new Error('attachments must be an array');
  if (!Number.isFinite(new Date(mail.receivedAt).getTime())) throw new Error('receivedAt must be a valid date');
}

export class AiMailHandlerService {
  public async processInfoMail(mail: IncomingEmail): Promise<AIAnalyzedMail> {
    validateMail(mail);
    if (mail.attachments.some((attachment) => attachment.isSafe !== true)) return { originalMailId: mail.id, channel: 'INFO', category: 'SPAM_PHISHING', priorityScore: 0, aiSummary: 'Unsafe attachment detected; message quarantined.', draftedResponse: '', requiresHumanAction: false };
    const body = mail.bodyText.toLowerCase();
    const isTransferQuestion = body.includes('transfer') || body.includes('comision') || body.includes('commission');
    return { originalMailId: mail.id, channel: 'INFO', category: 'SUPPORT_FAQ', priorityScore: 3, aiSummary: isTransferQuestion ? 'User asks about PayVivo transfer fees.' : 'User submitted a general platform support question.', draftedResponse: isTransferQuestion ? 'Hola. En PAY VIVO, los transfers internos son sin cargo y los retiros externos muestran su tarifa antes de confirmar. Consulta las condiciones vigentes en vivoamigo.com.' : 'Hola. Recibimos tu solicitud y el equipo VIVO AMIGO la revisará pronto.', requiresHumanAction: false };
  }

  public async processSalesMail(mail: IncomingEmail): Promise<AIAnalyzedMail> {
    validateMail(mail);
    if (mail.attachments.some((attachment) => attachment.isSafe !== true)) return { originalMailId: mail.id, channel: 'SALES', category: 'SPAM_PHISHING', priorityScore: 0, aiSummary: 'Unsafe attachment detected; message quarantined.', draftedResponse: '', requiresHumanAction: true };
    const body = mail.bodyText.toLowerCase();
    const isEnterprise = ['seguros', 'flota', 'banco', 'bank', 'fleet', 'insurance'].some((term) => body.includes(term));
    const priorityScore = isEnterprise ? 9 : 6;
    return { originalMailId: mail.id, channel: 'SALES', category: isEnterprise ? 'HIGH_VALUE_B2B' : 'PARTNERSHIP_LEAD', priorityScore, aiSummary: `Institutional partnership lead from ${mail.from}; priority ${priorityScore}/10.`, draftedResponse: 'Estimado socio, recibimos su solicitud de alianza. Nuestro equipo comercial revisará el perfil institucional, los requisitos de API y las condiciones del piloto.', requiresHumanAction: true };
  }
}