import { createContext, useContext, useState } from "react";

import {
  CreatePaymentApi,
  VerifyPaymentApi,
  GetMyLearningApi,
  GetMyEnrollmentsApi,
} from "../services/api/lmsService";
import { CreateOrderApi } from "../services/api/orderService";

const EnrollmentContext = createContext();

export const EnrollmentProvider = ({ children }) => {
  const [myLearning, setMyLearning] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  // POST /order/create-order  { courseId, payment_info: { id, status } }
  const createOrder = async (payload) => {
    try {
      setLoading(true);
      return await CreateOrderApi(payload);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (payload) => {
    try {
      setLoading(true);
      return await CreatePaymentApi(payload);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (payload) => {
    try {
      setLoading(true);
      return await VerifyPaymentApi(payload);
    } finally {
      setLoading(false);
    }
  };

  // No toast here: logged-out visitors / non-students would get an error on
  // every public page. Callers decide what to show.
  const getMyLearning = async () => {
    try {
      setLoading(true);
      const response = await GetMyLearningApi();
      setMyLearning([
        ...(response.continueLearning || []),
        ...(response.inProgress || []),
        ...(response.completed || []),
      ]);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const getMyEnrollments = async () => {
    try {
      setLoading(true);
      const response = await GetMyEnrollmentsApi();
      setEnrollments(response.enrollments || []);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const clearLearning = () => {
    setMyLearning([]);
    setEnrollments([]);
  };

  return (
    <EnrollmentContext.Provider
      value={{
        createOrder,
        myLearning,
        enrollments,
        loading,
        createPayment,
        verifyPayment,
        getMyLearning,
        getMyEnrollments,
        clearLearning,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useEnrollment = () => useContext(EnrollmentContext);

