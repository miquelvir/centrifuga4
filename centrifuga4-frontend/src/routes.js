import React from "react";
import PersonIcon from "@material-ui/icons/Person";
import ClassIcon from "@material-ui/icons/Class";
import RoomIcon from "@material-ui/icons/Room";
import SchoolIcon from "@material-ui/icons/School";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import ContactMailIcon from "@material-ui/icons/ContactMail";
import SettingsIcon from "@material-ui/icons/Settings";
import Students from "./components/students.student.component";
import {useTranslation} from "react-i18next";


const Courses = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("courses")}</h1>
  );
};

const Teachers = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("teachers")}</h1>
  );
};

const Payments = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("payments")}</h1>
  );
};

const Rooms = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("rooms")}</h1>
  );
};

const Users = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("users")}</h1>
  );
};

const Settings = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("settings")}</h1>
  );
};

const Routes = [
  {
    path: '/',
    component: Students,
    title: 'students',
    icon: PersonIcon
  },
  {
    path: '/courses',
    component: Courses,
    title: 'courses',
    icon: ClassIcon
  },
  {
    path: '/teachers',
    component: Teachers,
    title: 'teachers',
    icon: SchoolIcon
  },
  {
    path: '/locations',
    component: Rooms,
    title: 'locations',
    icon:  RoomIcon
  },{
    path: '/payments',
    component: Payments,
    title: 'payments',
    icon: AccountBalanceIcon
  },{
    path: '/users',
    component: Users,
    title: 'users',
    icon: ContactMailIcon
  },{
    path: '/settings',
    component: Settings,
    title: 'settings',
    icon: SettingsIcon
  },
];


export default Routes;