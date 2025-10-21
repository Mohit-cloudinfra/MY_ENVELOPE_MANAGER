import Api from '../ApiUtility/IncognitoApi';

class ProfileDs {

    constructor(successCallBack, failureCallBack) {
        console.log("constructor called...")
        this.api = new Api(this.ProfileDSSuccess.bind(this), this.ProfileDSFailure.bind(this))
        this.successDSCallBack = successCallBack
        this.failureDSCallBack = failureCallBack
    }


    ProfileNameUpdate = (requestData) => {
        this.api.ProfileNameUpdate(requestData)
    }


    ProfileDSSuccess(responsedata, name) {
        this.successDSCallBack(responsedata, name)
    }

    ProfileDSFailure(error) {
        this.failureDSCallBack(error)
    }


}



export default ProfileDs;