import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPills,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaThList,
  FaThLarge,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaCheckCircle,
  FaBoxes,
  FaDownload,
  FaTag,
  FaTimes,
  FaExclamationCircle,
} from "react-icons/fa";
import AppLayout from "../layouts/AppLayout";
import MedicineForm from "../components/MedicineForm";
import EditMedicineModal from "../components/EditMedicineModal";
import {
  getMedicines,
  deleteMedicine,
  importMedicines,
} from "../services/medicineService";
import { demoMedicines } from "../utils/demoMedicines";

const Medicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table");
  const [groupByName, setGroupByName] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    const displaySource = medicines;
    let result = [...displaySource];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.company?.toLowerCase().includes(q) ||
          m.category?.toLowerCase().includes(q) ||
          m.batchNo?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter((m) => m.category === selectedCategory);
    }

    if (selectedCompany !== "ALL") {
      result = result.filter((m) => m.company === selectedCompany);
    }

    if (stockFilter === "LOW") {
      result = result.filter((m) => m.stock <= (m.minimumStock || 10));
    } else if (stockFilter === "HEALTHY") {
      result = result.filter((m) => m.stock > (m.minimumStock || 10));
    } else if (stockFilter === "EXPIRED") {
      const today = new Date();
      result = result.filter(
        (m) => m.expiryDate && new Date(m.expiryDate) < today,
      );
    }

    setFilteredMedicines(sortByName(result));
  }, [
    search,
    selectedCategory,
    stockFilter,
    medicines,
    groupByName,
    selectedCompany,
  ]);

  const sortByName = (list) =>
    [...list].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, {
        sensitivity: "base",
      }),
    );

  const applyMedicines = (medicineList) => {
    const sorted = sortByName(medicineList);
    setMedicines(sorted);
    setFilteredMedicines(sorted);
  };

  // Aggregate medicines by name (case-insensitive) and sum stock
  const aggregateMedicines = (list) => {
    if (!Array.isArray(list)) return [];

    const map = new Map();

    list.forEach((m) => {
      const key = (m.name || "").trim().toLowerCase();

      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          _id: `group-${key}`,
          name: m.name,
          company: m.company,
          category: m.category,
          image: m.image,
          batchNo: "Multiple",
          purchasePrice: m.purchasePrice,
          sellingPrice: m.sellingPrice,
          stock: Number(m.stock) || 0,
          minimumStock: m.minimumStock || 10,
          expiryDate: m.expiryDate,
          skuCount: 1,
          originals: [m._id],
        });
      } else {
        const cur = map.get(key);
        cur.stock += Number(m.stock) || 0;
        cur.skuCount += 1;
        cur.minimumStock = Math.min(
          cur.minimumStock || 10,
          m.minimumStock || 10,
        );
        // choose earliest expiry
        if (m.expiryDate && new Date(m.expiryDate) < new Date(cur.expiryDate)) {
          cur.expiryDate = m.expiryDate;
        }
        cur.originals.push(m._id);
      }
    });

    return Array.from(map.values());
  };

  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadDemoMedicines = () => {
    applyMedicines(demoMedicines);
    setIsDemoMode(true);
    toast.success("Loaded demo products for testing");
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await getMedicines();
      const medicineList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      if (medicineList.length > 0) {
        applyMedicines(medicineList);
        setIsDemoMode(false);
      } else {
        applyMedicines(demoMedicines);
        setIsDemoMode(true);
      }
    } catch (error) {
      console.error(error);
      applyMedicines(demoMedicines);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const displaySourceForCategories = medicines;

  const categories = [
    "ALL",
    ...Array.from(
      new Set(
        displaySourceForCategories.map((m) => m.category).filter(Boolean),
      ),
    ),
  ];

  const companies = [
    "ALL",
    ...Array.from(
      new Set(
        // If a category is selected, only show companies present in that category
        displaySourceForCategories
          .filter((m) =>
            selectedCategory === "ALL" ? true : m.category === selectedCategory,
          )
          .map((m) => m.company)
          .filter(Boolean),
      ),
    ),
  ];

  const confirmDelete = (med) => {
    setDeleteTarget(med);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedicine(deleteTarget._id);
      toast.success(`Medicine SKU "${deleteTarget.name}" removed successfully`);
      setDeleteTarget(null);
      fetchMedicines();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Delete operation failed");
    }
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setShowEditModal(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isValidType = /\.(xlsx|xls)$/i.test(file.name);
    if (!isValidType) {
      toast.error("Please choose a valid Excel file (.xlsx or .xls)");
      event.target.value = "";
      return;
    }

    try {
      setImporting(true);
      const response = await importMedicines(file);
      toast.success(`${response?.total || 0} medicines imported successfully`);
      await fetchMedicines();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to import medicines",
      );
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  return (
    <AppLayout onQuickAdd={() => setShowAddDrawer(true)}>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      {/* Add Drawer */}
      <AnimatePresence>
        {showAddDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-white h-full shadow-2xl p-8 overflow-y-auto"
            >
              <MedicineForm
                onSuccess={() => {
                  fetchMedicines();
                  setShowAddDrawer(false);
                }}
                onClose={() => setShowAddDrawer(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 font-sans">
        {isDemoMode ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-amber-800">🧪 Demo Mode Active:</span> Showing demo test products. Add your real medicines or click sync to load from MongoDB.
            </div>
            <button
              onClick={fetchMedicines}
              className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 cursor-pointer"
            >
              Sync DB Medicines
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-emerald-800">🟢 Live Database Connected:</span> Showing {medicines.length} real medicine product(s) directly from your MongoDB database.
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search medicine name, company, category, batch number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-sm"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
            />

            <button
              onClick={() =>
                window.open("/medicine-import-template.xlsx", "_blank")
              }
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 font-extrabold text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <FaDownload />
              <span>Download Template</span>
            </button>

            <button
              onClick={handleImportClick}
              disabled={importing}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold text-sm shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <FaBoxes />
              <span>{importing ? "Importing..." : "Import Excel"}</span>
            </button>

            {isDemoMode ? (
              <button
                onClick={fetchMedicines}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold text-sm shadow-sm transition active:scale-95 cursor-pointer"
                title="Fetch real medicines directly from your MongoDB database"
              >
                <FaCheckCircle className="text-emerald-600" />
                <span>Show Real DB Medicines</span>
              </button>
            ) : (
              <button
                onClick={loadDemoMedicines}
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer hover:bg-slate-100"
                title="Switch to demo test products"
              >
                <FaBoxes />
                <span>Load Demo Products</span>
              </button>
            )}

            <button
              onClick={() => setShowAddDrawer(true)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
            >
              <FaPlus />
              <span>Add Medicine SKU</span>
            </button>

            {/* View Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${viewMode === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
                title="Table View"
              >
                <FaThList className="text-base" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
                title="Grid Cards View"
              >
                <FaThLarge className="text-base" />
              </button>
            </div>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
                setSelectedCompany("ALL");
                setStockFilter("ALL");
                setGroupByName(false);
                toast.success("Showing all medicines again");
              }}
              className="ml-3 px-3.5 py-2 rounded-xl text-sm font-bold transition cursor-pointer bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              title="Reset filters and show the complete medicine list"
            >
              Show All Medicines
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="flex items-center gap-1.5 text-slate-400 font-extrabold uppercase text-xs">
              <FaFilter /> Category:
            </span>
            {categories.slice(0, 7).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${selectedCategory === cat
                  ? "bg-blue-50 text-blue-700 border-blue-300 font-extrabold"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                {cat}
              </button>
            ))}
            {/* Company Pills */}
            <div className="ml-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-slate-400 font-extrabold uppercase text-xs">
                Company:
              </span>
              {companies.slice(0, 7).map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedCompany(comp)}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${selectedCompany === comp
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-extrabold uppercase text-xs">
              Status:
            </span>
            {[
              { id: "ALL", label: "All SKUs" },
              { id: "HEALTHY", label: "In Stock" },
              { id: "LOW", label: "Low Stock" },
              { id: "EXPIRED", label: "Expired" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStockFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${stockFilter === st.id
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                {st.label}
              </button>
            ))}

            <span className="ml-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-extrabold">
              {filteredMedicines.length} {groupByName ? "Products" : "SKUs"}{" "}
              Listed
            </span>
          </div>
        </div>
      </div>

      {/* Main Table / Grid View */}
      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200/90 text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base text-slate-600 font-bold">
            Loading medicine inventory database...
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Medicine SKU</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">Batch No.</th>
                  <th className="px-5 py-4">Prices (Purchase / Selling)</th>
                  <th className="px-5 py-4">Stock Level</th>
                  <th className="px-5 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-base">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((med) => {
                    const isLow = med.stock <= (med.minimumStock || 10);
                    const isExp =
                      med.expiryDate && new Date(med.expiryDate) < new Date();

                    return (
                      <tr
                        key={med._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-5 font-bold text-slate-900">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={med.image || "/medicine-placeholder.svg"}
                              alt={med.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/medicine-placeholder.svg";
                              }}
                              className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                            />
                            <div>
                              <span className="block font-extrabold text-slate-900 leading-tight text-base">
                                {med.name}
                              </span>
                              <span className="block text-xs text-slate-400 font-mono mt-0.5">
                                ID: {med._id?.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                            <FaTag className="text-slate-400" />
                            {med.category}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-slate-700 font-semibold text-sm">
                          {med.company}
                        </td>

                        <td className="px-5 py-5 text-slate-700 font-mono text-sm font-bold">
                          {med.batchNo || "N/A"}
                        </td>

                        <td className="px-5 py-5">
                          <div className="text-sm">
                            <span className="text-slate-400 font-normal">
                              Buy:{" "}
                            </span>
                            <span className="font-bold text-slate-800">
                              ₹{med.purchasePrice}
                            </span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="text-slate-400 font-normal">
                              Sell:{" "}
                            </span>
                            <span className="font-extrabold text-emerald-600">
                              ₹{med.sellingPrice}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          {isExp ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                              <FaCalendarTimes /> Expired ({med.stock})
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                              <FaExclamationTriangle /> Low ({med.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                              <FaCheckCircle /> {med.stock} units
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-slate-700">
                          {med.expiryDate
                            ? new Date(med.expiryDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                            : "N/A"}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!groupByName ? (
                              <>
                                <button
                                  onClick={() => handleEdit(med)}
                                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                                >
                                  <FaEdit />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => confirmDelete(med)}
                                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                                >
                                  <FaTrash />
                                  <span>Delete</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setGroupByName(false);
                                  setSearch(med.name);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                              >
                                <FaBoxes />
                                <span>View SKUs ({med.skuCount})</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-16 text-center text-slate-400 font-medium"
                    >
                      <FaPills className="mx-auto text-5xl text-slate-300 mb-3" />
                      No medicines matched your current search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {filteredMedicines.map((med) => {
            const isLow = med.stock <= (med.minimumStock || 10);
            return (
              <div
                key={med._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs">
                      {med.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {med.batchNo}
                    </span>
                  </div>

                  <img
                    src={med.image || "/medicine-placeholder.svg"}
                    alt={med.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/medicine-placeholder.svg";
                    }}
                    className="h-28 w-full rounded-2xl object-cover border border-slate-200 mb-4"
                  />

                  <h3 className="text-xl font-extrabold text-slate-900">
                    {med.name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    {med.company}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase">
                        Selling Price
                      </span>
                      <p className="font-black text-emerald-600 text-lg">
                        ₹{med.sellingPrice}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase">
                        Stock Level
                      </span>
                      <p
                        className={`font-black text-lg ${isLow ? "text-amber-600" : "text-slate-900"}`}
                      >
                        {med.stock} Units
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  {!groupByName ? (
                    <>
                      <button
                        onClick={() => handleEdit(med)}
                        className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition cursor-pointer"
                      >
                        Edit SKU
                      </button>
                      <button
                        onClick={() => confirmDelete(med)}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setGroupByName(false);
                        setSearch(med.name);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 font-bold text-xs transition cursor-pointer"
                    >
                      View SKUs ({med.skuCount})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditMedicineModal
          medicine={selectedMedicine}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMedicine(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedMedicine(null);
            fetchMedicines();
          }}
        />
      )}

      {/* Custom Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-center space-y-5">
            <div className="h-16 w-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto">
              <FaExclamationCircle />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Delete Medicine SKU?
              </h3>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                Are you sure you want to permanently delete{" "}
                <strong>"{deleteTarget.name}"</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-6 py-3 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-6 py-3 rounded-2xl bg-rose-600 text-white font-extrabold text-sm shadow-md shadow-rose-600/30 hover:bg-rose-500 transition cursor-pointer"
              >
                Delete Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Medicine;
