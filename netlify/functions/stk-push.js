
import { Lipana } from '@lipana/sdk';

export async function handler(event, context) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method Not Allowed" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid JSON in request body" })
    };
  }

  // Expect userId and userName from frontend
  const { phoneNumber, amount, accountType, description, userId, userName } = body;

  if (!phoneNumber || !amount || !accountType || !userId || !userName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Missing required fields" })
    };
  }

  if (typeof amount !== "number" || amount <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid amount" })
    };
  }

  try {
    const lipana = new Lipana({
      apiKey: process.env.LIPANA_SECRET_KEY,
      environment: "production" // or "sandbox"
    });

    // Format phone for Lipana
    let lipanaPhone = phoneNumber.trim();
    if (lipanaPhone.startsWith("0")) {
      lipanaPhone = "254" + lipanaPhone.substring(1);
    } else if (lipanaPhone.startsWith("7")) {
      lipanaPhone = "254" + lipanaPhone;
    }

   const stkResponse = await lipana.transactions.initiateStkPush({
  phone: lipanaPhone,
  amount,
  accountReference: accountType,
  transactionDesc: description || `Payment for ${accountType}`,
  metadata: { userId, userName }
});



return {
  statusCode: 200,
  body: JSON.stringify({
    success: true,
    transactionId: stkResponse.transactionId
  })
};



  } catch (err) {
    console.error("STK Push error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Server error", details: err.message })
    };
  }
}
