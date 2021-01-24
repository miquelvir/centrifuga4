import React from "react";
import PersonIcon from "@material-ui/icons/Person";
import ClassIcon from "@material-ui/icons/Class";
import RoomIcon from "@material-ui/icons/Room";
import SchoolIcon from "@material-ui/icons/School";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import ContactMailIcon from "@material-ui/icons/ContactMail";
import Students from "../_components/students.component";
import Users from "../_components/users.component";
import Payments from "../_components/payments.component";
import Rooms from "../_components/rooms.component";
import Teachers from "../_components/teachers.component";
import Courses from "../_components/courses.component";


const Routes = [
  {
    path: '/students',
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