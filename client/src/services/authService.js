import API from "./api";

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (name, email, password, role = "staff") => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
    role,
  });

  return response.data;
};
