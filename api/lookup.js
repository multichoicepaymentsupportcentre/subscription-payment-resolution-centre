module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const apiKey = process.env.ARHMS_COMMISSION_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "ARHMS API key is not configured"
    });
  }

  const { biller, account } = req.query;

  if (!["dstv", "gotv"].includes(biller)) {
    return res.status(400).json({
      success: false,
      message: "Select DStv or GOtv"
    });
  }

  if (!account || !/^\d{8,12}$/.test(account)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid account number"
    });
  }

  try {
    const response = await fetch(
      "https://arhmsgh.com/api/v2/utilities/lookup?biller=" +
      biller + "&account=" + encodeURIComponent(account),
      {
        method: "GET",
        headers: {
          "Authorization": apiKey,
          "Accept": "application/json"
        }
      }
    );

    const result = await response.json();

    return res.status(response.status).json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to connect to ARHMS"
    });
  }
};
