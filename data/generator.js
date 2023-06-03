let classDefinitions = [];
generateWrapper(null);
function generateWrapper(jsonString) {
    jsonString = '{ "abc" : "value", "sbvObj" : { "abc3" : { "dsd" : "123" }}, "asdq" : [ {"fed" : "343" } ] }';
    //jsonString = '{ "abc" : "value", "sbvObj" : "123" }';
    console.log(JSON.parse(jsonString));
    let classText = '\npublic class GeneratedWrapper {\n';
    classText += generateClass(jsonString);
    //add class definitions
    classText += classDefinitions.join('\n');
    classText += '\n}';
    console.log(classText);
}
    
function generateClass(jsonString) {
    let objMap;
    try {
        objMap = JSON.parse(jsonString);
    } catch(ex) {
        throw ex
    }
    let classText = '';
    for(let key in objMap) {
        let value = objMap[`${key}`];
        classText += generateAtrributes(key, JSON.stringify(value));
    }
    return classText;
}
    
function generateAtrributes(key, value) {
    let isValue = !isParseableAsObject(value) && !isParseableAsArray(value);
    if(isValue) {
        return '\tpublic String ' + key + ';\n';
    }
    if(isParseableAsObject(value)) {
        //definiton of inner class
        let definitionclassText = '\n\tpublic class ' + 'cls_' + key  + ' {\n';
        definitionclassText = generateClass(value);
        definitionclassText += '}';
        classDefinitions.push(definitionclassText);
        return '\tpublic cls_' + key + ' ' + key + ';\n';
    }
    if(isParseableAsArray(value)) {
        return '\tpublic List<cls_' + key + '>' + key + ';\n';
    }
    return null;
}
    
function isParseableAsObject(value) {
    let isParseable = value[0] === '{';
    return isParseable;
}

function isParseableAsArray(value) {
    let isParseable = value[0] === '[';
    return isParseable;
}