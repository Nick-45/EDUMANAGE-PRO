

import admin from "firebase-admin";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

export async function handler(event) {
  try {
    const payload = JSON.parse(event.body);

    console.log("Lipana callback received:", payload);

    /*
      Expected Lipana callback structure (example)
      Adjust field names if Lipana sends slightly different ones.
    */
    const {
      status,
      amount,
      phone,
      accountReference,
      transactionId,
      mpesaReference,
      metadata
    } = payload;

    // Optional: extract user info from metadata if you passed it in stk-push
    const userId = metadata?.userId || null;
    const userName = metadata?.userName || "Church Member";

    // Only record successful payments
    if (status === "SUCCESS") {
      await db.collection("transactions").add({
        userId,
        userName,
        phone,
        amount: Number(amount),
        accountType: accountReference,
        transactionId: stkResponse.transactionId,
        mpesaReference: mpesaReference || "",
        status: "successful",
        createdAt: new Date().toISOString()
      });

      console.log("Payment saved to Firestore");
    } else {
      console.log("Payment not successful:", status);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error("Callback error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Callback processing failed" })
    };
  }
}
