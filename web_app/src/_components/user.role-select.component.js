import DirtyTextField from "./dirtytextfield.component";
import {useTranslation} from "react-i18next";
import {MenuItem} from "@material-ui/core";

export default function RoleSelect({formik}) {
    const { t } = useTranslation();

    return <DirtyTextField
    label={t("role")}
    style={{flex: 1}}
    name="role_id"
    formik={formik}
    select>
    {[{name: 'administrator',
       id: 'administrator'},
       {name: 'administrative',
       id: 'administrative'},
       {name: 'layman',
       id: 'layman'},
       {name: 'teacher',
       id: 'teacher'},
       {name: 'empty',
       id: 'empty'},
       {name: 'no role',
       id: null}].map((role) => (
        <MenuItem key={role.name} value={role.id}>{t(role.name)}</MenuItem>
    ))}
</DirtyTextField>;
}