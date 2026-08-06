import api from "./api";

export const createSale = async (saleData) => {
  const response = await api.post("/sales", saleData);
  return response.data;
};

export const getSales = async () => {
  const response = await api.get("/sales");
  return response.data;
};

export const updateSalePayment = async (saleId, payment) => {
  const response = await api.patch(`/sales/${saleId}/payment`, { payment });
  return response.data;
};
