const axios = require('axios');

const AuthKey = '216915AKdZmtyOQ75b066fae';
const TemplateId = '5dac7a30d6fc057c904b169d';

const sendOTP = async mobileNumber => {
  const pattern = /^[6-9]\d{9}$/;
  try {
    if (!pattern.test(mobileNumber)) {
      throw new Error('Invalid Mobile Number');
    }
    const response = await axios.post(
      `https://api.msg91.com/api/v5/otp?template_id=${TemplateId}&mobile=${mobileNumber}&authkey=${AuthKey}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const verifyOTP = async (mobileNumber, otp) => {
  const pattern = /^[6-9]\d{9}$/;
  try {
    if (!pattern.test(mobileNumber)) {
      throw new Error('Invalid Mobile Number');
    }
    const response = await axios.post(
      `https://api.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${mobileNumber}&authkey=${AuthKey}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendOTP,
  verifyOTP
};
