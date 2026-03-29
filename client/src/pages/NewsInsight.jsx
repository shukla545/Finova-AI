import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ExternalLink,
  X,
  Newspaper,
  FileText,
  TrendingUp,
  Users,
  ShieldCheck,
  Bell,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/news";

const CATEGORY_META = {
  financialNews: {
    title: "Financial News",
    icon: Newspaper,
    subtitle: "Latest finance headlines",
    images: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549421263-6e26f6c08f88?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  researchReports: {
    title: "Research Reports",
    icon: FileText,
    subtitle: "Brokerage & analysis",
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554224155-3a589877462f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  marketInsights: {
    title: "Market Insights",
    icon: TrendingUp,
    subtitle: "Markets & sentiment",
    images: [
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1642052502595-4a5f7fbb3d55?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1624996379697-f01d168b1a52?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518183214770-9cffbec72538?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1642790551116-18e150f24874?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80&sat=-20",
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  customerInformation: {
    title: "Customer Information",
    icon: Users,
    subtitle: "Users & personal finance",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  regulatoryData: {
    title: "Regulatory Data",
    icon: ShieldCheck,
    subtitle: "Policy & compliance",
    images: [
      "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521790361543-f645cf042ec4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80&sat=-40",
      "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

const EMPTY_DATA = {
  financialNews: [],
  researchReports: [],
  marketInsights: [],
  customerInformation: [],
  regulatoryData: [],
};

const fallbackImage =
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80";

const addCategoryImages = (data) => {
  const result = {};
  Object.keys(EMPTY_DATA).forEach((key) => {
    const imgs = CATEGORY_META[key].images || [];
    result[key] = (data[key] || []).map((item, index) => ({
      ...item,
      image: imgs[index % imgs.length] || fallbackImage,
    }));
  });
  return result;
};

const formatTimeAgo = (value) => {
  if (!value) return "Latest";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Latest";

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 60) return `${Math.max(1, mins)}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${days}d`;
};

const filterItem = (item, search) => {
  if (!search.trim()) return true;
  const q = search.toLowerCase();

  return (
    (item.title || "").toLowerCase().includes(q) ||
    (item.description || "").toLowerCase().includes(q) ||
    (item.source || "").toLowerCase().includes(q)
  );
};

function SmallHeadlineRow({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl p-2 text-left transition hover:bg-blue-50"
    >
      <img
        src={item.image}
        alt={item.title}
        className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
      />
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-medium text-gray-900">{item.title}</h4>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
          <span>{item.source || "Source"}</span>
          <span>•</span>
          <span>{formatTimeAgo(item.publishedAt)}</span>
        </div>
      </div>
    </button>
  );
}

function MainFeaturedCard({ item, categoryTitle, onOpenCategory }) {
  if (!item) {
    return (
      <div className="rounded-[24px] border border-blue-200 bg-white p-5 text-gray-900 shadow-lg">
        No featured article available
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-blue-200 bg-white shadow-xl">
      <div className="relative h-[280px] w-full lg:h-[320px]">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {categoryTitle}
          </span>
          <button
            onClick={onOpenCategory}
            className="rounded-full bg-white/15 p-2 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
            <span>{item.source || "Source"}</span>
            <span>•</span>
            <span>{formatTimeAgo(item.publishedAt)}</span>
          </div>

          <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-white">
            {item.title}
          </h2>

          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/75">
            {item.description || "Latest finance update from trusted Indian business sources."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TopStoriesCompact({ items, onOpenCategory }) {
  return (
    <div className="rounded-[24px] border border-blue-200 bg-white p-4 text-gray-900 shadow-xl min-h-[280px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-blue-800">Top stories</h3>
        <button
          onClick={onOpenCategory}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          See more
        </button>
      </div>

      <div className="space-y-3">
        {items.slice(0, 4).map((item, index) => (
          <button
            key={`${item.title}-${index}`}
            onClick={onOpenCategory}
            className="block w-full text-left"
          >
            <div className="text-[11px] text-gray-500">
              {item.source || "Source"} • {formatTimeAgo(item.publishedAt)}
            </div>
            <div className="mt-1 line-clamp-2 text-sm font-medium text-gray-800">
              {item.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CategoryPanel({ categoryKey, items, onOpenCategory }) {
  const meta = CATEGORY_META[categoryKey];
  const Icon = meta.icon;

  return (
    <div className="rounded-[24px] border border-blue-200 bg-white p-3.5 text-gray-900 shadow-xl min-h-[238px]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-800">{meta.title}</h3>
            <p className="text-[11px] text-gray-500">{meta.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => onOpenCategory(categoryKey)}
          className="text-gray-400 transition hover:text-blue-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {items.slice(0, 4).length ? (
          items.slice(0, 4).map((item, index) => (
            <SmallHeadlineRow
              key={`${categoryKey}-${index}-${item.title}`}
              item={item}
              onClick={() => onOpenCategory(categoryKey)}
            />
          ))
        ) : (
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
            No articles available
          </div>
        )}
      </div>
    </div>
  );
}

function ModalNewsCard({ item }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-blue-200 bg-white shadow-xl">
      <img
        src={item.image}
        alt={item.title}
        className="h-52 w-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
      />
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <span>{item.source || "Source"}</span>
          <span>•</span>
          <span>{formatTimeAgo(item.publishedAt)}</span>
        </div>

        <h3 className="text-lg font-semibold leading-7 text-gray-900">{item.title}</h3>

        <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600">
          {item.description || "No description available for this finance news item."}
        </p>

        <a
          href={item.link || item.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Read original article
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function NewsModal({ open, categoryKey, items, onClose }) {
  if (!open || !categoryKey) return null;

  const meta = CATEGORY_META[categoryKey];
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-blue-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{meta.title}</h2>
              <p className="text-sm text-gray-500">Latest Indian finance-related stories</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto bg-white p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {items.length ? (
              items.map((item, index) => (
                <ModalNewsCard key={`${item.title}-${index}`} item={item} />
              ))
            ) : (
              <div className="col-span-full rounded-[24px] border border-blue-100 bg-gray-50 p-8 text-center text-gray-500">
                No news available in this category
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Marquee component for scrolling headlines
function HeadlineMarquee({ headlines }) {
  if (!headlines.length) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-[24px] border border-blue-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          LIVE
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {headlines.map((headline, idx) => (
              <span key={idx} className="mx-6 text-sm font-medium text-gray-700">
                {headline}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 150s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function NewsInsight() {
  const [newsData, setNewsData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchNews = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}${forceRefresh ? "?refresh=true" : ""}`);
      const data = await response.json();
      setNewsData(addCategoryImages({ ...EMPTY_DATA, ...data }));
    } catch (error) {
      console.error("Error fetching news:", error);
      setNewsData(addCategoryImages(EMPTY_DATA));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredData = useMemo(() => {
    const result = {};
    Object.keys(EMPTY_DATA).forEach((key) => {
      result[key] = (newsData[key] || []).filter((item) => filterItem(item, search));
    });
    return result;
  }, [newsData, search]);

  const financialNews = filteredData.financialNews || [];
  const researchReports = filteredData.researchReports || [];
  const marketInsights = filteredData.marketInsights || [];
  const customerInformation = filteredData.customerInformation || [];
  const regulatoryData = filteredData.regulatoryData || [];

  const featuredMain = financialNews[0] || marketInsights[0] || researchReports[0] || null;
  const sideFeature = marketInsights[0] || financialNews[1] || researchReports[1] || null;

  // Build headlines for marquee (prioritize Iran-related, then all finance headlines)
  const allHeadlines = useMemo(() => {
    const allItems = [
      ...financialNews,
      ...researchReports,
      ...marketInsights,
      ...customerInformation,
      ...regulatoryData,
    ];
    const iranHeadlines = allItems.filter(item =>
      item.title?.toLowerCase().includes("iran") ||
      item.description?.toLowerCase().includes("iran")
    );
    const topHeadlines = iranHeadlines.length ? iranHeadlines : allItems.slice(0, 12);
    return topHeadlines.map(item => `${item.title} • ${item.source || "Finance"}`);
  }, [financialNews, researchReports, marketInsights, customerInformation, regulatoryData]);

  const openCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-blue-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">29 March</p>
            <h1 className="mt-1 text-4xl font-bold text-gray-900">Good Afternoon</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search finance news..."
                className="w-[320px] rounded-2xl border border-blue-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>

            <button
              onClick={() => fetchNews(true)}
              className="rounded-2xl border border-blue-200 bg-gray-50 p-3 text-gray-700 transition hover:bg-blue-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <HeadlineMarquee headlines={allHeadlines} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-blue-200 bg-white p-5 text-gray-900 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-800">Missed Insights</h3>
                </div>
                <button className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {(financialNews.slice(0, 3).length ? financialNews.slice(0, 3) : marketInsights.slice(0, 3)).map(
                  (item, index) => (
                    <button
                      key={`${item.title}-${index}`}
                      onClick={() => openCategory("financialNews")}
                      className="block w-full text-left"
                    >
                      <div className="text-[11px] text-gray-500">
                        {item.source || "Finance"} • {formatTimeAgo(item.publishedAt)}
                      </div>
                      <div className="mt-1 line-clamp-3 text-base font-medium text-gray-800">
                        {item.title}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            <CategoryPanel
              categoryKey="financialNews"
              items={financialNews}
              onOpenCategory={openCategory}
            />

            <CategoryPanel
              categoryKey="researchReports"
              items={researchReports}
              onOpenCategory={openCategory}
            />
          </div>

          <div className="space-y-4">
            <MainFeaturedCard
              item={featuredMain}
              categoryTitle="Financial News"
              onOpenCategory={() => openCategory("financialNews")}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-[24px] border border-blue-200 bg-white shadow-xl min-h-[280px]">
                {sideFeature ? (
                  <>
                    <img
                      src={sideFeature.image}
                      alt={sideFeature.title}
                      className="h-[220px] w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                    <div className="p-5">
                      <div className="mb-2 text-xs text-gray-500">
                        {sideFeature.source || "Source"} • {formatTimeAgo(sideFeature.publishedAt)}
                      </div>
                      <h3 className="text-2xl font-semibold leading-tight text-gray-900">
                        {sideFeature.title}
                      </h3>
                      <button
                        onClick={() => openCategory("marketInsights")}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Open related insights
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-5 text-gray-500">No article available</div>
                )}
              </div>

              <TopStoriesCompact
                items={regulatoryData.length ? regulatoryData : researchReports}
                onOpenCategory={() =>
                  openCategory(regulatoryData.length ? "regulatoryData" : "researchReports")
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CategoryPanel
                categoryKey="customerInformation"
                items={customerInformation}
                onOpenCategory={openCategory}
              />
              <CategoryPanel
                categoryKey="regulatoryData"
                items={regulatoryData}
                onOpenCategory={openCategory}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-[24px] border border-blue-200 bg-white shadow-xl min-h-[280px]">
              {marketInsights[1] ? (
                <>
                  <img
                    src={marketInsights[1].image}
                    alt={marketInsights[1].title}
                    className="h-[200px] w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div className="p-5">
                    <div className="mb-2 text-xs text-gray-500">
                      {marketInsights[1].source || "Source"} • {formatTimeAgo(marketInsights[1].publishedAt)}
                    </div>
                    <h3 className="line-clamp-3 text-2xl font-semibold leading-tight text-gray-900">
                      {marketInsights[1].title}
                    </h3>
                    <button
                      onClick={() => openCategory("marketInsights")}
                      className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View all market insights
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-5 text-gray-500">No market insight available</div>
              )}
            </div>

            <CategoryPanel
              categoryKey="marketInsights"
              items={marketInsights}
              onOpenCategory={openCategory}
            />
          </div>
        </div>

        <NewsModal
          open={modalOpen}
          categoryKey={selectedCategory}
          items={selectedCategory ? filteredData[selectedCategory] || [] : []}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}