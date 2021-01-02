import {useFormik} from "formik";


export function useNormik(onlyChangedValuesOnSubmit, props) {
    let originalInitialValues = {};
    if ("initialValues" in props) {
        let nullSafeInitialValues = {};
        originalInitialValues = props.initialValues;
        for (const [key, value] of Object.entries(originalInitialValues)) {  // todo how to make clean
          if (value === null) {
              nullSafeInitialValues[key] = '';
          } else {
              nullSafeInitialValues[key] = value;
          }
        }
        props.initialValues = nullSafeInitialValues;
    }

    if ("onSubmit" in props){
        const oldOnSubmit = props.onSubmit;
        const nullSafeOnSubmit = (values, actions) => {
            console.log("and the values are", values);
            let normalizedValues = {};
            for (const [key, value] of Object.entries(values)) {  // todo how to make clean
                const normalizedValue = value === ''? null : value;
                if (!onlyChangedValuesOnSubmit ||
                    (onlyChangedValuesOnSubmit && normalizedValue !== originalInitialValues[key] && !Array.isArray(originalInitialValues[key]))){
                  normalizedValues[key] = normalizedValue;
                }

            }
            oldOnSubmit(normalizedValues, actions);
        }
        props.onSubmit = nullSafeOnSubmit;
    }

    return useFormik(props);
}