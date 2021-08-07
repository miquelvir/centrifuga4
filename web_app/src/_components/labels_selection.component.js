import React from 'react';
import {useTranslation} from "react-i18next";
import {FormControlLabel} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import DirtyCheckbox from "./dirty_checkbox";
import {education_years} from "../_data/education";

export default function LabelsSelection({formik, name="labels", noDirty=false}) {
  const { t } = useTranslation();

  return <React.Fragment>
      <Typography>{t("labels")}</Typography>
                  {education_years.map(label => (
                    <FormControlLabel
                        control={
                            <DirtyCheckbox
                            checked={formik.values[name]===undefined? false: formik.values[name].includes(label)}
                            name={name}
                            value={label}
                            formik={formik}
                            noDirty={noDirty}
                            />
                        }
                        key={label}
                        label={t(label)}
                      />))}

                      <FormControlLabel
                        control={
                            <DirtyCheckbox
                            checked={formik.values[name]===undefined? false: formik.values[name].includes("adult")}
                            name={name}
                            value="adult"
                            formik={formik}
                            noDirty={noDirty}
                            />
                        }
                        label={t("adult")}
                      />
        </React.Fragment>
}
