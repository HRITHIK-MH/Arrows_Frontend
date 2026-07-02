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

const fetchMasterOptions = async (endpoint, key) => {
  const response = await masterDataApi.get(endpoint);
  return toOptions(extractList(response?.data, key));
};

export const fetchHeadcountDropdownOptions = async () => {
  const [entities, locations, modes, costBands, customers] = await Promise.all([
    fetchMasterOptions('/master/entities', 'entities'),
    fetchMasterOptions('/master/locations', 'locations'),
    fetchMasterOptions('/master/modes', 'modes'),
    fetchMasterOptions('/master/costBands', 'costBands'),
    fetchMasterOptions('/master/customers', 'customers'),
  ]);

  return {
    entity: entities,
    workLocation: locations,
    mode: modes,
    cost: costBands,
    customer: customers,
  };
};
