import {useFormik} from "formik";


export function useNormik(onlyChangedValuesOnSubmit, props, allowArrays=false) {
    let originalInitialValues = {};
    if ("initialValues" in props) {
        let nullSafeInitialValues = {};
        originalInitialValues = props.initialValues;
        for (const [key, value] of Object.entries(originalInitialValues)) {
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
            let normalizedValues = {};
            for (const [key, value] of Object.entries(values)) {
                const normalizedValue = value === ''? null : value;
                if (!onlyChangedValuesOnSubmit ||
                    (onlyChangedValuesOnSubmit && normalizedValue !== originalInitialValues[key] &&
                        (allowArrays || !Array.isArray(originalInitialValues[key])) )){
                  normalizedValues[key] = normalizedValue;
                }

            }
            oldOnSubmit(normalizedValues, actions);
        }
        props.onSubmit = nullSafeOnSubmit;
    }

    return useFormik(props);
}