import {useFormik} from "formik";


export function useNormik(props) {
    if ("initialValues" in props) {
        let nullSafeInitialValues = {};
        for (const [key, value] of Object.entries(props.initialValues)) {  // todo how to make clean
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
            for (const [key, value] of Object.entries(values)) {  // todo how to make clean
              if (value === '') normalizedValues[key] = null;
            }
            oldOnSubmit(normalizedValues, actions);
        }
        props.onSubmit = nullSafeOnSubmit;
    }

    return useFormik(props);
}