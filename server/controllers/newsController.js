import { getCategorizedFinanceNews } from "../services/newsService.js";

export const fetchNews = async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const news = await getCategorizedFinanceNews(forceRefresh);

    res.status(200).json(news);
  } catch (error) {
    console.error("fetchNews controller error:", error.message);
    res.status(500).json({
      financialNews: [],
      researchReports: [],
      marketInsights: [],
      customerInformation: [],
      regulatoryData: [],
      error: "Failed to fetch news",
    });
  }
};