import React from "react";
import PersonIcon from "@material-ui/icons/Person";
import ClassIcon from "@material-ui/icons/Class";
import RoomIcon from "@material-ui/icons/Room";
import SchoolIcon from "@material-ui/icons/School";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import EmailIcon from '@material-ui/icons/Email';
import ContactMailIcon from "@material-ui/icons/ContactMail";
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import Students from "../_components/students.component";
import Users from "../_components/users.component";
import Payments from "../_components/payments.component";
import Rooms from "../_components/rooms.component";
import Teachers from "../_components/teachers.component";
import Courses from "../_components/courses.component";
import {NEEDS} from "../_helpers/needs";
import Email from "../_components/email.component";

const Routes = [
  {
    path: 'students',
    component: Students,
    title: 'students',
    icon: PersonIcon,
    needs: [NEEDS.students, NEEDS.get]
  },
  {
    path: 'courses',
    component: Courses,
    title: 'courses',
    icon: ClassIcon,
    needs: [NEEDS.courses, NEEDS.get]
  },
  {
    path: 'teachers',
    component: Teachers,
    title: 'teachers',
    icon: SchoolIcon,
    needs: [NEEDS.teachers, NEEDS.get]
  },
  {
    path: 'rooms',
    component: Rooms,
    title: 'rooms',
    icon:  RoomIcon,
    needs: [NEEDS.rooms, NEEDS.get]
  },{
    path: 'payments',
    component: Payments,
    title: 'payments',
    icon: AccountBalanceIcon,
    needs: [NEEDS.payments, NEEDS.get]
  },{
    path: 'users',
    component: Users,
    title: 'users',
    icon: ContactMailIcon,
    needs: [NEEDS.users, NEEDS.get]
  },{
    path: 'email',
    component: Email,
    title: 'email',
    icon: EmailIcon,
    needs: [NEEDS.send_email, NEEDS.get]
  }
];


export default Routes;