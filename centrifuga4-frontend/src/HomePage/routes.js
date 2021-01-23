import React from "react";
import PersonIcon from "@material-ui/icons/Person";
import ClassIcon from "@material-ui/icons/Class";
import RoomIcon from "@material-ui/icons/Room";
import SchoolIcon from "@material-ui/icons/School";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import ContactMailIcon from "@material-ui/icons/ContactMail";
import SettingsIcon from "@material-ui/icons/Settings";
import Students from "../_components/students.component";
import Users from "../_components/users.component";
import {useTranslation} from "react-i18next";
import Payments from "../_components/payments.component";
import Rooms from "../_components/rooms.component";


const Courses = () => {
  const { t } = useTranslation();
  const query = new URLSearchParams(window.location.search);
  const id = query.get('id')
  return (
      <div>
        <h1>{t("courses")}</h1>
      <h2>{id}</h2>
      </div>

  );
};

const Teachers = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("teachers")}</h1>
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
  }
];


export default Routes;