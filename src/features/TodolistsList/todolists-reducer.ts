import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todolists',
    initialState: initialState as Array<TodolistDomainType>,
    reducers: {
        removeTodolistAC: (state, action: PayloadAction<{ id: string }>) => {
            state.filter(tl => tl.id != action.payload.id)
        },
        addTodolistAC: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            return [{...action.payload.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        },
        changeTodolistTitleAC: (state, action: PayloadAction<{ id: string, title: string }>) => {
            return state.map(tl => tl.id === action.payload.id ? {...tl, title: action.payload.title} : tl)
        },
        changeTodolistFilterAC: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            return state.map(tl => tl.id === action.payload.id ? {...tl, filter: action.payload.filter} : tl)
        },
        changeTodolistEntityStatusAC: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            return state.map(tl => tl.id === action.payload.id ? {...tl, entityStatus: action.payload.status} : tl)
        },
        setTodolistsAC: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        },
    },
})
export const todolistsReducer = slice.reducer
export const {
    removeTodolistAC,
    addTodolistAC,
    changeTodolistTitleAC,
    changeTodolistFilterAC,
    changeTodolistEntityStatusAC,
    setTodolistsAC
} = slice.actions

// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({value: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC({todolists: res.data}))
                dispatch(setAppStatusAC({value: 'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        //preloader
        dispatch(setAppStatusAC({value: 'loading'}))
        //for disable todolist buttons
        dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC({id: todolistId}))
                //stop preloader
                dispatch(setAppStatusAC({value: 'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({value: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC({todolist: res.data.data.item}))
                dispatch(setAppStatusAC({value: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id: id, title: title}))
            })
    }
}

// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
