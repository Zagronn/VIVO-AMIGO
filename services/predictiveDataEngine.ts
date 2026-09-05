import { analyzeUserIntentAndTriggerCampaign, type TargetedCampaignTarget, type UserBehaviorProfile } from './intentCampaignEngine';
import { validatePrivacyShield, type DataPrivacyConsent } from './privacyShield';

export interface PredictiveIntentInput {
  profile: UserBehaviorProfile;
  consent: DataPrivacyConsent;
}

export function predictCommercialIntent(input: PredictiveIntentInput): TargetedCampaignTarget | null {
  if (!validatePrivacyShield(input.consent)) return null;
  return analyzeUserIntentAndTriggerCampaign(input.profile);
}
