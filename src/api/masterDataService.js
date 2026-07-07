import { createServiceApi } from './axiosConfig';

const masterDataApi = createServiceApi('');

const toOptions = (values = []) =>
  (Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .map((value) => ({ value, label: value }));

const extractList = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const fetchMasterOptions = async (endpoint, key, requestOptions = {}) => {
  const response = await masterDataApi.get(endpoint, requestOptions);
  return toOptions(extractList(response?.data, key));
};

const HARDCODED_BILLING_TYPES = [
  { value: 'BILLABLE', label: 'billable' },
  { value: 'NON_BILLABLE', label: 'non-billable' },
];

export const fetchHeadcountDropdownOptions = async () => {
  const results = await Promise.allSettled([
    fetchMasterOptions('/master/entities', 'entities', { skipAuthRedirect: true }),
    fetchMasterOptions('/master/locations', 'locations', { skipAuthRedirect: true }),
    fetchMasterOptions('/master/modes', 'modes', { skipAuthRedirect: true }),
    fetchMasterOptions('/master/costBands', 'costBands', { skipAuthRedirect: true }),
    fetchMasterOptions('/master/customers', 'customers', { skipAuthRedirect: true }),
  ]);

  const [entities, locations, modes, costBands, customers] = results.map((result) =>
    result.status === 'fulfilled' ? result.value : []
  );

  return {
    entity: entities,
    work_location: locations,
    workLocation: locations,
    mode: modes,
    cost: costBands,
    customer: customers,
    billing_type: HARDCODED_BILLING_TYPES,
    billingType: HARDCODED_BILLING_TYPES,
  };
};
