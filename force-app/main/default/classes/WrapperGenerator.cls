public class WrapperGenerator {

    public static void generateClass(String jsonString) {
        jsonString = '{ "abc" : "value", "sbvObj" : { "abc3" : { }, "asdq" : 123 } }';
        Map<String, Object> objMap;
        try {
            objMap = (Map<String, Object>) JSON.deserializeUntyped(jsonString);
        } catch(Exception ex) {
            throw new InvalidDataException('Invalid JSON: ' + ex.getMessage());
        }
        
        for(String key : objMap.keySet()) {
            Object value = objMap.get(key);
            generateAtrributes(key, String.valueOf(value));
            System.debug(String.valueOf(value));
        }
    }
    
    public static String generateAtrributes(String key, String value) {
        Boolean isValue = !isParseableAsObject(value) && !isParseableAsArray(value);
        if(isValue) {
            return 'public String ' + key + ';\n';
        }
        return null;
    }
    
    public static Boolean isParseableAsObject(String value) {
        Boolean isParseable = value.startsWith('{');
        System.debug(value + ' isParseableAsObject = ' + isParseable);
        return isParseable;
    }
    
    public static Boolean isParseableAsArray(String value) {
        Boolean isParseable = value.startsWith('[');
        System.debug(value + ' isParseableAsArray = ' + isParseable);
        return isParseable;
    }

    public class InvalidDataException extends Exception {}
}