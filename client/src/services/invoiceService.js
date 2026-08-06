import api from "./api";

export const createInvoice = async (invoiceData) => {
  const response = await api.post("/invoices", invoiceData);
  return response.data;
};

export const getInvoices = async () => {
  const response = await api.get("/invoices");
  return response.data;
};

export const downloadInvoicePDF = async (invoiceId) => {
  const response = await api.get(`/invoices/pdf/${invoiceId}`, {
    responseType: "blob",
  });
  return response.data;
};

export const updateInvoicePayment = async (invoiceId, payment) => {
  const response = await api.patch(`/invoices/${invoiceId}/payment`, {
    payment,
  });
  return response.data;
};
