
import Api from '../ApiUtility/Api'

class EnvelopeDS {

    constructor(successCallBack, failureCallBack){
        console.log("constructor called...")
        this.api = new Api(this.EnvelopeDSSuccess.bind(this), this.EnvelopeDSFailure.bind(this))
        this.successDSCallBack = successCallBack
        this.failureDSCallBack = failureCallBack
    }

    fetchEnvelopes = () => {
        const endpoint = process.env.REACT_APP_AWS_ENDPOINT;
        this.api.getAPI(`${endpoint}/dev/EM_Envelopes_GET`)     
    }
   
    addEnvelope  = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_Envelope_ADD');        
    }

    updateEnvelopeName = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_Envelope_Name_UPDATE');        
    }

    cloneEnvelope  = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_Envelope_CLONE');        
    }
    
    deleteEnvelope  = (requestData) => {
        this.api.mongoDBPostAPI(requestData,'/app/application-0-xygpnof/endpoint/EM_Envelope_DELETE');                
    }
    editEnvelope = (requestData) => {
        this.api.mongoDBPostAPI(requestData,'/app/application-0-xygpnof/endpoint/EM_EnvelopeStatus_Update');                
    }

    EnvelopeDSSuccess(responsedata)  {
        this.successDSCallBack(responsedata)
    }

    EnvelopeDSFailure(error) {
        this.failureDSCallBack(error)
    }

}

export default EnvelopeDS;