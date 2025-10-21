import Api from '../ApiUtility/Api'



class EnvelopeGroupListDS {

    constructor(successCallBack, failureCallBack){
        console.log("constructor called...")
        this.api = new Api(this.EnvelopeGroupListDSSuccess.bind(this), this.EnvelopeGroupListDSFailure.bind(this))
        this.successDSCallBack = successCallBack
        this.failureDSCallBack = failureCallBack
    }

    fetchEnvelopeGroupListsGet = () => {
        const endpoint = process.env.REACT_APP_AWS_ENDPOINT;
        this.api.getAPI(`${endpoint}/dev/EM_EnvelopeGroups_GET`)      
    }

    addEnvelopGroupList  = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_EnvelopeGroups_ADD');        
    }
  
    getEnvelopeSections= (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_EnvelopeGroup_ByID_GET');        
    }

    envelopeCustomElementsGet = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_EnvelopeGroup_EnvelopeCustomElements_ByIDs_GET');                
    }

    envelopePreview = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_Envelope_Preview');                
    }

   
    envelopeElementsADD = (requestData) => {
        this.api.postAPI(requestData,'/dev/EM_Envelope_CustomElements_ADD');                
    }

   
    EnvelopeGroupListDSSuccess(responsedata)  {
        this.successDSCallBack(responsedata)
    }

    EnvelopeGroupListDSFailure(error) {
        this.failureDSCallBack(error)
    }

}

export default EnvelopeGroupListDS;