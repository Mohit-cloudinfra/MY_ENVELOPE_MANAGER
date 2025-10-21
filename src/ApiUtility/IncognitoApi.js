import { Auth, Amplify } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
// import { Auth, Amplify } from 'aws-amplify';

class Incongnitoinfo {

    constructor(resultcallback, failurecallback) {
        this.successresult = resultcallback
        this.failureresult = failurecallback

    }

    GetAgency = async (requestData) => {

        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

        try {
            const userData = await cognitoIdentityServiceProvider.adminGetUser(requestData).promise();
            //console.log(userDatas);
            //const userData = await Auth.currentAuthenticatedUser();
            //console.log(userData);

            // console.log(userData);
            //const customUserInfoJSON = userData.attributes['custom:UserInfo'];


            //this.successresult(customUserInfoJSON);

            this.successresult(userData);

        } catch (error) {
            this.failureresult(error);
            // console.log('Error:', error);
        }

    }

    ProfileNameUpdate = async (requestData) => {
        try {
            const data = requestData.name;
            // console.log(data);
            const userData = await Auth.currentAuthenticatedUser();
            // console.log('profileNameupdate' + userData);
            const updateuser = await Auth.updateUserAttributes(userData, requestData);
            if (updateuser == "SUCCESS") {
                this.successresult(userData, data);
            }
        }
        catch (error) {
            // console.log(error);
            this.failureresult(error);

        }


    }

    PasswordchangeUpdate = async (requestData) => {
        try {

            const userData = await Auth.currentAuthenticatedUser();
            //console.log('PasswordchangeUpdate' + userData);
            var result = await Auth.changePassword(userData, requestData.old, requestData.new);



            this.successresult(result);

        }
        catch (error) {
            // console.log(error);
            this.failureresult(error);

        }


    }

    LogInSubmit = async (requestData) => {
        try {

            var user = await Auth.signIn(requestData.email, requestData.password);
            if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {

                this.successresult(user, {}, requestData)

            }
            else {
                let userInfo = '';
                if (user.attributes['custom:UserInfo']) {
                    userInfo = JSON.parse(user.attributes['custom:UserInfo']);

                }


                this.successresult(user, userInfo, requestData);
            }

        }
        catch (error) {
            this.failureresult(error, requestData);
            // console.log('Error:', error, requestData);

        }
    }

    ConfirmPassword = async (requestData, cnfpassword) => {
        try {
            const user = await Auth.signIn(requestData.email, requestData.password);
            var confirmPasswordUser = await Auth.completeNewPassword(user, cnfpassword.confirmPassword, {});
            const userinfo = JSON.parse(confirmPasswordUser.challengeParam.userAttributes['custom:UserInfo']);

            this.successresult(confirmPasswordUser, userinfo, {});
        } catch (error) {
            this.failureresult(error);
            // console.log('Error:', error);

        }

    }



}

export default Incongnitoinfo;
