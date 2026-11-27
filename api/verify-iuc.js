module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { biller, account } = req.body;

    if (!["dstv", "gotv"].includes(biller)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decoder type"
      });
    }

    if (!/^\d{5,20}$/.test(account || "")) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid IUC number"
      });
    }

    const response = await fetch(
      `https://arhmsgh.com/api/v2/utilities/lookup?biller=${biller}&account=${encodeURIComponent(account)}`,
      {
        headers: {
          Authorization: process.env.ARHMS_COMMISSION_KEY
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return res.status(response.status).json({
        success: false,
        message: result.error?.message || "Account verification failed"
      });
    }

    return res.status(200).json({
      success: true,
      account_name: result.data.account_name
    });

  } catch (error) {
    console.error("ARHMS verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Verification service temporarily unavailable"
    });
  }
};
