import { useState } from "react";
import { Check, Save, Pencil, X, Upload, FileText } from "lucide-react";

// ── Mock user ────────────────────────────────────────────────────────────────
const user = {
  id: "user_001",
  fullName: "Vinit Kaple",
  gmail: "vinitskaple@gmail.com",
  phone: "+917276185419",
  riskAppetite: "Moderate",
  investmentExperience: "Intermediate",
  monthlyIncome: 95000,
  monthlyInvestableSurplus: 22000,
  financialGoals: ["Wealth Creation", "Retirement", "Emergency Fund"],
  investmentHorizon: "Medium",
  createdAt: "2024-06-01",
};

// ── Mock portfolio ───────────────────────────────────────────────────────────
const initialPortfolio = [
  {
    id: "p001",
    assetClass: "Stocks",
    assetName: "Infosys Ltd",
    ticker: "INFY",
    units: 18,
    avgBuyPrice: 1724.5,
    currentPrice: 1581.2,
    sector: "IT",
    exchange: "NSE",
  },
  {
    id: "p002",
    assetClass: "Stocks",
    assetName: "HDFC Bank Ltd",
    ticker: "HDFCBANK",
    units: 12,
    avgBuyPrice: 1642.0,
    currentPrice: 1489.75,
    sector: "Banking",
    exchange: "NSE",
  },
  {
    id: "p003",
    assetClass: "Stocks",
    assetName: "Reliance Industries",
    ticker: "RELIANCE",
    units: 8,
    avgBuyPrice: 2915.0,
    currentPrice: 2614.3,
    sector: "Energy",
    exchange: "NSE",
  },
  {
    id: "p004",
    assetClass: "Mutual Funds",
    assetName: "Mirae Asset Large Cap",
    ticker: "MIRAE_LC",
    units: 312.45,
    avgBuyPrice: 112.4,
    currentPrice: 104.8,
    sector: "Diversified",
    exchange: "MF",
  },
  {
    id: "p005",
    assetClass: "Mutual Funds",
    assetName: "Quant Technology Fund",
    ticker: "QUANT_TECH",
    units: 185.0,
    avgBuyPrice: 98.6,
    currentPrice: 60.2,
    sector: "Technology",
    exchange: "MF",
  },
  {
    id: "p006",
    assetClass: "Gold",
    assetName: "Sovereign Gold Bond 2024",
    ticker: "SGB2024",
    units: 4,
    avgBuyPrice: 6342.0,
    currentPrice: 16791.5,
    sector: "Commodity",
    exchange: "BSE",
  },
];

// ── Constants ────────────────────────────────────────────────────────────────
const allGoals = [
  "Wealth Creation",
  "Retirement",
  "Emergency Fund",
  "Child Education",
  "Home Purchase",
  "Tax Saving",
];
const horizonOptions = ["Short (< 3 yrs)", "Medium (3–7 yrs)", "Long (7+ yrs)"];
const riskOptions = ["Conservative", "Moderate", "Aggressive"];
const experienceOptions = ["Beginner", "Intermediate", "Advanced"];

// ── Small reusable components ─────────────────────────────────────────────────
const Tag = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all
      ${active ? "bg-amber-50 border-amber-400 text-amber-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
  >
    {label}
  </button>
);

const FieldRow = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const StyledInput = ({ value, onChange, type = "text", prefix, readOnly }) => (
  <div className="relative">
    {prefix && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
        {prefix}
      </span>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full border rounded-lg py-2 text-sm outline-none transition-colors
        ${prefix ? "pl-7 pr-3" : "px-3"}
        ${
          readOnly
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-default"
            : "bg-white border-gray-200 text-gray-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-50"
        }`}
    />
  </div>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
    {children}
  </p>
);

// ── Asset class badge colours ─────────────────────────────────────────────────
const classBadge = {
  Stocks: "bg-blue-50 text-blue-600",
  "Mutual Funds": "bg-purple-50 text-purple-600",
  Gold: "bg-amber-50 text-amber-600",
  Crypto: "bg-orange-50 text-orange-600",
  ETFs: "bg-teal-50 text-teal-600",
  FDs: "bg-green-50 text-green-600",
};

// ── Main component ────────────────────────────────────────────────────────────
export default function Settings() {
  // profile form
  const [form, setForm] = useState({
    fullName: user.fullName,
    gmail: user.gmail,
    phone: user.phone,
    monthlyIncome: user.monthlyIncome,
    monthlyInvestableSurplus: user.monthlyInvestableSurplus,
    riskAppetite: user.riskAppetite,
    investmentExperience: user.investmentExperience,
    investmentHorizon: user.investmentHorizon,
    financialGoals: [...user.financialGoals],
  });

  // portfolio prices
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [editingId, setEditingId] = useState(null); // which row is being edited
  const [draftPrice, setDraftPrice] = useState("");

  const [pdfFile, setPdfFile] = useState(null);

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const toggleGoal = (goal) =>
    setForm((f) => ({
      ...f,
      financialGoals: f.financialGoals.includes(goal)
        ? f.financialGoals.filter((g) => g !== goal)
        : [...f.financialGoals, goal],
    }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  // price editing helpers
  const startEdit = (item) => {
    setEditingId(item.id);
    setDraftPrice(String(item.currentPrice));
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraftPrice("");
  };
  const confirmEdit = (id) => {
    const val = parseFloat(draftPrice);
    if (!isNaN(val) && val > 0) {
      setPortfolio((p) =>
        p.map((item) =>
          item.id === id ? { ...item, currentPrice: val } : item,
        ),
      );
    }
    cancelEdit();
  };

  const pnl = (item) => (item.currentPrice - item.avgBuyPrice) * item.units;
  const pnlPct = (item) =>
    ((item.currentPrice - item.avgBuyPrice) / item.avgBuyPrice) * 100;

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "investment", label: "Investment Profile" },
    { id: "prices", label: "Update Prices" },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Ingest Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your profile, preferences and asset prices
        </p>
        <div className="flex mt-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id ? "border-amber-500 text-amber-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="p-6 max-w-3xl space-y-4">
        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <>
            <Card>
              <CardTitle>Identity</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Full Name">
                  <StyledInput
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                  />
                </FieldRow>
                <FieldRow label="Email Address">
                  <StyledInput
                    value={form.gmail}
                    onChange={(e) =>
                      setForm({ ...form, gmail: e.target.value })
                    }
                    type="email"
                  />
                </FieldRow>
                <FieldRow label="Phone Number">
                  <StyledInput
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </FieldRow>
                <FieldRow label="Member Since">
                  <StyledInput
                    readOnly
                    value={new Date(user.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  />
                </FieldRow>
              </div>
            </Card>

            <Card>
              <CardTitle>Financials</CardTitle>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FieldRow label="Monthly Income">
                  <StyledInput
                    value={form.monthlyIncome}
                    onChange={(e) =>
                      setForm({ ...form, monthlyIncome: e.target.value })
                    }
                    type="number"
                    prefix="₹"
                  />
                </FieldRow>
                <FieldRow label="Investable Surplus / Month">
                  <StyledInput
                    value={form.monthlyInvestableSurplus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthlyInvestableSurplus: e.target.value,
                      })
                    }
                    type="number"
                    prefix="₹"
                  />
                </FieldRow>
              </div>
              <div className="flex justify-between items-center bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
                <span className="text-sm text-amber-700 font-medium">
                  Surplus Ratio
                </span>
                <span className="text-sm font-semibold text-amber-700">
                  {(
                    (form.monthlyInvestableSurplus / form.monthlyIncome) *
                    100
                  ).toFixed(1)}
                  % of income
                </span>
              </div>
            </Card>
          </>
        )}

        {/* ── INVESTMENT PROFILE TAB ── */}
        {activeTab === "investment" && (
          <>
            <Card>
              <CardTitle>Investor Profile</CardTitle>
              <div className="space-y-5">
                <FieldRow label="Risk Appetite">
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {riskOptions.map((opt) => (
                      <Tag
                        key={opt}
                        label={opt}
                        active={form.riskAppetite === opt}
                        onClick={() => setForm({ ...form, riskAppetite: opt })}
                      />
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Investment Experience">
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {experienceOptions.map((opt) => (
                      <Tag
                        key={opt}
                        label={opt}
                        active={form.investmentExperience === opt}
                        onClick={() =>
                          setForm({ ...form, investmentExperience: opt })
                        }
                      />
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Investment Horizon">
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {horizonOptions.map((opt) => (
                      <Tag
                        key={opt}
                        label={opt}
                        active={form.investmentHorizon === opt}
                        onClick={() =>
                          setForm({ ...form, investmentHorizon: opt })
                        }
                      />
                    ))}
                  </div>
                </FieldRow>
              </div>
            </Card>

            <Card>
              <CardTitle>Financial Goals</CardTitle>
              <p className="text-sm text-gray-400 mb-3">
                Select all that apply
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {allGoals.map((goal) => (
                  <Tag
                    key={goal}
                    label={goal}
                    active={form.financialGoals.includes(goal)}
                    onClick={() => toggleGoal(goal)}
                  />
                ))}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
                <span className="font-medium text-gray-600">
                  {form.financialGoals.length} goal
                  {form.financialGoals.length !== 1 ? "s" : ""} selected
                </span>
                {form.financialGoals.length > 0 && (
                  <span className="text-gray-400">
                    {" "}
                    · {form.financialGoals.join(", ")}
                  </span>
                )}
              </div>
            </Card>
          </>
        )}

        {/* ── UPDATE PRICES TAB ── */}
        {activeTab === "prices" && (
          <Card className="!p-0 overflow-hidden">
            {/* PDF Upload Section */}
            <div className="px-5 py-4 border-b border-gray-100 bg-amber-50/40">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Import Portfolio via PDF
              </p>
              <label
                htmlFor="pdf-upload"
                className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-6 px-4 cursor-pointer transition-all duration-200
          ${
            pdfFile
              ? "border-amber-400 bg-amber-50"
              : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/60"
          }`}
              >
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPdfFile(file);
                  }}
                />
                {pdfFile ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(pdfFile.size / 1024).toFixed(1)} KB · PDF
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setPdfFile(null);
                      }}
                      className="ml-2 p-1.5 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="p-2.5 bg-gray-100 rounded-xl">
                      <Upload size={18} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      Drop your portfolio PDF here
                    </p>
                    <p className="text-xs text-gray-400">
                      or{" "}
                      <span className="text-amber-500 font-medium">
                        browse to upload
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      Only .pdf files accepted
                    </p>
                  </div>
                )}
              </label>

              {pdfFile && (
                <button
                  onClick={() => {
                    // handle PDF processing here
                    alert(`Processing: ${pdfFile.name}`);
                  }}
                  className="mt-3 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
                >
                  Parse & Import Portfolio
                </button>
              )}
            </div>

            {/* Existing header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Asset Prices
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                Click the edit icon to update the current price for any holding
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {portfolio.map((item) => {
                const gain = pnl(item);
                const gainPct = pnlPct(item);
                const isPos = gain >= 0;
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Asset info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {item.assetName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${classBadge[item.assetClass] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {item.ticker}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {item.assetClass} · {item.exchange} · {item.units} units
                      </p>
                    </div>

                    {/* Buy price */}
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400 mb-0.5">Avg Buy</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.avgBuyPrice.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Current price — view or edit */}
                    <div className="text-right min-w-[120px]">
                      <p className="text-xs text-gray-400 mb-1">
                        Current Price
                      </p>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={draftPrice}
                              onChange={(e) => setDraftPrice(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") confirmEdit(item.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              autoFocus
                              className="w-24 pl-5 pr-2 py-1 text-sm border border-amber-400 rounded-md outline-none focus:ring-2 focus:ring-amber-100 text-gray-800"
                            />
                          </div>
                          <button
                            onClick={() => confirmEdit(item.id)}
                            className="p-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            ₹{item.currentPrice.toLocaleString("en-IN")}
                          </span>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1 rounded-md text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* P&L */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-xs text-gray-400 mb-0.5">P&L</p>
                      <p
                        className={`text-sm font-semibold ${isPos ? "text-green-600" : "text-red-500"}`}
                      >
                        {isPos ? "+" : ""}₹
                        {Math.abs(gain).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <p
                        className={`text-xs ${isPos ? "text-green-500" : "text-red-400"}`}
                      >
                        {isPos ? "+" : ""}
                        {gainPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Save button (profile + investment tabs only) ── */}
        {(activeTab === "profile" || activeTab === "investment") && (
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all
                ${saved ? "bg-green-500 text-white" : "bg-amber-500 text-white hover:bg-amber-600"}`}
            >
              {saved ? (
                <>
                  <Check size={15} /> Saved
                </>
              ) : (
                <>
                  <Save size={15} /> Save Changes
                </>
              )}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                Profile updated successfully
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
