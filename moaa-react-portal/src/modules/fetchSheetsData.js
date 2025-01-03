import axios from "axios";

axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    const data = JSON.parse(response.data);
    if (data.error) {
      return Promise.reject(new Error(data.error));
    }
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

// TODO: may have to handle id
//* https://tanstack.com/query/latest/docs/framework/react/guides/query-functions
export const fetchMoaaSheetsData = async (workshopId) => {
  //* body will be {data:[]}
  const url =
    "https://moaa-portal-test.local/wp-json/moaa-sheets/v1/getWorkshopResults";
  const response = await axios.get(url, {
    // eslint-disable-next-line no-undef
    //TODO: map dropdown value to params
    params: { workshop_id: workshopId },
    headers: { "X-WP-nonce": USER.nonce },
  });
  /**
   * expected resultData.data layout
   * [
   *  {
   *    worksheet: worksheetName,
   *    data: [
   *      {
   *        col1:row0col1
   *        col2:row0col2
   *        col3:row0col3
   *        ...
   *      },
   *    ]
   *  }
   * ]
   */
  const resultData = JSON.parse(response.data);
  console.log(resultData.data);
  return resultData.data;
};

export const fetchMoaaWorkshopsList = async () => {
  const url =
    "https://moaa-portal-test.local/wp-json/moaa-sheets/v1/getWorkshopsList";

  const response = await axios.get(url, {
    // eslint-disable-next-line no-undef
    headers: { "X-WP-nonce": USER.nonce },
  });

  const resultData = JSON.parse(response.data);
  console.log(resultData);
  return resultData.data;
};
