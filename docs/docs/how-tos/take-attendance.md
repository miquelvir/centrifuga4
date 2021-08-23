# take attendance
[**Teachers**](../basics/roles.md#teacher) (and any [**role**](../basics/roles.md) with equal or greater permission level) 
can take attendance of courses.

## accessing the attendance page
### from the teacher dashboard

[**Teachers**](../basics/roles.md#teacher) have access to the [Teacher Dashboard](https://centrifuga4.herokuapp.com/app/teacher-dashboard). 
They can find the collection of all courses they teach there, and a shortcut to the attendance page.

![teacher dashboard](/img/teacher-dashboard.png)



### from the course page

Users with access to the general `Course` resource can 
go to the [courses pane](https://centrifuga4.herokuapp.com/app/home/courses)
and use the shortcut there.

![course in the courses pane](/img/courses-course.png)

## the attendance page

![attendance page](/img/attendance.png)

A student can be marked as:
- **attended**, the student attended the class
- **absent**, the student did not attend the class (without a proper justification)
- **absent (justified)**, the student did not attend the class (but there was a proper justification)

Additionally, a comment can be added (in any of the 3 possible states).

![possible attendance states](/img/attendance-status.png)


# passar llista
Els [**professors**](../basics/roles.md#professor) (i qualsevol [**rol**](../basics/roles.md) amb igual o més permisos) 
poden passar llista a cursos.

## accedir a la pàgina del passa-llista
### des del panell del professorx

Els [**professors**](../basics/roles.md#professor) tenen accés al [Panell del professorx](https://centrifuga4.herokuapp.com/app/teacher-dashboard). 
Hi poden trobar tots els cursos que imparteixen, així com un enllaç a la pàgina del curs.

![panell del professorx](/img/teacher-dashboard.png)



### des de la pàgina del curs

Els usuaris amb accés en general al recurs `Cursos` poden anar al
[panell dels cursos](https://centrifuga4.herokuapp.com/app/home/courses)
i usar l'enllaç que s'hi troba.

![curs en el panell de cursos](/img/courses-course.png)

## la pàgina del passa-llista

![pàgina del passa-llista](/img/attendance.png)

Un estudiant es pot marcar com a:
- **ha assistit**, l'estudiant ha assistit a la classe
- **absència**, l'estudiant no ha assistit a la classe (sense una deguda justificació)
- **absència (justificada)**, l'estudiant no ha assistit a la classe (però amb una deguda justificació)

Addicionalment, es pot afegir un comentari (en qualsevol dels tres possibles estats).

![possibles estats d'assistència](/img/attendance-status.png)
