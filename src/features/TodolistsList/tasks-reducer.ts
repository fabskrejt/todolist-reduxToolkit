import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {addTodolistAC, removeTodolistAC, setTodolistsAC} from "./todolists-reducer";

const initialState: TasksStateType = {}

const slice = createSlice({
    name: 'todolists',
    initialState: initialState as TasksStateType,
    reducers: {
        removeTaskAC: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
            return {
                ...state,
                [action.payload.todolistId]: state[action.payload.todolistId].filter(t => t.id != action.payload.taskId)
            }
        },
        setTasksAC: (state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) => {
            return {...state, [action.payload.todolistId]: action.payload.tasks}
        },
        addTaskAC: (state, action: PayloadAction<{ task: TaskType }>) => {
            return {
                ...state,
                [action.payload.task.todoListId]: [action.payload.task, ...state[action.payload.task.todoListId]]
            }
        },
        updateTaskAC: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {
            return {
                ...state,
                [action.payload.todolistId]: state[action.payload.todolistId]
                    .map(t => t.id === action.payload.taskId ? {...t, ...action.payload.model} : t)
            }
        },
    },
    extraReducers: builder => {
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        })
        builder.addCase(addTodolistAC, (state, action) => {
            return {...state, [action.payload.todolist.id]: []}
        })
        builder.addCase(setTodolistsAC, (state, action) => {
            return action.payload.todolists.forEach(tl => {
                state[tl.id] = []
            })
        })
    }
})
export const tasksReducer = slice.reducer
export const {
    removeTaskAC,
    addTaskAC,
    updateTaskAC,
    setTasksAC
} = slice.actions

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({value: 'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC({tasks, todolistId}))
            dispatch(setAppStatusAC({value: 'succeeded'}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC({taskId, todolistId})
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({value: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC({task})
                dispatch(action)
                dispatch(setAppStatusAC({value: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }
        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId, model: domainModel, todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
