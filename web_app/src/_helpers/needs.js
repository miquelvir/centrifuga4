import {userContext} from "../_context/user-context";
import React from 'react';
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {Button} from "@material-ui/core";
import {CHECK_NEEDS} from "../config";


export const NEEDS = {
        get: "get",
        patch: "patch",
        delete: "delete",
        post: "post",
        send_email: "send_email",
        invite_users: "invite_users",
        students: "students",
        courses: "courses",
        guardians: "guardians",
        payments: "payments",
        rooms: "rooms",
        schedules: "schedules",
        teachers: "teachers",
        users: "users",
        paymentReceipts: "payments-receipts",
        attendance: "attendance"
    };


export function useNeeds() {

    const userCtx = React.useContext(userContext);

    const hasNeed = (needs) => (!CHECK_NEEDS || needs.every(need => userCtx.needs.includes(need)));

    return [hasNeed, NEEDS];
}