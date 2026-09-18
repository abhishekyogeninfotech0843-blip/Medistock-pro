import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import {
  FaShoppingCart,
  FaPlus,
  FaReceipt,
  FaPrint,
  FaSearch,
  FaChevronDown,
  FaDownload,
  FaArrowLeft,
  FaCheckCircle,
  FaTimes,
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaEdit,
} from "react-icons/fa";
import { demoMedicines } from "../utils/demoMedicines";
import toast, { Toaster } from "react-hot-toast";
import {
  createInvoice,
  getInvoices,
  downloadInvoicePDF,
  updateInvoicePayment,
  updateInvoiceDue,
} from "../services/invoiceService";
import { getMedicines } from "../services/medicineService";

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

const formatInvoiceItems = (items, fallbackMedicine, fallbackQty) => {
  if (Array.isArray(items) && items.length > 0) {
    const map = new Map();
    items.forEach((item) => {
      const name = item.medicine?.name || item.name || "Medicine";
      const unit = item.unitType || "Tablet";
      const qty = Number(item.displayQuantity || item.quantity || 1);
      const key = `${name}___${unit}`;

      if (map.has(key)) {
        map.set(key, map.get(key) + qty);
      } else {
        map.set(key, qty);
      }
    });

    return Array.from(map.entries())
      .map(([key, qty]) => {
        const [name, unit] = key.split("___");
        return `${name} - ${qty} ${unit}`;
      })
      .join(", ");
  }

  if (fallbackMedicine?.name) {
    return `${fallbackMedicine.name} x${fallbackQty || 1}`;
  }

  return "Medicine item";
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [showPOSModal, setShowPOSModal] = useState(false);
  const [posStep, setPosStep] = useState("FORM"); // "FORM" | "PREVIEW"
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [editPayment, setEditPayment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [duePayAmount, setDuePayAmount] = useState("");

  const initialForm = {
    customer: "",
    customerMobile: "",
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
    paidAmount: "",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [invoicesResponse, medicinesResponse] = await Promise.all([
          getInvoices(),
          getMedicines(),
        ]);

        setSales(invoicesResponse?.data || []);
        const loadedMedicines = Array.isArray(medicinesResponse)
          ? medicinesResponse
          : Array.isArray(medicinesResponse?.data)
          ? medicinesResponse.data
          : [];
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

  // Validation & Proceed to Preview
  const handleProceedToPreview = (e) => {
    if (e) e.preventDefault();

    const validItems = form.items.filter(
      (item) => item.medicine && Number(item.quantity) > 0,
    );

    if (!validItems.length) {
      toast.error("Kripya kam se kam ek medicine aur valid quantity select karein.");
      return;
    }

    // Check available stock
    for (const item of validItems) {
      const med = medicines.find((m) => m._id === item.medicine);
      if (med) {
        const packSize = Number(med.packSize || 10);
        const reqQty =
          item.unitType === "Strip"
            ? Number(item.quantity) * packSize
            : Number(item.quantity);
        if (reqQty > (med.stock || 0)) {
          toast.error(
            `"${med.name}" ki stock sirf ${med.stock} units available hai! (Aapne manga: ${reqQty})`
          );
          return;
        }
      }
    }

    setPosStep("PREVIEW");
  };

  const handleCreateSale = async () => {
    const validItems = form.items.filter(
      (item) => item.medicine && Number(item.quantity) > 0,
    );
    if (!validItems.length) {
      toast.error("Please choose at least one medicine and quantity");
      return;
    }

    // Consolidate any duplicate medicine selections
    const consolidatedMap = new Map();
    validItems.forEach((item) => {
      if (consolidatedMap.has(item.medicine)) {
        const existing = consolidatedMap.get(item.medicine);
        existing.quantity = Number(existing.quantity) + Number(item.quantity);
      } else {
        consolidatedMap.set(item.medicine, { ...item });
      }
    });
    const consolidatedItems = Array.from(consolidatedMap.values());

    try {
      setSubmitting(true);
      const payload = {
        customerName: form.customer || "Walk-in Patient",
        customerMobile: form.customerMobile || "",
        items: consolidatedItems.map((item) => {
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
        paidAmount: form.paidAmount !== "" ? Number(form.paidAmount) : undefined,
      };

      const result = await createInvoice(payload);
      const createdInvoice = result?.data;

      setSales((prev) => [createdInvoice, ...prev]);
      toast.success(
        `Invoice ${createdInvoice.invoiceNumber} successfully created & stock updated!`
      );

      // Open finalized invoice receipt modal
      setActiveInvoice(createdInvoice);
      setShowPOSModal(false);
      setPosStep("FORM");
      setForm(initialForm);

      const updatedMedicines = await getMedicines().catch(() => ({ data: [] }));
      const loadedMedicines = updatedMedicines?.data || [];
      setMedicines(loadedMedicines.length > 0 ? loadedMedicines : demoMedicines);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Sale creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const blob = await downloadInvoicePDF(invoiceId);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoiceNumber || "INV-RECEIPT"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download PDF invoice");
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  // Live Calculations for POS Form
  const calculatedSubTotal = (form.items || []).reduce((sum, item) => {
    if (!item.medicine || !item.quantity) return sum;
    const med = medicines.find((m) => m._id === item.medicine);
    if (!med) return sum;
    const packSize = Number(med.packSize || 10);
    const qty = Number(item.quantity);
    const price =
      item.unitType === "Strip"
        ? Number(med.sellingPrice)
        : Number((med.sellingPrice / packSize).toFixed(2));
    return sum + price * qty;
  }, 0);

  const calculatedGrandTotal = Math.max(
    0,
    calculatedSubTotal - Number(form.discount || 0) + Number(form.gst || 0),
  );
  const effectivePaidAmount =
    form.paidAmount === ""
      ? calculatedGrandTotal
      : Math.min(calculatedGrandTotal, Math.max(0, Number(form.paidAmount)));
  const calculatedDueAmount = Math.max(0, calculatedGrandTotal - effectivePaidAmount);

  // Prepared Preview Items for Draft Bill
  const previewDraftItems = form.items
    .filter((item) => item.medicine && Number(item.quantity) > 0)
    .map((item, index) => {
      const med = medicines.find((m) => m._id === item.medicine) || {};
      const packSize = Number(med.packSize || 10);
      const qty = Number(item.quantity);
      const price =
        item.unitType === "Strip"
          ? Number(med.sellingPrice || 0)
          : Number(((med.sellingPrice || 0) / packSize).toFixed(2));
      const lineTotal = Number((price * qty).toFixed(2));

      return {
        id: item.medicine,
        index: index + 1,
        name: med.name || item.search || "Medicine",
        company: med.company || "General",
        category: med.category || "",
        unitType: item.unitType || "Tablet",
        quantity: qty,
        price,
        lineTotal,
      };
    });

  const filteredBySearch = (sales || []).filter(
    (s) =>
      (s.customerName || s.customer || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.customerMobile || s.phone || s.mobile || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (s.invoiceNumber || "").toLowerCase().includes(search.toLowerCase()),
  );

  const filteredByDate = selectedDate
    ? filteredBySearch.filter((s) => {
        const dateVal = s.invoiceDate || s.createdAt;
        if (!dateVal) return false;
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return false;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}` === selectedDate;
      })
    : filteredBySearch;

  const matchPaymentType = (paymentStr, filterId) => {
    if (!filterId || filterId === "ALL") return true;
    const p = (paymentStr || "").toString().toLowerCase();
    const f = filterId.toLowerCase();

    if (f.includes("cash")) {
      return p.includes("cash");
    }
    if (f.includes("card")) {
      return p.includes("card") || p.includes("debit") || p.includes("credit");
    }
    if (f.includes("upi") || f.includes("gpay")) {
      return (
        p.includes("upi") ||
        p.includes("gpay") ||
        p.includes("qr") ||
        (!p.includes("cash") && !p.includes("card"))
      );
    }
    return p === f;
  };

  const summarySales = selectedDate ? filteredByDate : filteredBySearch;

  const paymentFiltered = summarySales.filter((s) =>
    matchPaymentType(s.payment, paymentFilter),
  );

  // Compute payment counts for current date/search scope
  const paymentCounts = {
    "UPI / GPay": (summarySales || []).filter((s) =>
      matchPaymentType(s.payment, "UPI / GPay"),
    ).length,
    Cash: (summarySales || []).filter((s) =>
      matchPaymentType(s.payment, "Cash"),
    ).length,
    Card: (summarySales || []).filter((s) =>
      matchPaymentType(s.payment, "Card"),
    ).length,
  };

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
            Create bills, preview invoices before confirmation, auto-debit stock, & print professional receipts
          </p>
        </div>

        <button
          onClick={() => {
            setPosStep("FORM");
            setShowPOSModal(true);
          }}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer"
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
      <div className="flex gap-2 mt-3 mb-3 flex-wrap">
        {[
          { id: "ALL", label: `All (${summarySales.length})` },
          {
            id: "UPI / GPay",
            label: `UPI (${paymentCounts["UPI / GPay"]})`,
          },
          {
            id: "Cash",
            label: `Cash (${paymentCounts["Cash"]})`,
          },
          {
            id: "Card",
            label: `Card (${paymentCounts["Card"]})`,
          },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPaymentFilter(p.id)}
            className={`px-3.5 py-1.5 rounded-xl border text-sm font-bold transition cursor-pointer ${
              paymentFilter === p.id
                ? "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search & Date Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm font-sans space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search invoice number, patient name, or phone number..."
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
              className="h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 font-bold"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                All Dates
              </button>
            )}
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
                <th className="px-6 py-4">Total & Due Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-base">
              {paymentFiltered.map((inv) => {
                const totalAmt = Number(inv.grandTotal ?? inv.total ?? 0);
                const paidAmt = Number(
                  inv.paidAmount !== undefined && inv.paidAmount !== null
                    ? inv.paidAmount
                    : inv.dueAmount !== undefined
                    ? Math.max(0, totalAmt - Number(inv.dueAmount))
                    : totalAmt,
                );
                const dueAmt = Math.max(0, Number((totalAmt - paidAmt).toFixed(2)));

                return (
                  <tr
                    key={inv._id || inv.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5 font-mono font-extrabold text-emerald-700">
                      {inv.invoiceNumber || inv.id}
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-900">
                      <div>
                        <span>{inv.customerName || inv.customer}</span>
                        {inv.customerMobile && (
                          <span className="block text-xs font-normal text-slate-400">
                            {inv.customerMobile}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-600 text-sm font-semibold">
                      {formatInvoiceItems(inv.items, inv.medicine, inv.quantity)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">
                        {inv.payment || "UPI / GPay"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <span className="block font-black text-slate-900 text-lg">
                          ₹{totalAmt.toFixed(2)}
                        </span>
                        {dueAmt > 0 ? (
                          <span className="inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Paid: ₹{paidAmt.toFixed(0)} | Due: ₹{dueAmt.toFixed(0)}
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Paid in Full
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setActiveInvoice(inv)}
                        className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs hover:bg-emerald-100 transition flex items-center gap-2 ml-auto cursor-pointer"
                      >
                        <FaReceipt />
                        <span>View / Print Bill</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paymentFiltered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500 font-semibold"
                  >
                    No {paymentFilter !== "ALL" ? paymentFilter : ""} transactions found{" "}
                    {selectedDate ? `for ${selectedDate}` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* POS Modal: Step 1 (Billing Form) OR Step 2 (Draft Bill Preview) */}
      {showPOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm font-sans overflow-hidden">
          <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                  <FaReceipt />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    {posStep === "FORM" ? "New POS Transaction" : "Bill Preview & Verification"}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        posStep === "FORM"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {posStep === "FORM" ? "Step 1: Items" : "Step 2: Preview"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {posStep === "FORM"
                      ? "Add customer medicines, check rates, and preview before saving"
                      : "Check items and totals carefully. You can edit anytime before confirming!"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPOSModal(false);
                  setPosStep("FORM");
                }}
                className="h-9 w-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Billing Form */}
            {posStep === "FORM" ? (
              <form
                onSubmit={handleProceedToPreview}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-6 overflow-y-auto max-h-[calc(92vh-140px)] space-y-5">
                  {/* Customer Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base font-medium focus:border-emerald-600 focus:bg-white outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Mobile Number (Optional)
                      </label>
                      <input
                        placeholder="+91 98000 00000"
                        value={form.customerMobile || ""}
                        onChange={(e) =>
                          setForm({ ...form, customerMobile: e.target.value })
                        }
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base font-medium focus:border-emerald-600 focus:bg-white outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Cart Items Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-800">
                        Cart Items ({form.items.length})
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
                        className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <FaPlus className="text-xs" />
                        <span>Add Medicine</span>
                      </button>
                    </div>

                    {/* Cart Items Scroll Container */}
                    <div className="max-h-64 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-200 pr-2">
                      {form.items.map((item, index) => (
                        <div
                          key={`${item.medicine}-${index}`}
                          className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm"
                        >
                          <div className="col-span-5 relative">
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Medicine
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search medicine..."
                                value={item.search || ""}
                                onFocus={() => setActiveDropdownIndex(index)}
                                onClick={() => setActiveDropdownIndex(index)}
                                onBlur={() =>
                                  setTimeout(() => setActiveDropdownIndex(null), 200)
                                }
                                onChange={(e) => {
                                  const updatedItems = [...form.items];
                                  updatedItems[index].search = e.target.value;
                                  updatedItems[index].medicine = "";
                                  setForm({ ...form, items: updatedItems });
                                  setActiveDropdownIndex(index);
                                }}
                                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-300 pl-3 pr-8 text-sm outline-none focus:border-emerald-600 font-medium text-slate-800"
                              />
                              <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                            </div>

                            {activeDropdownIndex === index && (
                              <div className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl py-1">
                                {(() => {
                                  const searchInput = (item.search || "")
                                    .trim()
                                    .toLowerCase();
                                  const selectedMed = medicines.find(
                                    (m) => m._id === item.medicine,
                                  );
                                  const isMatchedSelection =
                                    selectedMed &&
                                    selectedMed.name.toLowerCase() ===
                                      searchInput;

                                  const filtered =
                                    !searchInput || isMatchedSelection
                                      ? medicines
                                      : medicines.filter(
                                          (m) =>
                                            (m.name || "")
                                              .toLowerCase()
                                              .includes(searchInput) ||
                                            (m.category || "")
                                              .toLowerCase()
                                              .includes(searchInput) ||
                                            (m.company || "")
                                              .toLowerCase()
                                              .includes(searchInput),
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
                                        const existingIndex =
                                          form.items.findIndex(
                                            (it, i) =>
                                              i !== index &&
                                              it.medicine === medicine._id,
                                          );

                                        if (existingIndex !== -1) {
                                          const updatedItems = [...form.items];
                                          const currentQty =
                                            Number(
                                              updatedItems[existingIndex]
                                                .quantity,
                                            ) || 1;
                                          updatedItems[existingIndex].quantity =
                                            currentQty + 1;

                                          toast.error(
                                            `"${medicine.name}" bill me pehle se added hai! Quantity ++ kar di gayi hai.`,
                                          );

                                          if (updatedItems.length > 1) {
                                            updatedItems.splice(index, 1);
                                          } else {
                                            updatedItems[index] = {
                                              medicine: "",
                                              quantity: "",
                                              unitType: "Tablet",
                                              search: "",
                                            };
                                          }

                                          setForm({
                                            ...form,
                                            items: updatedItems,
                                          });
                                          setActiveDropdownIndex(null);
                                          return;
                                        }

                                        const updatedItems = [...form.items];
                                        updatedItems[index].medicine =
                                          medicine._id;
                                        updatedItems[index].search =
                                          medicine.name;
                                        updatedItems[index].quantity =
                                          updatedItems[index].quantity || 1;
                                        updatedItems[index].unitType =
                                          categoryToUnitType(medicine.category);
                                        setForm({
                                          ...form,
                                          items: updatedItems,
                                        });
                                        setActiveDropdownIndex(null);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50/80 transition flex items-center justify-between group border-b border-slate-50 last:border-0 cursor-pointer"
                                    >
                                      <div>
                                        <span className="font-semibold text-slate-800 group-hover:text-emerald-700 block">
                                          {medicine.name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          {medicine.category || "General"}{" "}
                                          {medicine.company
                                            ? `• ${medicine.company}`
                                            : ""}
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
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Unit
                            </label>
                            <select
                              value={item.unitType || "Tablet"}
                              onChange={(e) => {
                                const updatedItems = [...form.items];
                                updatedItems[index].unitType = e.target.value;
                                setForm({ ...form, items: updatedItems });
                              }}
                              className="w-full h-10 rounded-xl bg-slate-50 border border-slate-300 px-2 text-sm font-medium"
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
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              Qty
                            </label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => {
                                const updatedItems = [...form.items];
                                updatedItems[index].quantity =
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value);
                                setForm({ ...form, items: updatedItems });
                              }}
                              className="w-full h-10 rounded-xl bg-slate-50 border border-slate-300 px-3 text-sm font-bold text-slate-900"
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
                              className="w-full h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing Summary & Payment Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Payment Method
                      </label>
                      <select
                        value={form.payment}
                        onChange={(e) =>
                          setForm({ ...form, payment: e.target.value })
                        }
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-sm font-bold text-slate-800"
                      >
                        <option value="UPI / GPay">UPI / GPay (QR Code)</option>
                        <option value="Cash">Cash Counter</option>
                        <option value="Card">Debit / Credit Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.discount}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            discount:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          })
                        }
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        GST (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.gst}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gst:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          })
                        }
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder={`Full (₹${calculatedGrandTotal.toFixed(0)})`}
                        value={form.paidAmount}
                        onChange={(e) =>
                          setForm({ ...form, paidAmount: e.target.value })
                        }
                        className="w-full h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 px-4 text-base font-extrabold text-emerald-700"
                      />
                    </div>
                  </div>

                  {/* Live Bill Summary Card */}
                  <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4 border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Grand Total
                      </span>
                      <span className="text-2xl font-black text-white">
                        ₹{calculatedGrandTotal.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Paid Amount
                      </span>
                      <span className="text-xl font-extrabold text-emerald-400">
                        ₹{effectivePaidAmount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                        Balance Due (उधारी)
                      </span>
                      <span
                        className={`text-xl font-black ${
                          calculatedDueAmount > 0
                            ? "text-rose-400 animate-pulse"
                            : "text-slate-400"
                        }`}
                      >
                        ₹{calculatedDueAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white rounded-b-3xl flex justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPOSModal(false)}
                    className="px-5 py-2.5 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <FaReceipt />
                    <span>Preview Bill (बिल देखें) →</span>
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: Draft Bill Preview Modal */
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto max-h-[calc(92vh-140px)] space-y-6">
                  {/* Bill Card Preview */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                          MEDISTOCK PRO
                        </h4>
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                          Pharmacy & Healthcare Management
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Lic No: DL-20B/21B-4892 • GSTIN: 07AABCM1234F1Z9 • Phone: +91 98765 43210
                        </p>
                      </div>
                      <div className="text-left sm:text-right bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 uppercase">
                          Draft Preview
                        </span>
                        <p className="text-xs font-bold text-slate-600 mt-1">
                          Date: {new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </p>
                      </div>
                    </div>

                    {/* Patient & Billing Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Billed To (Customer)
                        </span>
                        <h5 className="text-base font-extrabold text-slate-900">
                          {form.customer || "Walk-in Patient"}
                        </h5>
                        <p className="text-xs text-slate-600 mt-0.5 font-semibold">
                          Mobile: {form.customerMobile || "Not Provided"}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Payment Details
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-semibold">
                            Payment Mode:
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {form.payment}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500 font-semibold">
                            Status:
                          </span>
                          <span
                            className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                              calculatedDueAmount > 0
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {calculatedDueAmount > 0
                              ? `Due: ₹${calculatedDueAmount.toFixed(0)}`
                              : "Paid in Full"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white font-extrabold uppercase">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Medicine Description</th>
                            <th className="px-4 py-3">Unit</th>
                            <th className="px-4 py-3 text-right">Qty</th>
                            <th className="px-4 py-3 text-right">Price (₹)</th>
                            <th className="px-4 py-3 text-right">Total (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {previewDraftItems.map((it) => (
                            <tr key={it.index} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-bold text-slate-400">
                                {it.index}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="font-extrabold text-slate-900 block">
                                  {it.name}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {it.category} {it.company ? `• ${it.company}` : ""}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-slate-600 font-semibold">
                                {it.unitType}
                              </td>
                              <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                                {it.quantity}
                              </td>
                              <td className="px-4 py-2.5 text-right font-semibold">
                                ₹{it.price.toFixed(2)}
                              </td>
                              <td className="px-4 py-2.5 text-right font-black text-slate-900">
                                ₹{it.lineTotal.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Totals Breakdown */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-200">
                      <div className="space-y-1 text-xs text-slate-500 max-w-xs">
                        <p className="font-bold text-slate-700">Notice / Terms:</p>
                        <p>1. Check items carefully before confirmation.</p>
                        <p>2. Stock will be auto-debited once saved.</p>
                      </div>

                      <div className="w-full sm:w-64 space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between text-slate-500">
                          <span>Sub Total:</span>
                          <span className="font-bold text-slate-900">
                            ₹{calculatedSubTotal.toFixed(2)}
                          </span>
                        </div>
                        {Number(form.discount || 0) > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount:</span>
                            <span className="font-bold">
                              -₹{Number(form.discount).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {Number(form.gst || 0) > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>GST / Tax:</span>
                            <span className="font-bold">
                              +₹{Number(form.gst).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                          <span>Grand Total:</span>
                          <span className="text-base text-emerald-700">
                            ₹{calculatedGrandTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-700 pt-1">
                          <span>Amount Paid:</span>
                          <span className="font-bold text-emerald-600">
                            ₹{effectivePaidAmount.toFixed(2)}
                          </span>
                        </div>
                        {calculatedDueAmount > 0 && (
                          <div className="flex justify-between text-rose-600 font-extrabold pt-1 border-t border-dashed border-slate-200">
                            <span>Balance Due (उधारी):</span>
                            <span>₹{calculatedDueAmount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons: Edit vs Confirm */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white rounded-b-3xl flex justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPosStep("FORM")}
                    className="px-5 py-2.5 rounded-2xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-extrabold text-sm transition cursor-pointer flex items-center gap-2"
                  >
                    <FaArrowLeft />
                    <span>← Edit Bill & Items (बदलाव करें)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateSale}
                    disabled={submitting}
                    className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg disabled:opacity-60 transition cursor-pointer flex items-center gap-2"
                  >
                    <FaCheckCircle />
                    <span>
                      {submitting ? "Saving & Generating..." : "Confirm & Save Bill (बिल कन्फर्म करें)"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINAL INVOICE RECEIPT MODAL & PRINTABLE VIEW */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm font-sans overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto">
            {/* Modal Top Control Bar (Hidden when printing) */}
            <div className="no-print px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FaReceipt />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Tax Invoice Receipt
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Invoice: <span className="font-bold text-emerald-700 font-mono">{activeInvoice.invoiceNumber || activeInvoice.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <FaPrint />
                  <span>Print Bill</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadInvoice(
                      activeInvoice._id || activeInvoice.invoiceId,
                      activeInvoice.invoiceNumber || activeInvoice.id,
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <FaDownload />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInvoice(null)}
                  className="h-9 w-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm transition cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div
              id="printable-tax-invoice"
              className="p-6 sm:p-8 space-y-6 bg-white overflow-y-auto max-h-[calc(90vh-140px)]"
            >
              {/* Pharmacy Header & Invoice Tag */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b-2 border-emerald-600 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    MEDISTOCK PRO
                  </h2>
                  <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                    Pharmacy & Healthcare Management
                  </p>
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5 font-medium">
                    <p>100% Genuine Medicines • 24x7 Patient Care Support</p>
                    <p>Lic No: DL-20B/21B-4892 • GSTIN: 07AABCM1234F1Z9</p>
                    <p>Phone: +91 98765 43210 • Email: contact@medistockpro.com</p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Retail Tax Invoice
                  </span>
                  <h4 className="text-base font-mono font-black text-slate-900 mt-1">
                    {activeInvoice.invoiceNumber || activeInvoice.id}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Date:{" "}
                    {new Date(
                      activeInvoice.invoiceDate || activeInvoice.createdAt || new Date(),
                    ).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Patient & Billing Info Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Billed To (Patient / Customer)
                  </span>
                  <p className="text-base font-extrabold text-slate-900">
                    {activeInvoice.customerName || activeInvoice.customer || "Walk-in Patient"}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    Mobile: {activeInvoice.customerMobile || activeInvoice.phone || "Not Provided"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Payment Status
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 font-semibold">
                      Payment Mode:
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {activeInvoice.payment || "UPI / GPay"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs text-slate-600 font-semibold">
                      Bill Status:
                    </span>
                    {Number(activeInvoice.dueAmount || 0) > 0 ? (
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Pending Due: ₹{Number(activeInvoice.dueAmount).toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Paid in Full (चुक्ता)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-extrabold uppercase">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Medicine Description</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Price (₹)</th>
                      <th className="px-4 py-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {Array.isArray(activeInvoice.items) && activeInvoice.items.length > 0 ? (
                      activeInvoice.items.map((it, idx) => {
                        const name = it.medicine?.name || it.name || "Medicine";
                        const unit = it.unitType || "Tablet";
                        const qty = Number(it.displayQuantity || it.quantity || 1);
                        const price = Number(it.sellingPrice || 0);
                        const total = Number(it.total || qty * price);

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-extrabold text-slate-900 block">
                                {name}
                              </span>
                              {it.medicine?.company && (
                                <span className="text-[11px] text-slate-400">
                                  {it.medicine.company}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 font-semibold">
                              {unit}
                            </td>
                            <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                              {qty}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold">
                              ₹{price.toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-black text-slate-900">
                              ₹{total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-slate-600">
                          {formatInvoiceItems(activeInvoice.items, activeInvoice.medicine, activeInvoice.quantity)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown & Summary */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="space-y-1 text-xs text-slate-500 max-w-sm">
                  <p className="font-bold text-slate-700">Terms & Conditions:</p>
                  <p>1. Medicines once sold will only be exchanged as per policy within 7 days with original invoice.</p>
                  <p>2. Opened or refrigerated medicines cannot be returned.</p>
                  <p>3. Computer generated invoice, physical stamp not required.</p>
                </div>

                <div className="w-full sm:w-72 space-y-1.5 text-xs font-semibold bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Sub Total:</span>
                    <span className="font-bold text-slate-900">
                      ₹{Number(activeInvoice.subTotal || activeInvoice.grandTotal || activeInvoice.total || 0).toFixed(2)}
                    </span>
                  </div>
                  {Number(activeInvoice.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-bold">
                        -₹{Number(activeInvoice.discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {Number(activeInvoice.gst || 0) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST / Tax:</span>
                      <span className="font-bold">
                        +₹{Number(activeInvoice.gst).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-base text-emerald-700">
                      ₹{Number(activeInvoice.grandTotal || activeInvoice.total || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-bold text-emerald-600">
                      ₹{Number(activeInvoice.paidAmount ?? activeInvoice.grandTotal ?? activeInvoice.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                  {Number(activeInvoice.dueAmount || 0) > 0 && (
                    <div className="flex justify-between text-rose-600 font-extrabold pt-1 border-t border-dashed border-slate-200">
                      <span>Balance Due (उधारी):</span>
                      <span>₹{Number(activeInvoice.dueAmount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatory Footer */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs text-slate-400">
                <div>
                  <p>Thank you for choosing MediStock Pro!</p>
                  <p className="font-medium text-slate-500">Wish you good health!</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="font-bold text-slate-600">Pharmacist Signature</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions (Manage Payment Mode & Due - Hidden in print) */}
            <div className="no-print p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Due Payment Collect Action */}
              {Number(activeInvoice.dueAmount || 0) > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="block text-xs font-bold text-amber-900">
                      Collect Due Payment (बकाया राशि जमा करें)
                    </span>
                    <span className="text-xs text-amber-700">
                      Remaining Balance: ₹{Number(activeInvoice.dueAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min="1"
                      max={activeInvoice.dueAmount}
                      placeholder={`Max ₹${activeInvoice.dueAmount}`}
                      value={duePayAmount}
                      onChange={(e) => setDuePayAmount(e.target.value)}
                      className="w-full sm:w-36 h-10 rounded-xl bg-white border border-amber-300 px-3 text-sm font-bold text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!duePayAmount || Number(duePayAmount) <= 0) {
                          return toast.error("Valid payment amount enter karein");
                        }
                        try {
                          const res = await updateInvoiceDue(
                            activeInvoice._id || activeInvoice.invoiceId,
                            Number(duePayAmount),
                          );
                          const updatedInv = res.data;
                          setSales((prev) =>
                            prev.map((s) =>
                              s._id === (activeInvoice._id || activeInvoice.invoiceId)
                                ? updatedInv
                                : s,
                            ),
                          );
                          setActiveInvoice(updatedInv);
                          setDuePayAmount("");
                          toast.success("Due payment recorded successfully!");
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to record due payment");
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer shrink-0"
                    >
                      Receive ₹
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Mode Updater & Close Button */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    Payment Mode:
                  </span>
                  <select
                    value={editPayment || activeInvoice.payment || "UPI / GPay"}
                    onChange={(e) => setEditPayment(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Cash">Cash Counter</option>
                    <option value="Card">Card</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      const invId = activeInvoice._id || activeInvoice.invoiceId;
                      if (!invId) return toast.error("Missing invoice id");
                      const newPayment = editPayment || activeInvoice.payment;
                      try {
                        await updateInvoicePayment(invId, newPayment);
                        setSales((prev) =>
                          prev.map((s) =>
                            s._id === invId ? { ...s, payment: newPayment } : s,
                          ),
                        );
                        setActiveInvoice({
                          ...activeInvoice,
                          payment: newPayment,
                        });
                        toast.success("Payment mode updated");
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to update payment mode");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer"
                  >
                    Save Mode
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDirectPrint}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <FaPrint />
                    <span>Print Bill (प्रिंट करें)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInvoice(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl border-2 border-slate-300 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition cursor-pointer"
                  >
                    Close (बंद करें)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Sales;
