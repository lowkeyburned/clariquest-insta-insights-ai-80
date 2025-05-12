
/**
 * Utilities for handling webhook operations
 */

/**
 * Default webhook URLs
 */
export const DEFAULT_WEBHOOK_URL = "http://localhost:5678/webhook/n8n";
export const SECONDARY_WEBHOOK_URL = "https://n8n-loc-app.onrender.com/webhook-test/92f8949a-84e1-4179-990f-83ab97c84700";

/**
 * Send data to multiple webhook URLs
 */
export const sendToWebhooks = async (
  primaryWebhookUrl: string, 
  data: any, 
  options?: { 
    useSecondary?: boolean 
  }
): Promise<{ success: boolean, errors?: any[] }> => {
  const errors: any[] = [];
  
  try {
    // Send to primary webhook
    await fetch(primaryWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      body: JSON.stringify(data),
    });
    
    // Send to secondary webhook if enabled or always send to the render.com webhook
    if (options?.useSecondary || true) {
      await fetch(SECONDARY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(data),
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error sending webhook data:", error);
    errors.push(error);
    return { success: false, errors };
  }
};
