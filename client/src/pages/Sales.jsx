import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import {
  FaShoppingCart,
  FaPlus,
  FaReceipt,
  FaPrint,
  FaSearch,
  FaChevronDown,
} from "react-icons/fa";
import { demoMedicines } from "../utils/demoMedicines";

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const categoryToUnitType = (category) => {
  const text = (category || "").toString().toLowerCase();
  if (text.includes("ointment")) return "Ointment";
  if (text.includes("capsule")) return "Capsule";
  if (text.includes("injection")) return "Injection";
  if (text.includes("strip")) return "Strip";
  if (text.includes("tablet")) return "Tablet";
  return "Other";
};
import toast, { Toaster } from "react-hot-toast";
import {
  createInvoice,
  getInvoices,
  downloadInvoicePDF,
  updateInvoicePayment,
} from "../services/invoiceService";
import { getMedicines } from "../services/medicineService";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [editPayment, setEditPayment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customer: "",
    items: [
      {
        medicine: "",
        quantity: "",
        unitType: "Tablet",
        search: "",
      },
    ],
    payment: "UPI / GPay",
    discount: "",
    gst: "",
  });
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [invoicesResponse, medicinesResponse] = await Promise.all([
          getInvoices(),
          getMedicines(),
        ]);

        setSales(invoicesResponse?.data || []);
        const loadedMedicines = medicinesResponse?.data || [];
        setMedicines(loadedMedicines.length > 0 ? loadedMedicines : demoMedicines);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load sales data");
        setMedicines(demoMedicines);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateSale = async (e) => {
    e.preventDefault();

    const validItems = form.items.filter(
      (item) => item.medicine && Number(item.quantity) > 0,
    );
    if (!validItems.length) {
      toast.error("Please choose at least one medicine and quantity");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerName: form.customer || "Walk-in Patient",
        items: validItems.map((item) => {
          const medicine = medicines.find((m) => m._id === item.medicine);
          const packSize = Number(medicine?.packSize || 10);
          return {
            medicine: item.medicine,
            quantity:
              item.unitType === "Strip"
                ? Number(item.quantity) * packSize
                : Number(item.quantity),
            displayQuantity: Number(item.quantity),
            unitType: item.unitType,
            packSize,
          };
        }),
        payment: form.payment,
        discount: Number(form.discount || 0),
        gst: Number(form.gst || 0),
      };

      const result = await createInvoice(payload);
      const createdInvoice = result?.data;

      setSales((prev) => [createdInvoice, ...prev]);
      toast.success(
        `Invoice ${createdInvoice.invoiceNumber} generated and stock updated`,
      );
      setActiveInvoice({
        id: createdInvoice.invoiceNumber,
        customer: createdInvoice.customerName,
        items: createdInvoice.items
          .map(
            (item) =>
              `${item.medicine.name} - ${item.displayQuantity || item.quantity} ${
                item.unitType || "Tablet"
              }`,
          )
          .join(", "),
        total: createdInvoice.grandTotal,
        payment: createdInvoice.payment,
        invoiceId: createdInvoice._id,
      });
      setShowPOSModal(false);

      setForm({
        customer: "",
        items: [
          {
            medicine: "",
            quantity: "",
            unitType: "Tablet",
          },
        ],
        payment: "UPI / GPay",
        discount: "",
        gst: "",
      });

      const updatedMedicines = await getMedicines().catch(() => ({ data: [] }));
      const loadedMedicines = updatedMedicines?.data || [];
      setMedicines(loadedMedicines.length > 0 ? loadedMedicines : demoMedicines);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Sale failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const blob = await downloadInvoicePDF(invoiceId);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${activeInvoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to download receipt");
    }
  };

  const filteredBySearch = (sales || []).filter(
    (s) =>
      (s.customerName || s.customer || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.invoiceNumber || "").toLowerCase().includes(search.toLowerCase()),
  );

  const filteredByDate = selectedDate
    ? filteredBySearch.filter((s) => {
        const invoiceDate = s.invoiceDate ? new Date(s.invoiceDate) : null;
        return (
          invoiceDate && invoiceDate.toISOString().slice(0, 10) === selectedDate
        );
      })
    : filteredBySearch;

  const paymentFiltered =
    paymentFilter && paymentFilter !== "ALL"
      ? filteredByDate.filter(
          (s) => (s.payment || "UPI / GPay") === paymentFilter,
        )
      : filteredByDate;

  const summarySales = selectedDate ? filteredByDate : filteredBySearch;

  // Compute payment counts for current date/search scope
  const paymentCounts = (summarySales || []).reduce(
    (acc, s) => {
      const p = s.payment || "UPI / GPay";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    },
    { "UPI / GPay": 0, Cash: 0, Card: 0 },
  );

  return (
    <AppLayout>
      <Toaster position="top-right" />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 rounded-3xl border border-emerald-200/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans text-white">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-3">
            <FaShoppingCart className="text-white" />
            Pharmacy POS & Counter Billing
          </h2>
          <p className="text-base text-emerald-50 font-medium mt-1">
            Sell medicines, auto-debit inventory stock, and print instant
            receipts
          </p>
        </div>

        <button
          onClick={() => setShowPOSModal(true)}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white text-emerald-700 font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <FaPlus />
          <span>New Billing Sale</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">
            {selectedDate ? `Sales on ${selectedDate}` : "Today's Revenue"}
          </span>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1.5">
            ₹
            {(summarySales || [])
              .reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.grandTotal ??
                      item.total ??
                      Number(item.sellingPrice || 0) *
                        Number(item.quantity || 1),
                  ),
                0,
              )
              .toLocaleString()}
          </h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            {summarySales.length} transactions processed
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Inventory in Stock
          </span>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-1.5">
            {medicines.reduce((sum, item) => sum + (item.stock || 0), 0)}
          </h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Units across all SKUs
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Payment Mode
          </span>
          <h3 className="text-3xl font-extrabold text-indigo-600 mt-1.5">
            {Object.entries(paymentCounts)
              .map(([k, v]) => `${k.split(" ")[0]}: ${v}`)
              .join("  |  ")}
          </h3>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            Click a payment pill to filter the list
          </p>
        </div>
      </div>

      {/* Payment Filter Pills */}
      <div className="flex gap-2 mt-3 mb-3">
        {[
          { id: "ALL", label: `All (${sales.length})` },
          {
            id: "UPI / GPay",
            label: `UPI (${paymentCounts["UPI / GPay"] || 0})`,
          },
          { id: "Cash", label: `Cash (${paymentCounts.Cash || 0})` },
          { id: "Card", label: `Card (${paymentCounts.Card || 0})` },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPaymentFilter(p.id)}
            className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${
              paymentFilter === p.id
                ? "bg-blue-50 text-blue-700 border-blue-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search & Date Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search invoice number or patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-medium"
            />
          </div>
          <div className="flex items-center gap-3 justify-end">
            <label className="text-sm font-semibold text-slate-700">
              Select date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading pharmacy sales...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4">Invoice Reference</th>
                <th className="px-6 py-4">Patient / Customer</th>
                <th className="px-6 py-4">Items Billed</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Total Bill (₹)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-base">
              {paymentFiltered.map((inv) => (
                <tr
                  key={inv._id || inv.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-5 font-mono font-extrabold text-indigo-600">
                    {inv.invoiceNumber || inv.id}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-900">
                    {inv.customerName || inv.customer}
                  </td>
                  <td className="px-6 py-5 text-slate-600 text-sm font-semibold">
                    {inv.items
                      ? inv.items
                          .map((item) =>
                            item.medicine?.name
                              ? `${item.medicine.name} - ${item.displayQuantity || item.quantity} ${item.unitType || "Tablet"}`
                              : "Unknown item",
                          )
                          .join(", ")
                      : `${inv.medicine?.name || "Medicine"} x${inv.quantity || 1}`}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">
                      {inv.payment || "UPI / GPay"}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-emerald-600 text-lg">
                    ₹{Number(inv.grandTotal ?? inv.total ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() =>
                        setActiveInvoice({
                          id: inv.invoiceNumber || inv.id,
                          customer: inv.customerName || inv.customer,
                          items:
                            inv.items ||
                            `${inv.medicine?.name || "Medicine"} x${inv.quantity || 1}`,
                          total: Number(inv.grandTotal ?? inv.total ?? 0),
                          payment: inv.payment || "UPI / GPay",
                          invoiceId: inv._id || inv.id,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs hover:bg-blue-100 transition flex items-center gap-2 ml-auto cursor-pointer"
                    >
                      <FaReceipt />
                      <span>View Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New POS Modal */}
      {showPOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900">
              New POS Transaction
            </h3>
            <form onSubmit={handleCreateSale} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Patient / Customer Name
                </label>
                <input
                  placeholder="Customer name (or leave blank for walk-in)"
                  value={form.customer}
                  onChange={(e) =>
                    setForm({ ...form, customer: e.target.value })
                  }
                  className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-800">
                    Cart Items
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          {
                            medicine: "",
                            quantity: "",
                            unitType: "Tablet",
                            search: "",
                          },
                        ],
                      }))
                    }
                    className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-bold"
                  >
                    Add Item
                  </button>
                </div>

                {form.items.map((item, index) => (
                  <div
                    key={`${item.medicine}-${index}`}
                    className="grid grid-cols-12 gap-3 items-end"
                  >
                    <div className="col-span-5 relative">
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Medicine
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search medicine..."
                          value={item.search || ""}
                          onFocus={() => setActiveDropdownIndex(index)}
                          onClick={() => setActiveDropdownIndex(index)}
                          onBlur={() => setTimeout(() => setActiveDropdownIndex(null), 200)}
                          onChange={(e) => {
                            const updatedItems = [...form.items];
                            updatedItems[index].search = e.target.value;
                            updatedItems[index].medicine = "";
                            setForm({ ...form, items: updatedItems });
                            setActiveDropdownIndex(index);
                          }}
                          className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 pl-4 pr-10 text-base outline-none focus:border-blue-500 font-medium text-slate-800"
                        />
                        <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                      </div>

                      {activeDropdownIndex === index && (
                        <div className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl py-1">
                          {(() => {
                            const searchInput = (item.search || "").trim().toLowerCase();
                            const selectedMed = medicines.find((m) => m._id === item.medicine);
                            const isMatchedSelection = selectedMed && selectedMed.name.toLowerCase() === searchInput;

                            const filtered = (!searchInput || isMatchedSelection)
                              ? medicines
                              : medicines.filter(
                                  (m) =>
                                    (m.name || "").toLowerCase().includes(searchInput) ||
                                    (m.category || "").toLowerCase().includes(searchInput) ||
                                    (m.company || "").toLowerCase().includes(searchInput)
                                );

                            if (filtered.length === 0) {
                              return (
                                <div className="px-4 py-3 text-sm text-slate-500 font-medium text-center">
                                  No matching medicine found.
                                </div>
                              );
                            }

                            return filtered.slice(0, 15).map((medicine) => (
                              <button
                                type="button"
                                key={medicine._id}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  const updatedItems = [...form.items];
                                  updatedItems[index].medicine = medicine._id;
                                  updatedItems[index].search = medicine.name;
                                  updatedItems[index].unitType =
                                    categoryToUnitType(medicine.category);
                                  setForm({ ...form, items: updatedItems });
                                  setActiveDropdownIndex(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50/80 transition flex items-center justify-between group border-b border-slate-50 last:border-0"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800 group-hover:text-blue-600 block">
                                    {medicine.name}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {medicine.category || "General"} {medicine.company ? `• ${medicine.company}` : ""}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                      medicine.stock > 10
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    Stock: {medicine.stock}
                                  </span>
                                </div>
                              </button>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Unit
                      </label>
                      <select
                        value={item.unitType || "Tablet"}
                        onChange={(e) => {
                          const updatedItems = [...form.items];
                          updatedItems[index].unitType = e.target.value;
                          setForm({ ...form, items: updatedItems });
                        }}
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Strip">Strip</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Injection">Injection</option>
                        <option value="Ointment">Ointment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const updatedItems = [...form.items];
                          updatedItems[index].quantity =
                            e.target.value === "" ? "" : Number(e.target.value);
                          setForm({ ...form, items: updatedItems });
                        }}
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            items: prev.items.filter((_, i) => i !== index),
                          }));
                        }}
                        className="w-full h-12 rounded-2xl bg-rose-500 text-white font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={form.payment}
                    onChange={(e) =>
                      setForm({ ...form, payment: e.target.value })
                    }
                    className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                  >
                    <option value="UPI / GPay">UPI / GPay (QR Code)</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter discount"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    GST
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter GST"
                    value={form.gst}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gst:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPOSModal(false)}
                  className="px-5 py-2.5 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm shadow disabled:opacity-60"
                >
                  {submitting ? "Processing..." : "Complete Sale & Print"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Receipt Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
              <h3 className="font-extrabold text-2xl text-slate-900">
                MediStock Pharmacy
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Official Tax Invoice
              </p>
              <span className="inline-block mt-2 font-mono text-sm font-black text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full">
                {activeInvoice.id}
              </span>
            </div>

            <div className="space-y-3 text-sm font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-extrabold text-slate-900">
                  {activeInvoice.customer}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <div>
                  <span className="text-slate-400">Payment Mode:</span>
                  <div className="mt-1">
                    <select
                      value={editPayment || activeInvoice.payment}
                      onChange={(e) => setEditPayment(e.target.value)}
                      className="rounded-xl border px-3 py-1 text-sm font-bold"
                    >
                      <option value="UPI / GPay">UPI / GPay</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>
                <div>
                  <button
                    onClick={async () => {
                      if (!activeInvoice.invoiceId)
                        return toast.error("Missing invoice id");
                      const newPayment = editPayment || activeInvoice.payment;
                      try {
                        await updateInvoicePayment(
                          activeInvoice.invoiceId,
                          newPayment,
                        );
                        // update local sales state
                        setSales((prev) =>
                          prev.map((s) =>
                            s._id === activeInvoice.invoiceId
                              ? { ...s, payment: newPayment }
                              : s,
                          ),
                        );
                        setActiveInvoice({
                          ...activeInvoice,
                          payment: newPayment,
                        });
                        toast.success("Payment updated");
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to update payment");
                      }
                    }}
                    className="ml-3 px-3 py-1 rounded-xl bg-blue-600 text-white font-bold"
                  >
                    Save Payment
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Items:</span>
                <span className="font-semibold text-slate-700 text-right">
                  {activeInvoice.items}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-base">
                Total Paid:
              </span>
              <span className="font-black text-emerald-600 text-2xl">
                ₹{activeInvoice.total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={async () => {
                if (activeInvoice?.invoiceId) {
                  await handleDownloadInvoice(activeInvoice.invoiceId);
                }
                setActiveInvoice(null);
              }}
              className="w-full h-12 rounded-2xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <FaPrint />
              <span>Close & Print Receipt</span>
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Sales;
