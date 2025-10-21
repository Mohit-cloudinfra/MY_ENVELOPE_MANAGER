import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData ={
    UserPoolId:"us-east-1_zAcHTgD9A", //us-east-1_N0EP08n5H
    ClientId:"25k32lglc8bghovoov120f6v4v" //1s8gptb0aoorlqq7k15k2691vl
}

export default new CognitoUserPool(poolData);