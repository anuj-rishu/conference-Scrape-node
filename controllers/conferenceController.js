const axios = require("axios");
const cheerio = require("cheerio");
const { TOPICS_LIST, COUNTRIES_LIST } = require("../config/constants");
const { scrapeConfig } = require("../config/headers");
const logger = require("../Utils/logger");

async function scrapeConferences(page, country, topic, subtopic) {
  const baseUrl = "https://academicworldresearch.org/conferences";
  const params = new URLSearchParams();

  if (page > 1) params.append("page", page);
  if (country) params.append("country", country);
  if (topic) params.append("topic", topic);
  if (subtopic) params.append("subtopic", subtopic);

  const queryString = params.toString();
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

  try {
    const response = await axios.get(url, scrapeConfig);
    const html = response.data;
    const $ = cheerio.load(html);
    const conferences = [];

    $("a.block.group").each((index, element) => {
      const el = $(element);
      const relativePath = el.attr("href");
      const conferenceUrl = relativePath
        ? `https://academicworldresearch.org${relativePath}`
        : null;
      const title = el.find("h3").text().trim();
      const category = el.find('span[data-slot="badge"][title]').text().trim();
      const date = el.find("svg.lucide-calendar").next("span").text().trim();
      const location = el.find("svg.lucide-map-pin").next("span").text().trim();

      if (title && conferenceUrl) {
        conferences.push({
          title,
          category,
          date,
          location,
          url: conferenceUrl,
        });
      }
    });

    const hasNextPage =
      $("a").filter((_, el) => $(el).text().trim() === "Next").length > 0;

    return { conferences, hasNextPage, scrapedUrl: url };
  } catch (error) {
    logger.error(`Error fetching URL (${url}): ${error.message}`);
    throw new Error(`Failed to scrape conferences from URL: ${url}`);
  }
}

const getConferences = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const country = req.query.country || null;
  const topic = req.query.topic || null;
  const subtopic = req.query.subtopic || null;

  try {
    const data = await scrapeConferences(page, country, topic, subtopic);

    res.status(200).json({
      success: true,
      metadata: {
        currentPage: page,
        filterCountry: country || "All",
        filterTopic: topic || "All",
        filterSubtopic: subtopic || "All",
        resultsCount: data.conferences.length,
        hasNextPage: data.hasNextPage,
        sourceUrl: data.scrapedUrl,
      },
      data: data.conferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCountries = (req, res) => {
  res.status(200).json({
    success: true,
    count: COUNTRIES_LIST.length,
    data: COUNTRIES_LIST,
  });
};

const getTopics = (req, res) => {
  res.status(200).json({
    success: true,
    count: TOPICS_LIST.length,
    data: TOPICS_LIST,
  });
};

module.exports = {
  getConferences,
  getCountries,
  getTopics,
};
