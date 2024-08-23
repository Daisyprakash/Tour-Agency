import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import Cookies from 'js-cookie'; // Ensure you have js-cookie installed

import { isLoggedOut } from "./slices/userSlice";

// create a new mutex
const mutex = new Mutex();
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    // Get the token from cookies
    const token = Cookies.get('accessToken'); // Replace 'accessToken' with your actual cookie name
    
    // If the token exists, add it to the headers
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

const customFetchBase = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.data?.message === "Please login to proceed!") {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: "/auth/refresh" },
          api,
          extraOptions
        );

        if (refreshResult?.data) {
          // retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(isLoggedOut());
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export default customFetchBase;
