import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { FaWallet, FaArrowTrendUp, FaMoneyBillWave } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import { getDashboardData } from "../services/dashboardService";

const Balance = () => {
    const [dashStats, setDashStats] = useState(null);

    useEffect(() => {
        getDashboardData().then(data => {
            if (data) setDashStats(data);
        }).catch(err => console.error(err));
    }, []);

    const totalDues = dashStats?.totalCustomerDues || 0;
    const dueCount = dashStats?.customerDuesList?.length || 0;

    const summaryCards = [
        {
            title: "Current Balance",
            value: "₹2,84,750",
            note: "+12.4% from last month",
            icon: <FaWallet className="text-2xl" />,
            accent: "from-emerald-500 to-green-600",
        },
        {
            title: "Pending Payments",
            value: "₹48,200",
            note: "2 supplier invoices",
            icon: <FaMoneyBillWave className="text-2xl" />,
            accent: "from-amber-500 to-orange-600",
        },
        {
            title: "Receivables (Customer Dues)",
            value: `₹${totalDues.toLocaleString()}`,
            note: `${dueCount} customer credit balances`,
            icon: <FaArrowTrendUp className="text-2xl" />,
            accent: "from-sky-500 to-blue-600",
        },
    ];

    const recentActivity = [
        { label: "Payment received from customer ledger", amount: "+₹18,500", time: "10 min ago" },
        { label: "Supplier invoice settled", amount: "-₹12,000", time: "1 hr ago" },
        { label: "Advance received for medicines", amount: "+₹7,250", time: "3 hrs ago" },
    ];

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl border border-slate-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
                                Balance Overview
                            </p>
                            <h2 className="mt-2 text-3xl font-extrabold">Money movement at a glance</h2>
                            <p className="mt-2 max-w-2xl text-slate-300">
                                Track your available balance, pending settlements, and recent cash flow in one place.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Status</p>
                            <p className="mt-1 text-xl font-bold text-emerald-300">Healthy</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {summaryCards.map((card) => (
                        <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className={`inline-flex rounded-2xl bg-gradient-to-r ${card.accent} p-3 text-white`}>
                                {card.icon}
                            </div>
                            <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
                            <p className="mt-2 text-2xl font-extrabold text-slate-900">{card.value}</p>
                            <p className="mt-1 text-sm text-slate-500">{card.note}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <FaHistory className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">Recent Activity</h3>
                                <p className="text-sm text-slate-500">Latest ledger updates</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {recentActivity.map((item) => (
                                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div>
                                        <p className="font-semibold text-slate-800">{item.label}</p>
                                        <p className="text-sm text-slate-500">{item.time}</p>
                                    </div>
                                    <span className={`font-bold ${item.amount.startsWith("+") ? "text-emerald-600" : "text-slate-700"}`}>
                                        {item.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-extrabold text-slate-900">Quick Note</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            This page is now available directly from the sidebar. If you were trying to open it through a direct link, use /balance or /bala.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Balance;
