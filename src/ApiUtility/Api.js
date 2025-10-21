import AWS from 'aws-sdk';
import Axios from 'axios';
import CryptoJS from 'crypto-js';

class Api {

  constructor(successAPICallBack, failureAPICallBack) {
    this.successCallBack = successAPICallBack
    this.failureCallBack = failureAPICallBack
  }

  encryptData = (data, secretKey) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  };

  // Utility method for decryption
  decryptData = (encryptedData, secretKey) => {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  };

  getAPI = async (endPoint) => {

    try {

      const secretKey = process.env.REACT_APP_API_SECRTE_KEY; // Use environment variables for security

      AWS.config.update({
        region: process.env.REACT_APP_AWS_REGION, // Update with your AWS region
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      });

      // Create an Axios instance with AWS Signature Version 4 interceptor
      const axiosWithAuth = Axios.create();
      axiosWithAuth.interceptors.request.use(async (config) => {
        const endpoint = endPoint
        const region = process.env.REACT_APP_AWS_REGION;

        // Create an AWS HttpRequest object
        const request = new AWS.HttpRequest(endpoint, region);
        request.method = 'GET';
        request.headers = {
          host: request.endpoint.host,
        };

        // Sign the request using AWS Signature Version 4
        const signer = new AWS.Signers.V4(request, 'execute-api');
        signer.addAuthorization(AWS.config.credentials, new Date());
        const headers = request.headers;
        delete headers.host;

        // Set AWS headers in the Axios request
        config.headers = {
          ...config.headers,
          ...headers,
        };

        return config;
      });

      // Fetch redaction data using Axios with AWS headers
      const response = await axiosWithAuth.get(endPoint);
      // console.log(response);
      if (response.status === 200) {
        const decryptedData = this.decryptData(response.data, secretKey);
        // console.log(decryptedData);
        this.successCallBack(decryptedData.data);
      } else {
        this.failureCallBack(response.data.message)
      }
    } catch (error) {
      this.failureCallBack(error.message)
    }

  }

  // POST API with encryption and AWS signature
  postAPI = (requestData, path) => {
    // console.log('Request data is : ', requestData)
    const secretKey = process.env.REACT_APP_API_SECRTE_KEY; // Use environment variables for security
    const encryptedData = this.encryptData(requestData, secretKey);
    // console.log("Encrypted Data:", encryptedData);

    const envelopeString = JSON.stringify(encryptedData);
    const sizeInBytes = new Blob([envelopeString]).size; // Size in bytes
    const sizeInMB = sizeInBytes / (1024 * 1024); // Convert to MB

    // console.log(`Encrypted Data Size: ${sizeInMB.toFixed(2)} MB`);

    try {
      const endpoint = process.env.REACT_APP_AWS_ENDPOINT;
      const region = process.env.REACT_APP_AWS_REGION;

      // Create AWS request
      const request = new AWS.HttpRequest(endpoint, region);
      request.method = 'POST';
      request.path = path;
      request.headers = { host: request.endpoint.host };
      request.body = encryptedData;

      // request.body = JSON.stringify({ data: encryptedData });

      // Setup AWS credentials
      const credentials = new AWS.Credentials({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
      });

      // Sign the request with AWS Signature Version 4
      const signer = new AWS.Signers.V4(request, 'execute-api');
      signer.addAuthorization(credentials, new Date());

      const headers = request.headers;
      delete headers.host;

      // Make the POST request with encrypted data
      Axios({
        url: endpoint + request.path,
        headers: { ...headers },
        data: encryptedData, // Sending encrypted data
        method: 'POST',
      })
        .then((response) => {
          // console.log("Response :  " , response);
          if (response.status === 200) {
            const decryptedData = this.decryptData(response.data, secretKey);
            // console.log('Final Decrypted Data is :', decryptedData)
            this.successCallBack(decryptedData);
          }
          else if (response.status === 202) {
            const decryptedData = this.decryptData(response.data, secretKey);
            // console.log('Final Decrypted Data is :', decryptedData)
            this.successCallBack(decryptedData);
          }
          else {
            console.error('Invalid response data format:', response.data.message);
            this.failureCallBack('Invalid response data format');
          }
        })
        .catch((error) => {
          // console.error('Error posting data:', error);
          this.failureCallBack(error.message);
        });
    } catch (error) {
      // console.error('Error in postAPI:', error);
      this.failureCallBack(error.message);
    }
  };



}



export default Api;