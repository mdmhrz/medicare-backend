import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { DoctorScheduleController } from "./doctorSchedule.controller";


const router = Router();

// create my doctor schedule (only for doctors)
router.post(
    "/create-my-doctor-schedule",
    checkAuth(Role.DOCTOR),
    DoctorScheduleController.createMyDoctorSchedule
);


// get all of my schedules (only for doctors)
router.get(
    "/my-doctor-schedules",
    checkAuth(Role.DOCTOR),
    DoctorScheduleController.getMyDoctorSchedules
);


// get all doctors schedules (only for admins)
router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorScheduleController.getAllDoctorSchedules
);


// get doctor schedule by id (only for admins)
router.get(
    "/:doctorId/schedule/:scheduleId",
    // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorScheduleController.getDoctorScheduleById
);

router.patch(
    "/update-my-doctor-schedule",
    checkAuth(Role.DOCTOR),
    DoctorScheduleController.updateMyDoctorSchedule
);

router.delete(
    "/delete-my-doctor-schedule/:id",
    checkAuth(Role.DOCTOR),
    DoctorScheduleController.deleteMyDoctorSchedule
);

export const DoctorScheduleRoutes = router;