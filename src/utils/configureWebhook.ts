
import { setSurveyWebhookForCurrentSurvey } from './supabase/webhookHelpers';

// Auto-configure the webhook for the current survey
setSurveyWebhookForCurrentSurvey()
  .then(() => {
    console.log('✅ Webhook configured successfully for survey ad2aa0e1-2e6f-4f67-bcdb-6f034581bb3d');
  })
  .catch((error) => {
    console.error('❌ Failed to configure webhook:', error);
  });
