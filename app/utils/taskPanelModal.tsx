"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { CheckCircle, PencilSimple, Trash } from "@phosphor-icons/react";
import TaskModal from "@/app/components/modals/taskModal";
import { deactivateFacultyTask, fetchFacultyTasksForStudent } from "@/lib/helpers/faculty/facultyTasks";
import { deactivateStudentTask, fetchStudentTasksForLoggedInStudent } from "@/lib/helpers/student/studentTaskAPI";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import TaskCardShimmer from "@/app/(screens)/faculty/shimmers/TaskCardShimmer";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import { useStudent } from "./context/student/useStudent";

export type Task = {
    facultyTaskId: number;
    title: string;
    description: string;
    time: string;
    date: string;
};

export type TaskPanelModalProps = {
    open: boolean;
    onClose: () => void;

    role?: "faculty" | "student";
    style?: boolean;
    loading?: boolean;

    facultyTasks?: Task[];
    studentTasks?: Task[];

    collegeSubjectId?: number;
    facultyId?: number;
    studentId?: number;

    onEditTask?: (task: Task) => void;
    onAddTask?: () => void;

    onSaveTask?: (
        payload: {
            title: string;
            description: string;
            dueDate: string;
            dueTime: string;
        },
        taskId?: number,
    ) => Promise<void>;

    onDeleteTask?: (taskId: number) => Promise<void>;
};

export default function TaskPanelModal({
    open,
    onClose,

    role = "student",
    style = false,
    facultyTasks = [],
    studentTasks = [],

    collegeSubjectId,
    facultyId,
    studentId,

    loading = false,

    onEditTask,
    onAddTask,
    onSaveTask,
    onDeleteTask,
}: TaskPanelModalProps) {

    const [editTask, setEditTask] = useState<Task | null>(null);
    const { collegeId, collegeBranchId, collegeAcademicYearId, collegeSemesterId } = useStudent();
    const [activeView, setActiveView] = useState<"student" | "faculty">(
        "faculty",
    );

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [studentTaskData, setStudentTaskData] = useState<Task[]>([]);
    const [facultyTaskData, setFacultyTaskData] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);


    const t = useTranslations("Dashboard.student");

    useEffect(() => {
        if (open && role === "student") {
            setActiveView("student");
        }
    }, [open]);

    const loadStudentTasks = async () => {
        if (!studentId || !open) return;

        try {

            setIsLoadingTasks(true);

            const tasks =
                await fetchStudentTasksForLoggedInStudent(studentId);

            const mappedTasks = tasks.map((task) => ({
                facultyTaskId: task.studentTaskId,
                title: task.taskTitle,
                description: task.description,
                time: task.time,
                date: task.date,
            }));

            setStudentTaskData(mappedTasks);
        } catch (error) {
            console.error("loadStudentTasks error:", error);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    useEffect(() => {

        if (role === "student") {
            loadStudentTasks();
        }

    }, [studentId, open]);

    const loadFacultyTasksForStudent = async () => {

        if (
            role !== "student" ||
            !open ||
            !collegeId ||
            !collegeBranchId ||
            !collegeAcademicYearId
        ) return;

        try {

            setIsLoadingTasks(true);

            const today = new Date().toISOString().split("T")[0];

            const tasks = await fetchFacultyTasksForStudent({
                date: today,
                collegeId,
                collegeBranchId,
                collegeAcademicYearId,
                collegeSemesterId,
            });

            const mappedTasks = tasks.map((task) => ({
                facultyTaskId: task.facultyTaskId,
                title: task.taskTitle,
                description: task.description,
                time: task.time,
                date: task.date,
            }));

            setFacultyTaskData(mappedTasks);

        } catch (error) {

            console.error(
                "loadFacultyTasksForStudent error:",
                error,
            );

        } finally {

            setIsLoadingTasks(false);
        }
    };

    useEffect(() => {

        loadFacultyTasksForStudent();

    }, [
        role,
        open,
        collegeId,
        collegeBranchId,
        collegeAcademicYearId,
        collegeSemesterId,
    ]);

    if (!open) return null;


    const handleConfirmDelete = async () => {
        if (taskToDeleteId === null) return;

        setIsDeleting(true);

        try {
            const res =
                role === "student"
                    ? await deactivateStudentTask(taskToDeleteId)
                    : await deactivateFacultyTask(taskToDeleteId);

            if (res.success) {
                await onDeleteTask?.(taskToDeleteId);

                toast.success("Task deleted successfully");

                setIsDeleteDialogOpen(false);
            } else {
                toast.error("Failed to delete task");
            }
        } catch (error) {
            console.error(error);

            toast.error("An error occurred while deleting");
        } finally {
            setIsDeleting(false);

            setTaskToDeleteId(null);
        }
    };

    const tasksToShow =
        role === "faculty"
            ? facultyTasks
            : activeView === "student"
                ? studentTaskData
                : facultyTaskData;

    const formatTime = (time: string) => {
        const [hourStr, minute] = time.split(":");

        let hour = Number(hourStr);

        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${ampm}`;
    };

    return (
        <>
            {/* BACKDROP */}
            {/* <div className="fixed top-0 left-0 right-0 bottom-0 z-[99999] bg-black/50 flex items-end lg:hidden"> */}
            <div className="fixed top-0 left-0 right-0 bottom-0 z-[99999] bg-black/50 flex items-center justify-center lg:hidden">

                {/* MODAL */}
                <div className="bg-[#F4F4F4] w-[90%] md:w-[60%] h-fit landscape:h-[80%] relative z-[999999] rounded-2xl overflow-hidden flex flex-col animate-slide-up">

                    {/* HEADER */}
                    <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shrink-0">

                        <div className="flex items-center gap-3">
                            <div className="bg-[#E7F7EE] rounded-full p-1">
                                <CheckCircle
                                    size={22}
                                    weight="fill"
                                    color="#43C17A"
                                />
                            </div>

                            <p className="text-[#16284F] font-semibold text-lg">
                                {t("My Tasks")}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">

                            {(role === "faculty" ||
                                (role === "student" && activeView === "student")) && (

                                    <button
                                        onClick={() => setOpenCreateTaskModal(true)}
                                        className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#43C17A] text-[#43C17A] text-xs font-medium hover:bg-[#43C17A] hover:text-white transition cursor-pointer"
                                    >
                                        + Add Task
                                    </button>
                                )}

                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={22} color="#16284F" />
                            </button>

                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 overflow-y-auto p-4">

                        <div
                            className={`bg-white rounded-md shadow-md p-4 min-h-[345px]`}
                        >

                            <div className="flex justify-between items-center mb-3">

                                <div className="flex items-center gap-3">

                                    {role === "student" && (
                                        <div className="flex items-center gap-0 text-sm font-semibold">

                                            <button
                                                onClick={() => setActiveView("faculty")}
                                                className={
                                                    activeView === "faculty"
                                                        ? "text-[#16284F] cursor-pointer"
                                                        : "text-gray-400 cursor-pointer"
                                                }
                                            >
                                                {t("Faculty Tasks")}
                                            </button>

                                            <span className="text-gray-300 ml-1 mr-1">/</span>

                                            <button
                                                onClick={() => setActiveView("student")}
                                                className={
                                                    activeView === "student"
                                                        ? "text-[#16284F] cursor-pointer"
                                                        : "text-gray-400 cursor-pointer"
                                                }
                                            >
                                                {t("My Tasks")}
                                            </button>
                                        </div>
                                    )}

                                    {role === "faculty" && (
                                        <p className="text-[#282828] font-medium">
                                            {t("My Tasks")}
                                        </p>
                                    )}
                                </div>

                                {onAddTask &&
                                    (role === "faculty" ||
                                        (role === "student" && activeView === "student")) && (

                                        <button
                                            onClick={() => {
                                                onAddTask?.();
                                            }}

                                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#43C17A] text-[#43C17A] text-xs font-medium hover:bg-[#43C17A] hover:text-white transition cursor-pointer"
                                        >
                                            {t("+ Add Task")}
                                        </button>
                                    )}
                            </div>

                            <div className="max-h-[65vh] overflow-y-auto pr-1">

                                {(isLoadingTasks || loading) && tasksToShow.length === 0 ? (
                                    <>
                                        <TaskCardShimmer />
                                        <TaskCardShimmer />
                                        <TaskCardShimmer />
                                    </>
                                ) : tasksToShow.length === 0 ? (

                                    <p className="text-xs text-gray-400 text-center mt-10">
                                        {t("No tasks available")}
                                    </p>

                                ) : (

                                    tasksToShow.map((task) => (

                                        <div
                                            key={task.facultyTaskId}
                                            className="bg-[#E8F8EF] rounded-md mt-3 p-2 flex justify-between"
                                        >

                                            <div className="w-[80%]">
                                                <h5 className="text-sm font-semibold text-[#16284F]">
                                                    {task.title}
                                                </h5>

                                                <p className="text-xs text-[#454545]">
                                                    {task.description}
                                                </p>
                                            </div>

                                            <div className="w-[20%] flex flex-col items-center justify-between">

                                                <p className="text-xs font-medium text-[#6B7280]">
                                                    {formatTime(task.time)}
                                                </p>

                                                <div className="flex gap-2">

                                                    {(role === "faculty" ||
                                                        (role === "student" &&
                                                            activeView === "student")) && (

                                                            <button
                                                                onClick={() => {
                                                                    if (onEditTask) {
                                                                        onEditTask(task);
                                                                    } else {
                                                                        setEditTask(task);

                                                                        // setOpenTaskModal?.(true);
                                                                        setOpenCreateTaskModal(true);
                                                                    }
                                                                }}
                                                                className="p-1 rounded-full hover:bg-[#DFF3E9] cursor-pointer"
                                                            >
                                                                <PencilSimple
                                                                    size={18}
                                                                    color="#16284F"
                                                                />
                                                            </button>
                                                        )}

                                                    {(role === "faculty" ||
                                                        (role === "student" &&
                                                            activeView === "student")) && (

                                                            <button
                                                                onClick={() => {
                                                                    setTaskToDeleteId(task.facultyTaskId);

                                                                    setIsDeleteDialogOpen(true);
                                                                }}
                                                                className="p-1 rounded-full hover:bg-red-100 cursor-pointer"
                                                            >
                                                                <Trash
                                                                    size={18}
                                                                    color="#EF4444"
                                                                />
                                                            </button>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TASK MODAL */}
            {onSaveTask && (
                <TaskModal
                    // open={openTaskModal}
                    open={openCreateTaskModal}
                    role={role}
                    collegeSubjectId={collegeSubjectId}
                    facultyId={facultyId}
                    studentId={studentId}
                    defaultValues={editTask}
                    onClose={() => {
                        // setOpenTaskModal?.(false);
                        setOpenCreateTaskModal(false);
                        setEditTask(null);
                    }}
                    onSave={async (payload, taskId) => {

                        await onSaveTask?.(payload, taskId);

                        if (role === "student") {

                            await loadStudentTasks();
                            await loadFacultyTasksForStudent();
                        }

                        setOpenCreateTaskModal(false);
                    }}
                />
            )}

            <ConfirmDeleteModal
                open={isDeleteDialogOpen}
                name="Task"
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setIsDeleteDialogOpen(false);
                    setTaskToDeleteId(null);
                }}
            />
        </>
    );
}