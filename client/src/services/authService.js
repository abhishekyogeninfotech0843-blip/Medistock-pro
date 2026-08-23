import API from "./api";

export const sendOtp = async (phone, type = "register") => {
  const response = await API.post("/auth/send-otp", {
    phone,
    type,
  });
  return response.data;
};

export const verifyOtpLogin = async (phone, otp) => {
  const response = await API.post("/auth/verify-otp-login", {
    phone,
    otp,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async (name, email, phone, password, role = "staff", otp) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    phone,
    password,
    role,
    otp,
  });
  return response.data;
};
