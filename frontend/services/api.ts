const API_BASE_URL = 'http://localhost:4000/api/v1';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const FINANCIAL_KEYS = new Set([
  'principalAmount', 'interestRate', 'minAmount', 'maxAmount', 
  'baseInterestRate', 'penaltyRate', 'adminFeeRate', 'collectionFeeValue', 
  'refinanceFeeAmt', 'amountDue', 'principalComponent', 'interestComponent', 
  'penaltyAmount', 'totalExposure', 'estimatedValue', 'debit', 'credit', 
  'totalAmount', 'monthlyIncome', 'monthlyIncomeKhr', 'monthlyExpenses', 'amount'
]);

const convertToDollars = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(convertToDollars);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (FINANCIAL_KEYS.has(key) && typeof obj[key] === 'number') {
        newObj[key] = obj[key] / 100;
      } else {
        newObj[key] = convertToDollars(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const convertToCents = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(convertToCents);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (FINANCIAL_KEYS.has(key) && typeof obj[key] === 'number') {
        newObj[key] = Math.round(obj[key] * 100);
      } else if (FINANCIAL_KEYS.has(key) && typeof obj[key] === 'string' && !isNaN(Number(obj[key]))) {
        newObj[key] = Math.round(Number(obj[key]) * 100);
      } else {
        newObj[key] = convertToCents(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const rawData = await response.json().catch(() => ({}));
  const data = convertToDollars(rawData);

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'API Error') as any;
    error.status = response.status;
    error.response = {
      status: response.status,
      data: data,
    };
    throw error;
  }

  return data;
};

export const api = {
  async post(endpoint: string, data: any, customConfig?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        ...customConfig,
        headers: {
          ...getHeaders(),
          ...(customConfig?.headers || {})
        },
        body: JSON.stringify(convertToCents(data)),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn(`API POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn(`API GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  async patch(endpoint: string, data?: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: data ? JSON.stringify(convertToCents(data)) : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      console.warn(`API PATCH ${endpoint} failed:`, error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.warn(`API DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  async upload(endpoint: string, formData: FormData) {
    try {
      const headers = getHeaders();
      // Remove Content-Type so browser sets it with boundary
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      console.warn(`API UPLOAD ${endpoint} failed:`, error);
      throw error;
    }
  }
};
