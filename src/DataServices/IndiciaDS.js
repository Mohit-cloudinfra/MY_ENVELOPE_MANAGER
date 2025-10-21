
import Api from '../ApiUtility/Api'

class IndiciaDS {

    constructor(successCallBack, failureCallBack){
        console.log("constructor called...")
        this.api = new Api(this.IndiciaDSSuccess.bind(this), this.IndiciaDSFailure.bind(this))
        this.successDSCallBack = successCallBack
        this.failureDSCallBack = failureCallBack
    }

    fetchIndicias = () => {
        const endpoint = process.env.REACT_APP_AWS_ENDPOINT;
        this.api.getAPI(`${endpoint}/dev/Em_Indicias_GET`)       
    }
   
    addIndicia  = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_Indicia_ADD');        
    }
    editIndicia = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_Indicia_ByID_UPDATE');                
    }
    // enableOrDisableIndicia = (requestData) => {
    //     this.api.postAPI(requestData,'/dev/EM_Indicia_ByID_Status_UPDATE');                
    // }

    IndiciaDSSuccess(responsedata)  {
        this.successDSCallBack(responsedata)
    }

    IndiciaDSFailure(error) {
        this.failureDSCallBack(error)
    }

}

export default IndiciaDS;
