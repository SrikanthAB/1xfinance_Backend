// utils/mapAadhaarFields.ts
const mapAadhaarFields = (response: any): any => {
  return {
    refId: response.ref_id || null,
    status: response.status || 'VALID',
    message: response.message || null,
    careOf: response.care_of || null,
    address: response.address || null,
    dob: response.dob || null,
    email: response.email || '',
    gender: response.gender || null,
    name: response.name || null,
    splitAddress: {
      country: response.split_address?.country || null,
      dist: response.split_address?.dist || null,
      house: response.split_address?.house || null,
      landmark: response.split_address?.landmark || null,
      pincode: response.split_address?.pincode || null,
      po: response.split_address?.po || null,
      state: response.split_address?.state || null,
      street: response.split_address?.street || null,
      subdist: response.split_address?.subdist || null,
      vtc: response.split_address?.vtc || null,
      locality: response.split_address?.locality || null,
    },
    yearOfBirth: response.year_of_birth || null,
    mobileHash: response.mobile_hash || null,
    photoLink: response.photo_link || null,
    shareCode: response.share_code || null,
    xmlFile: response.xml_file || null,
  };
};

export default mapAadhaarFields;