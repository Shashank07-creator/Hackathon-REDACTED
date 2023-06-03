import {LightningElement} from 'lwc';

// Uncomment if using static JS for Conversion Logic
// import generateWrapper from '@salesforce/resourceUrl/Generator'
// import {loadScript} from 'lightning/platformResourceLoader'; 

export default class jsonToApexConverter extends LightningElement {
    jsonString = ''
    apexWrapper = ''

    handleChange(event) {
        this.jsonString = event.target.value
    }
    // If We use Static Resource to host JS and create Service workers [Due to Locker Security We cannot use workers directly in LWC]
    //
    // handleConversion(){
    //     console.log('Inside Handle Conversion')
    //     console.log(this.jsonString)
    //     this.apexWrapper = window.generateWrapper(this.jsonString)
    // }
    // renderedCallback() {
    //     loadScript(this,generateWrapper)
    //     .then(() => console.log('Loaded'))
    //     .catch(error => console.log(error));
    // }
    handleConversion() {
        this.apexWrapper = this.generateWrapper(this.jsonString)
    }
    classDefinitions = []
    generateWrapper(jsonString) {
        console.log('generateWrapper')
        jsonString = jsonString || document.getElementById('jsonString-0')
        console.log(JSON.parse(jsonString));
        let className = 'GeneratedWrapper';
        let classText = `\npublic class ${className} {\n`;
        classText += this.generateClass(jsonString);
        this.generateMethods(jsonString, className)
        //add class definitions
        classText += this.classDefinitions.join('\n');
        classText += '\n}';
        console.log(classText);
        return classText
    }

    generateClass(jsonString, inner = false) {
        console.log('generateClass')
        let objMap;
        try {
            objMap = typeof(jsonString) === 'string' ? JSON.parse(jsonString) : jsonString;
        } catch (ex) {
            console.log(ex);
        }
        let classText = '';
        for (let key in objMap) {
            let value = objMap[`${key}`];
            classText += this.generateAtrributes(key, value, inner);
        }
        return classText;
    }

    generateAtrributes(key, value, inner = false) {
        console.log('generateAttributes')
        let isValue = !this.isParseableAsObject(value) && !this.isParseableAsArray(value);
        if (isValue) {
            let dataType = this.getDataTypeForValue(value)
            return `${inner ? '\t\t' : '\t'}public ${dataType} ${key};\n`;
        }
        if (this.isParseableAsObject(value)) {
            //definiton of inner class
            let definitionclassText = '\n\tpublic class ' + 'cls_' + key + ' {\n';
            definitionclassText += this.generateClass(value, true);
            definitionclassText += '\t}';
            this.classDefinitions.push(definitionclassText);
            return `${inner ? '\t\t' : '\t'}public cls_${key} ${key};\n`;
        }
        if (this.isParseableAsArray(value)) {
            let definitionclassText = '\n\tpublic class ' + 'cls_' + key + ' {\n';
            let firstValue = value[0]
            let firstValueType = typeof(firstValue)
            if (firstValueType === 'string') {
                return `${inner ? '\t\t' : '\t'}public List<String> ${key};\n`;
            } else if (Array.isArray(firstValue)) {
                let attribute = ''
                let count = 0
                while (Array.isArray(firstValue)) {
                    firstValue = firstValue[0]
                    count++
                    attribute += 'List<'
                }
                if (typeof(firstValue) !== 'object') {
                    attribute += this.getDataTypeForValue(firstValue)
                } else {
                    attribute += `cls_${key}`
                    definitionclassText += this.generateClass(firstValue, true);
                    definitionclassText += '\t}';
                    this.classDefinitions.push(definitionclassText);
                }
                while (count > 0) {
                    attribute += '>'
                    count--
                }
                return `${inner ? '\t\t' : '\t'}public List<${attribute}> ${key};\n`;
            }
            definitionclassText += this.generateClass(firstValue, true);
            definitionclassText += '\t}';
            this.classDefinitions.push(definitionclassText);
            return `${inner ? '\t\t' : '\t'}public List<cls_${key}> ${key};\n`;
        }
        return null;
    }

    isParseableAsObject(value) {
        let isParseable = JSON.stringify(value)[0] === '{';
        return isParseable;
    }

    isParseableAsArray(value) {
        let isParseable = JSON.stringify(value)[0] === '[';
        return isParseable;
    }

    getDataTypeForValue(value) {
        let type = typeof(value)
        if (type === 'number') {
            if (Math.floor(value) === Math.ceil(value))
                return 'Integer'
            else
                return 'Double'
        }
        if (type === 'boolean') {
            return 'Boolean'
        }
        return 'String'
    }

    generateMethods(jsonString, className) {
        let parseMethod = ''
        parseMethod += `\tpublic static ${className} parse(String jsonStr){\n`
        parseMethod += `\t\treturn (${className}) JSON.deserialize(jsonStr, ${className}.class);\n`;
        parseMethod += '\t}\n'
        this.classDefinitions.push(parseMethod);
        let testMethod = ''
        testMethod += `\tpublic static void testParse() {\n`
        testMethod += `\t\tString json = '${jsonString}';\n`
        testMethod += `\t\t${className}.parse(json);\n`
        testMethod += `\t}`
        this.classDefinitions.push(testMethod)
    }

}