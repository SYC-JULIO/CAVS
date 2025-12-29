
/**
 * Notion 整合服務 (透過 Make.com Webhook)
 */
export const sendToMakeWebhook = async (webhookUrl: string, payload: any) => {
  if (!webhookUrl) {
    throw new Error("請先輸入 Make.com Webhook URL");
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
      source: 'Resident Assessment System'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`匯出失敗: ${response.status} ${errorText}`);
  }

  return true;
};
