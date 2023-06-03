let classDefinitions = [];
generateWrapper(null);
function generateWrapper(jsonString) {
    // jsonString = '{ "abc" : "value", "sbvObj" : { "abc3" : { "dsd" : "123" }}, "asdq" : [ {"fed" : "343" } ] }';
    //jsonString = '{ "abc" : "value", "sbvObj" : "123" }';
    // jsonString = '{ "id": "0001", "type": "donut", "name": "Cake", "ppu": 0.55, "batters": { "batter": [ { "id": "1001", "type": "Regular" }, { "id": "1002", "type": "Chocolate" }, { "id": "1003", "type": "Blueberry" }, { "id": "1004", "type": "Devil\'s Food" } ] }, "topping": [ { "id": "5001", "type": "None" }, { "id": "5002", "type": "Glazed" }, { "id": "5005", "type": "Sugar" }, { "id": "5007", "type": "Powdered Sugar" }, { "id": "5006", "type": "Chocolate with Sprinkles" }, { "id": "5003", "type": "Chocolate" }, { "id": "5004", "type": "Maple" } ] }'
    jsonString = '{ "ERROR": { "ERRORCODE": null, "ERRORDESC": null, "ERRORSYSID": null }, "ISSUCCESS": "True", "RESPONSE": { "DATA": { "ESBRequestId": 1039142, "ErrorCode": "", "ErrorDescription": "", "IntegrationType": "POSIDEX", "IsSuccess": "true", "SchemeId": "", "SourceSystem": "SFDC", "loanToBeForeClosed": "", "LoanApplicationNo": "60000003518", "BusinessType": "Asset", "BusinessUnit": "UC", "MatchDetails" : [ "one", "two" ], "CustomersResponse": [ { "CustomerIdentifier": "a0ZC30000005OPtMAM", "ApplicantDecision": "APPROVE", "ApplicantRejectReason": null, "IsRefer": "N", "ProfileId": null, "AssignedCRN": "9903915065", "IsExistingCustomer": "N", "LoanApplicationNo": "60000003518", "AssignedUCIC": "", "TypeOfApplicant": "Applicant", "CustomerCategory": "Individual", "RequestId": null } ], "LoanDecision": "APPROVE", "LoanRejectReason": "", "IsRefer": "N" }, "PROCESSOR": null }, "RESPONSEID": "961023" }';
    console.log(JSON.parse(jsonString));
    let className = 'GeneratedWrapper';
    let classText = `\npublic class ${className} {\n`;
    classText += generateClass(jsonString);
    generateMethods(jsonString, className)
    //add class definitions
    classText += classDefinitions.join('\n');
    classText += '\n}';
    console.log(classText);
}
    
function generateClass(jsonString, inner = false) {
    let objMap;
    try {
        objMap = typeof(jsonString) === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch(ex) {
        console.log(ex);
    }
    let classText = '';
    for(let key in objMap) {
        let value = objMap[`${key}`];
        classText += generateAtrributes(key, value, inner);
    }
    return classText;
}
    
function generateAtrributes(key, value, inner = false) {
    let isValue = !isParseableAsObject(value) && !isParseableAsArray(value);
    if(isValue) {
        let dataType = getDataTypeForValue(value)
        return `${inner ? '\t\t' : '\t'}public ${dataType} ${key};\n`;
    }
    if(isParseableAsObject(value)) {
        //definiton of inner class
        let definitionclassText = '\n\tpublic class ' + 'cls_' + key  + ' {\n';
        definitionclassText += generateClass(value, true);
        definitionclassText += '\t}';
        classDefinitions.push(definitionclassText);
        return `${inner ? '\t\t' : '\t'}public cls_${key} ${key};\n`;
    }
    if(isParseableAsArray(value)) {
        let definitionclassText = '\n\tpublic class ' + 'cls_' + key  + ' {\n';
        let firstValue = value[0]
        let firstValueType = typeof(firstValue)
        if(firstValueType === 'string') {
            return `${inner ? '\t\t' : '\t'}public List<String> ${key};\n`;
        }
        definitionclassText += generateClass(firstValue, true);
        definitionclassText += '\t}';
        classDefinitions.push(definitionclassText);
        return `${inner ? '\t\t' : '\t'}public List<cls_${key}> ${key};\n`;
    }
    return null;
}
    
function isParseableAsObject(value) {
    let isParseable = JSON.stringify(value)[0] === '{';
    return isParseable;
}

function isParseableAsArray(value) {
    let isParseable = JSON.stringify(value)[0] === '[';
    return isParseable;
}

function getDataTypeForValue(value) {
    if(typeof(value) === 'number') {
        return 'Integer'
    }
    return 'String'
}

function generateMethods(jsonString, className) {
    let parseMethod = ''
    parseMethod += `\tpublic static ${className} parse(String jsonStr){\n`
    parseMethod += `\t\treturn (${className}) JSON.deserialize(jsonStr, ${className}.class);\n`;
    parseMethod += '\t}\n'
    classDefinitions.push(parseMethod);
    let testMethod = ''
    testMethod += `\tpublic static void testParse() {\n`
    testMethod += `\t\tString json = '${jsonString}';\n`
    testMethod += `\t\t${className}.parse(json);\n`
    testMethod += `\t}`
    classDefinitions.push(testMethod)
}