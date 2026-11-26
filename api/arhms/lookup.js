module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const { biller, account } = req.query;

  if (!["dstv", "gotv"].includes(biller)) {
    return res.status(400).json({
      success: false,
      message: "Choose DStv or GOtv."
    });
  }

  if (!account || !/^\d{8,15}$/.test(account)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid Smartcard or IUC number."
    });
  }

  const apiKey = process.env.ARHMS_COMMISSION_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "API configuration is missing."
    });
  }

  try {
    const response = await fetch(
      `https://arhmsgh.com/api/v2/utilities/lookup?biller=${biller}&account=${encodeURIComponent(account)}`,
      {
        method: "GET",
        headers: {
          Authorization: apiKey
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return res.status(response.status).json({
        success: false,
        message: result.error?.message || "Account verification failed."
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Unable to reach the verification service."
    });
  }
};
