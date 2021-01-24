import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useTranslation} from "react-i18next";
import {Checkbox, FormControlLabel} from "@material-ui/core";
import {allNeeds} from "../_data/needs";
import Typography from "@material-ui/core/Typography";
import DirtyCheckbox from "./dirty_checkbox";

export default function NeedsSelection({formik, name="needs", noDirty=false}) {
  const { t } = useTranslation();

  return <React.Fragment>
      <Typography>{t("permissions")}</Typography>
                  {allNeeds.map(need => (
                    <FormControlLabel
                        control={
                            <DirtyCheckbox
                            checked={formik.values[name]===undefined? false: formik.values[name].includes(need.name)}
                            name={name}
                            value={need.name}
                            formik={formik}
                            noDirty={noDirty}
                            />
                        }
                        key={need.name}
                        label={t(need.description)}
                      />))}
        </React.Fragment>
}
